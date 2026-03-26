#!/usr/bin/env node

/**
 * DataVend — Wallet Setup Script
 *
 * Generates 4 Stellar testnet keypairs (3 sensors + 1 buyer),
 * funds them via Friendbot, creates a demo USDC issuer,
 * sets up trustlines, issues USDC, and saves everything to .env files.
 *
 * Usage: node scripts/setup-wallets.js
 */

import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

const horizon = new Horizon.Server(HORIZON_URL);

// ─── Helpers ─────────────────────────────────────────────────────────

function log(msg) {
  console.log(`  ${msg}`);
}

function logStep(step) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${step}`);
  console.log('='.repeat(60));
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fundWithFriendbot(publicKey, label) {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
      if (res.ok) {
        log(`[OK] ${label} funded: ${publicKey.slice(0, 8)}...`);
        return;
      }
      const body = await res.text();
      if (body.includes('createAccountAlreadyExist') || body.includes('op_already_exists')) {
        log(`[OK] ${label} already funded: ${publicKey.slice(0, 8)}...`);
        return;
      }
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    } catch (err) {
      if (attempt < maxRetries) {
        log(`[RETRY ${attempt}/${maxRetries}] ${label}: ${err.message}`);
        await sleep(3000 * attempt);
      } else {
        throw new Error(`Failed to fund ${label} after ${maxRetries} attempts: ${err.message}`);
      }
    }
  }
}

async function createTrustline(keypair, asset, label) {
  const account = await horizon.loadAccount(keypair.publicKey());

  // Check if trustline already exists
  const hasTrustline = account.balances.some(
    (b) => b.asset_code === asset.code && b.asset_issuer === asset.issuer
  );
  if (hasTrustline) {
    log(`[OK] ${label} trustline for ${asset.code} already exists`);
    return;
  }

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset }))
    .setTimeout(60)
    .build();

  tx.sign(keypair);
  await horizon.submitTransaction(tx);
  log(`[OK] ${label} trustline created for ${asset.code}`);
}

async function issueTokens(issuerKeypair, destPublicKey, asset, amount, label) {
  const account = await horizon.loadAccount(issuerKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: destPublicKey,
        asset,
        amount: String(amount),
      })
    )
    .setTimeout(60)
    .build();

  tx.sign(issuerKeypair);
  await horizon.submitTransaction(tx);
  log(`[OK] Sent ${amount} ${asset.code} to ${label}`);
}

async function verifyAccount(publicKey, label, usdcIssuer) {
  const account = await horizon.loadAccount(publicKey);
  const xlm = account.balances.find((b) => b.asset_type === 'native');
  const usdc = account.balances.find(
    (b) => b.asset_code === 'USDC' && b.asset_issuer === usdcIssuer
  );

  log(`${label}:`);
  log(`  Address: ${publicKey}`);
  log(`  XLM:    ${xlm ? xlm.balance : '0'}`);
  log(`  USDC:   ${usdc ? usdc.balance : 'no trustline'}`);
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('\n  DataVend Wallet Setup');
  console.log('  Stellar Testnet\n');

  // ── Step 1: Generate keypairs ─────────────────────────────────────

  logStep('Step 1 — Generating keypairs (4 accounts + 1 USDC issuer)');

  const wallets = {
    sensor_001: Keypair.random(),
    sensor_002: Keypair.random(),
    sensor_003: Keypair.random(),
    buyer_test: Keypair.random(),
  };

  // We create our own USDC issuer on testnet for the hackathon demo.
  // This is simpler and more reliable than depending on a third-party USDC issuer.
  const usdcIssuerKeypair = Keypair.random();

  for (const [name, kp] of Object.entries(wallets)) {
    log(`${name}: ${kp.publicKey()}`);
  }
  log(`usdc_issuer: ${usdcIssuerKeypair.publicKey()}`);

  const USDC = new Asset('USDC', usdcIssuerKeypair.publicKey());

  // ── Step 2: Fund all accounts with Friendbot ──────────────────────

  logStep('Step 2 — Funding with Friendbot (5 accounts)');

  // Fund all wallets + the issuer
  const allToFund = [
    ...Object.entries(wallets).map(([name, kp]) => ({ key: kp.publicKey(), label: name })),
    { key: usdcIssuerKeypair.publicKey(), label: 'usdc_issuer' },
  ];

  for (const { key, label } of allToFund) {
    await fundWithFriendbot(key, label);
    await sleep(1500); // rate limiting
  }

  // ── Step 3: Create USDC trustlines ────────────────────────────────

  logStep('Step 3 — Creating USDC trustlines');

  for (const [name, kp] of Object.entries(wallets)) {
    await createTrustline(kp, USDC, name);
    await sleep(500);
  }

  // ── Step 4: Issue USDC tokens ─────────────────────────────────────

  logStep('Step 4 — Issuing demo USDC from our issuer');

  // Buyer gets 1000 USDC for testing purchases
  await issueTokens(usdcIssuerKeypair, wallets.buyer_test.publicKey(), USDC, '1000', 'buyer_test');
  await sleep(500);

  // Each sensor gets a small amount for verification
  for (const name of ['sensor_001', 'sensor_002', 'sensor_003']) {
    await issueTokens(usdcIssuerKeypair, wallets[name].publicKey(), USDC, '10', name);
    await sleep(500);
  }

  // ── Step 5: Save .env files ───────────────────────────────────────

  logStep('Step 5 — Saving credentials to .env files');

  const USDC_ISSUER_PUB = usdcIssuerKeypair.publicKey();

  // Root .env
  const rootEnv = `# DataVend — Stellar Testnet Credentials
