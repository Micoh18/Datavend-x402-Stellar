#!/usr/bin/env node

/**
 * DataVend Buyer CLI — prueba el flujo x402 completo contra un sensor node
 *
 * Uso:
 *   node cli.js --sensor http://localhost:3001 --key S_BUYER_SECRET
 *   node cli.js --sensor http://localhost:3001   (usa BUYER_SECRET_KEY del env)
 */

import { DataVendClient } from './index.js';

// ── Parse args ─────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--sensor' && args[i + 1]) opts.sensor = args[++i];
    else if (args[i] === '--key' && args[i + 1]) opts.key = args[++i];
    else if (args[i] === '--help' || args[i] === '-h') opts.help = true;
  }
  return opts;
}

const opts = parseArgs();

if (opts.help) {
  console.log(`
DataVend Buyer CLI — compra datos de sensores via x402 sobre Stellar

Uso:
  node cli.js --sensor <URL> [--key <STELLAR_SECRET>]

Opciones:
  --sensor   URL del sensor node (requerido)
  --key      Secret key de Stellar del buyer (o env BUYER_SECRET_KEY)
  --help     Muestra esta ayuda

Ejemplo:
  node cli.js --sensor http://localhost:3001 --key SBUYER...
`);
  process.exit(0);
}

const sensorUrl = opts.sensor;
const secretKey = opts.key || process.env.BUYER_SECRET_KEY;

if (!sensorUrl) {
  console.error('Error: --sensor <URL> es requerido');
  console.error('Usa --help para ver opciones');
  process.exit(1);
}

if (!secretKey) {
  console.error('Error: Se necesita --key <SECRET> o la variable de entorno BUYER_SECRET_KEY');
  process.exit(1);
}

// ── Run ────────────────────────────────────────────────────────────

console.log('');
console.log('='.repeat(60));
console.log('  DataVend Buyer CLI — x402 Sensor Data Purchase');
console.log('='.repeat(60));
console.log('');

try {
  const client = new DataVendClient(secretKey, {
    logger: (msg) => console.log(msg),
  });

  console.log(`Buyer: ${client.publicKey.slice(0, 10)}...${client.publicKey.slice(-6)}`);
  console.log(`Sensor: ${sensorUrl}`);
  console.log('');

  const { data, tx_hash, paid_usdc } = await client.queryWithPayment(sensorUrl);

  console.log('');
  console.log(JSON.stringify(data, null, 2));
  console.log('');

  if (tx_hash) {
    console.log(`TX: https://stellar.expert/explorer/testnet/tx/${tx_hash}`);
    console.log(`Paid: ${paid_usdc} USDC`);
  } else {
    console.log('(No payment was required)');
  }

  console.log('');
} catch (err) {
  console.error('');
  console.error(`Error: ${err.message}`);

  // Mostrar detalles de error de Horizon si existen
  if (err.response?.data?.extras?.result_codes) {
    console.error('Horizon result codes:', JSON.stringify(err.response.data.extras.result_codes));
  }

  process.exit(1);
}
