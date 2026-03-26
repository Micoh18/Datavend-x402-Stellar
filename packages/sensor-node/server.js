import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Keypair } from '@stellar/stellar-sdk';
import { Horizon } from '@stellar/stellar-sdk';

const app = express();
app.use(express.json());
app.use(cors());

// ─── Config ──────────────────────────────────────────────────────────

const SENSOR_ID = process.env.SENSOR_ID || 'sensor_001';
const SENSOR_SECRET_KEY = process.env.STELLAR_SECRET_KEY || process.env.SENSOR_SECRET_KEY;
const SENSOR_PRICE_USDC = process.env.SENSOR_PRICE_USDC || '0.005';
const SENSOR_DESCRIPTION = process.env.SENSOR_DESCRIPTION || 'Temperatura viñedo';
const PORT = process.env.PORT || 3001;
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';

// USDC issuer — reads from env (setup-wallets.js creates a custom testnet issuer)
const USDC_ISSUER = process.env.USDC_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

let sensorKeypair;
try {
  sensorKeypair = Keypair.fromSecret(SENSOR_SECRET_KEY);
} catch {
  console.warn('WARNING: SENSOR_SECRET_KEY not set or invalid. Generating random keypair for dev.');
  sensorKeypair = Keypair.random();
}

const horizon = new Horizon.Server(HORIZON_URL);
const usedPayments = new Set(); // anti-replay

// ─── x402 Middleware ─────────────────────────────────────────────────

async function x402Middleware(req, res, next) {
  const paymentHeader = req.headers['x-payment'];

  if (!paymentHeader) {
    return res.status(402).json({
      x402Version: '1',
      error: 'Payment required',
      accepts: [
        {
          scheme: 'exact',
          network: 'stellar-testnet',
          maxAmountRequired: SENSOR_PRICE_USDC,
          asset: 'USDC',
          assetIssuer: USDC_ISSUER,
          payTo: sensorKeypair.publicKey(),
          memo: `dv-${SENSOR_ID}`,
          memoType: 'text',
          expires: Math.floor(Date.now() / 1000) + 300,
        },
      ],
    });
  }

  // Validate payment
  try {
    const decoded = Buffer.from(paymentHeader, 'base64').toString();
    const payment = JSON.parse(decoded);
    await validateStellarPayment(payment);
    next();
  } catch (err) {
    return res.status(402).json({ error: err.message });
  }
}

// ─── Payment Validation ─────────────────────────────────────────────

async function validateStellarPayment(payment) {
  const { tx_hash } = payment;

  if (!tx_hash) {
    throw new Error('Missing tx_hash in payment');
  }

  // 1. Anti-replay
  if (usedPayments.has(tx_hash)) {
    throw new Error('Payment already used');
  }

  // 2. Fetch transaction from Horizon
  const tx = await horizon.transactions().transaction(tx_hash).call();

  // 3. Fetch operations and find valid payment
  const ops = await horizon.operations().forTransaction(tx_hash).call();
  const paymentOp = ops.records.find(
    (op) =>
      op.type === 'payment' &&
      op.to === sensorKeypair.publicKey() &&
      op.asset_code === 'USDC' &&
      op.asset_issuer === USDC_ISSUER
  );

  if (!paymentOp) {
    throw new Error('No valid USDC payment operation found in transaction');
  }

  // 4. Verify amount
  const paidAmount = parseFloat(paymentOp.amount);
  const requiredAmount = parseFloat(SENSOR_PRICE_USDC);
  if (paidAmount < requiredAmount) {
    throw new Error(`Insufficient payment: ${paidAmount} < ${requiredAmount} USDC`);
  }

  // 5. Verify memo
  if (tx.memo !== `dv-${SENSOR_ID}`) {
    throw new Error(`Invalid memo: expected "dv-${SENSOR_ID}", got "${tx.memo}"`);
  }

  // 6. Mark as used
  usedPayments.add(tx_hash);
}

// ─── Sensor Data Generator ──────────────────────────────────────────

function generateSensorData(sensorId) {
  const generators = {
    sensor_001: () => ({
      sensor_id: 'sensor_001',
      type: 'temperature',
      value: +(17.5 + Math.random() * 3).toFixed(2),
      unit: 'celsius',
      location: 'Viñedo Valle de Uco, Mendoza',
      block: 'Malbec Block A',
      altitude_m: 1050,
      timestamp: new Date().toISOString(),
      verified: true,
    }),
    sensor_002: () => ({
      sensor_id: 'sensor_002',
      type: 'soil_humidity',
      value: +(58 + Math.random() * 10).toFixed(1),
      unit: 'percent',
      depth_cm: 30,
      soil_type: 'franco-arcilloso',
      location: 'Viñedo Valle de Uco, Mendoza',
      block: 'Malbec Block A',
      timestamp: new Date().toISOString(),
      verified: true,
    }),
    sensor_003: () => ({
      sensor_id: 'sensor_003',
      type: 'fermentation_ph',
      value: +(3.2 + Math.random() * 0.4).toFixed(2),
      tank_id: 'T-07',
      wine_variety: 'Malbec',
      fermentation_day: 4,
      status: 'active_fermentation',
      timestamp: new Date().toISOString(),
      verified: true,
    }),
  };

  return generators[sensorId] ? generators[sensorId]() : null;
}

// ─── Routes ──────────────────────────────────────────────────────────

// Protected: sensor data behind x402 paywall
app.get('/data', x402Middleware, (req, res) => {
  const data = generateSensorData(SENSOR_ID);
  if (!data) {
    return res.status(404).json({ error: 'Unknown sensor ID' });
  }

  res.json({
    ...data,
    payment_verified: true,
    sensor_public_key: sensorKeypair.publicKey(),
  });
});

// Public: sensor metadata
app.get('/info', (req, res) => {
  res.json({
    sensor_id: SENSOR_ID,
    description: SENSOR_DESCRIPTION,
    price_usdc: SENSOR_PRICE_USDC,
    public_key: sensorKeypair.publicKey(),
    network: 'stellar-testnet',
    x402_endpoint: '/data',
  });
});

// Public: health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ─── Start ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  DataVend Sensor Node [${SENSOR_ID}] running on :${PORT}`);
  console.log(`  Public key: ${sensorKeypair.publicKey()}`);
  console.log(`  Price: ${SENSOR_PRICE_USDC} USDC per query`);
  console.log(`  Horizon: ${HORIZON_URL}\n`);
});