# Generated by scripts/setup-wallets.js on ${new Date().toISOString()}
# DO NOT COMMIT THIS FILE

# Sensor keypairs
SENSOR_001_PUBLIC=${wallets.sensor_001.publicKey()}
SENSOR_001_SECRET=${wallets.sensor_001.secret()}
SENSOR_002_PUBLIC=${wallets.sensor_002.publicKey()}
SENSOR_002_SECRET=${wallets.sensor_002.secret()}
SENSOR_003_PUBLIC=${wallets.sensor_003.publicKey()}
SENSOR_003_SECRET=${wallets.sensor_003.secret()}

# Buyer keypair
BUYER_PUBLIC=${wallets.buyer_test.publicKey()}
BUYER_SECRET=${wallets.buyer_test.secret()}

# USDC Testnet (demo issuer — created by this script)
USDC_ISSUER=${USDC_ISSUER_PUB}
USDC_ISSUER_SECRET=${usdcIssuerKeypair.secret()}

# Network
STELLAR_NETWORK=testnet
HORIZON_URL=${HORIZON_URL}

# Soroban Contract (set after deploy)
CONTRACT_ID=
`;

  writeFileSync(resolve(ROOT, '.env'), rootEnv);
  log('[OK] Saved root .env');

  // Sensor node .env files
  const sensorNodeDir = resolve(ROOT, 'packages', 'sensor-node');
  const sensorConfigs = [
    { file: '.env', name: 'sensor_001', port: 3001, type: 'temperature', desc: 'Temperatura viñedo Valle de Uco' },
    { file: '.env.sensor_002', name: 'sensor_002', port: 3002, type: 'humidity', desc: 'Humedad viñedo Valle de Uco' },
    { file: '.env.sensor_003', name: 'sensor_003', port: 3003, type: 'ph', desc: 'pH suelo viñedo Valle de Uco' },
  ];

  for (const s of sensorConfigs) {
    const content = `# DataVend Sensor Node — ${s.name}
# Generated by scripts/setup-wallets.js
SENSOR_ID=${s.name}
SENSOR_TYPE=${s.type}
SENSOR_DESCRIPTION=${s.desc}
SENSOR_PRICE_USDC=0.005
PORT=${s.port}

# Stellar keys
STELLAR_PUBLIC_KEY=${wallets[s.name].publicKey()}
STELLAR_SECRET_KEY=${wallets[s.name].secret()}

# USDC
USDC_ISSUER=${USDC_ISSUER_PUB}

# Network
STELLAR_NETWORK=testnet
HORIZON_URL=${HORIZON_URL}

# Soroban Contract (set after deploy)
CONTRACT_ID=
`;
    writeFileSync(resolve(sensorNodeDir, s.file), content);
    log(`[OK] Saved packages/sensor-node/${s.file}`);
  }

  // ── Step 6: Verify all accounts ───────────────────────────────────

  logStep('Step 6 — Verifying accounts on Horizon');

  for (const [name, kp] of Object.entries(wallets)) {
    await verifyAccount(kp.publicKey(), name, USDC_ISSUER_PUB);
  }

  // ── Done ──────────────────────────────────────────────────────────

  console.log(`\n${'='.repeat(60)}`);
  console.log('  Setup complete!');
  console.log(`${'='.repeat(60)}`);
  console.log(`\n  USDC Issuer: ${USDC_ISSUER_PUB}`);
  console.log('  All 4 accounts funded with XLM, USDC trustlines created.');
  console.log('  Buyer has 1000 USDC, each sensor has 10 USDC.');
  console.log('  Credentials saved to .env files.\n');
  console.log('  Next steps:');
  console.log('  1. cd packages/sensor-node && npm start');
  console.log('  2. curl http://localhost:3001/data  (expect 402)');
  console.log('  3. curl http://localhost:3001/info   (public metadata)\n');
}

main().catch((err) => {
  console.error('\n  [FATAL]', err.message || err);
  process.exit(1);
});
