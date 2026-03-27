import { Horizon, Keypair } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const USDC_ISSUER = process.env.USDC_ISSUER || 'GDRYVCUS7E4K5QDZYWUGRD35SEQJ5MYOQIBUS67GO6DLDZ5WIXDLNGKR';

// Each sensor has its own keypair (set via Vercel env vars)
const SENSORS = {
  sensor_001: {
    secret: process.env.SENSOR_001_SECRET,
    price: '0.005',
    description: 'Temperatura viñedo Valle de Uco',
  },
  sensor_002: {
    secret: process.env.SENSOR_002_SECRET,
    price: '0.005',
    description: 'Humedad suelo Malbec Block A',
  },
  sensor_003: {
    secret: process.env.SENSOR_003_SECRET,
    price: '0.010',
    description: 'pH tanque fermentación bodega',
  },
};

// Sensor data generators
function generateData(sensorId) {
  const now = new Date().toISOString();
  const generators = {
    sensor_001: () => ({
      sensor_id: 'sensor_001',
      type: 'temperature',
      value: +(17.5 + Math.random() * 3).toFixed(2),
      unit: 'celsius',
      location: 'Viñedo Valle de Uco, Mendoza',
      block: 'Malbec Block A',
      altitude_m: 1050,
      timestamp: now,
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
      timestamp: now,
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
      timestamp: now,
      verified: true,
    }),
  };
  return generators[sensorId]?.() || null;
}

async function validatePayment(payment, sensorCfg, sensorId) {
  const { tx_hash } = payment;
  if (!tx_hash) throw new Error('Missing tx_hash in payment');

  const horizon = new Horizon.Server(HORIZON_URL);

  // Fetch tx from Horizon — this proves the tx exists on-chain
  const tx = await horizon.transactions().transaction(tx_hash).call();

  // Verify tx is recent (last 5 min) — serverless anti-replay
  const txTime = new Date(tx.created_at).getTime();
  const now = Date.now();
  if (now - txTime > 5 * 60 * 1000) {
    throw new Error('Transaction too old (>5min) — possible replay');
  }

  // Verify payment operation
  const ops = await horizon.operations().forTransaction(tx_hash).call();
  const keypair = Keypair.fromSecret(sensorCfg.secret);

  const paymentOp = ops.records.find(
    (op) =>
      op.type === 'payment' &&
      op.to === keypair.publicKey() &&
      op.asset_code === 'USDC' &&
      op.asset_issuer === USDC_ISSUER
  );

  if (!paymentOp) {
    throw new Error('No valid USDC payment to this sensor found in transaction');
  }

  if (parseFloat(paymentOp.amount) < parseFloat(sensorCfg.price)) {
    throw new Error(`Insufficient: paid ${paymentOp.amount}, required ${sensorCfg.price} USDC`);
  }

  // Verify memo
  if (tx.memo !== `dv-${sensorId}`) {
    throw new Error(`Invalid memo: expected "dv-${sensorId}", got "${tx.memo}"`);
  }
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sensorId = req.query.sensor || 'sensor_001';
  const sensorCfg = SENSORS[sensorId];

  if (!sensorCfg) {
    return res.status(404).json({ error: `Unknown sensor: ${sensorId}` });
  }

  if (!sensorCfg.secret) {
    return res.status(500).json({ error: `Sensor ${sensorId} not configured (missing secret key)` });
  }

  const paymentHeader = req.headers['x-payment'];
  const keypair = Keypair.fromSecret(sensorCfg.secret);

  // No payment header → return 402
  if (!paymentHeader) {
    return res.status(402).json({
      x402Version: '1',
      error: 'Payment required',
      accepts: [
        {
          scheme: 'exact',
          network: 'stellar-testnet',
          maxAmountRequired: sensorCfg.price,
          asset: 'USDC',
          assetIssuer: USDC_ISSUER,
          payTo: keypair.publicKey(),
          memo: `dv-${sensorId}`,
          memoType: 'text',
          expires: Math.floor(Date.now() / 1000) + 300,
        },
      ],
    });
  }

  // Has payment header → validate on-chain
  try {
    const decoded = Buffer.from(paymentHeader, 'base64').toString();
    const payment = JSON.parse(decoded);
    await validatePayment(payment, sensorCfg, sensorId);
  } catch (err) {
    return res.status(402).json({
      error: `Payment validation failed: ${err.message}`,
    });
  }

  // Payment verified — return data
  const data = generateData(sensorId);
  return res.status(200).json({
    ...data,
    payment_verified: true,
    sensor_public_key: keypair.publicKey(),
  });
}
