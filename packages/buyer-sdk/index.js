/**
 * @datavend/buyer-sdk
 * Automatiza el flujo x402 completo: request -> 402 -> pagar en Stellar -> re-request con proof -> dato
 */

import {
  Keypair,
  Networks,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
  Horizon,
} from '@stellar/stellar-sdk';

const DEFAULT_USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export class DataVendClient {
  /**
   * @param {string} buyerSecretKey - Stellar secret key del comprador (S...)
   * @param {object} [options]
   * @param {string} [options.horizonUrl] - URL de Horizon (default: testnet)
   * @param {function} [options.logger] - Callback para logs (default: console.log)
   */
  constructor(buyerSecretKey, options = {}) {
    this.keypair = Keypair.fromSecret(buyerSecretKey);
    this.publicKey = this.keypair.publicKey();
    this.horizonUrl = options.horizonUrl || HORIZON_URL;
    this.server = new Horizon.Server(this.horizonUrl);
    this.log = options.logger || console.log;
  }

  /**
   * Flujo x402 completo: request -> 402 -> pagar -> re-request con proof -> dato
   * @param {string} sensorUrl - URL base del sensor (e.g. http://localhost:3001)
   * @returns {Promise<{data: object, tx_hash: string, paid_usdc: string}>}
   */
  async queryWithPayment(sensorUrl) {
    const dataUrl = `${sensorUrl}/data`;

    // Step 1: GET sin headers
    this.log(`[x402] GET ${dataUrl}`);
    const firstResponse = await fetch(dataUrl);

    // Step 2: Si 200, retornar data directamente (caso raro, sin pago requerido)
    if (firstResponse.ok) {
      const data = await firstResponse.json();
      this.log('[x402] Data received without payment (free endpoint)');
      return { data, tx_hash: null, paid_usdc: '0' };
    }

    // Step 3: Si 402, parsear instrucciones de pago
    if (firstResponse.status !== 402) {
      throw new Error(`[x402] Unexpected status: ${firstResponse.status} ${firstResponse.statusText}`);
    }

    const paymentInfo = await firstResponse.json();
    this.log('[x402] Received HTTP 402 — Payment required');

    if (!paymentInfo.accepts || paymentInfo.accepts.length === 0) {
      throw new Error('[x402] 402 response missing payment instructions (accepts array)');
    }

    const paymentOption = paymentInfo.accepts[0];
    const { maxAmountRequired, payTo, memo, assetIssuer } = paymentOption;

    this.log(`[x402] Price: ${maxAmountRequired} USDC → ${payTo.slice(0, 10)}...`);

    // Step 4-5: Construir, firmar y submit tx Stellar
    this.log('[x402] Building Stellar transaction...');
    const txHash = await this.submitPayment(paymentOption);
    this.log(`[x402] Payment submitted: ${txHash}`);

    // Step 6: Re-request con X-Payment header
    this.log('[x402] Re-requesting with X-Payment header...');
    const paymentProof = Buffer.from(
      JSON.stringify({
        x402Version: '1',
        scheme: 'exact',
        network: 'stellar-testnet',
        tx_hash: txHash,
      })
    ).toString('base64');

    const secondResponse = await fetch(dataUrl, {
      headers: { 'X-Payment': paymentProof },
    });

    // Step 7: Si 200, retornar data + tx info
    if (secondResponse.ok) {
      const data = await secondResponse.json();
      this.log('[x402] \u2713 Data received!');
      return { data, tx_hash: txHash, paid_usdc: maxAmountRequired };
    }

    // Step 8: Error
    const errorBody = await secondResponse.text();
    throw new Error(
      `[x402] Payment verified but data request failed: ${secondResponse.status} — ${errorBody}`
    );
  }

  /**
   * Construir, firmar y enviar pago USDC en Stellar Testnet
   * @param {object} paymentOption - Objeto de accepts[0] del 402
   * @returns {Promise<string>} tx_hash
   */
  async submitPayment(paymentOption) {
    const { maxAmountRequired, payTo, memo, assetIssuer } = paymentOption;

    // Use issuer from 402 response, fallback to default
    const usdcAsset = new Asset('USDC', assetIssuer || DEFAULT_USDC_ISSUER);

    // Cargar cuenta del buyer desde Horizon
    const account = await this.server.loadAccount(this.publicKey);

    // Construir transaccion
    const tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: payTo,
          asset: usdcAsset,
          amount: maxAmountRequired,
        })
      )
      .addMemo(Memo.text(memo))
      .setTimeout(120)
      .build();

    // Firmar con keypair del buyer
    tx.sign(this.keypair);

    // Submit a Horizon
    const result = await this.server.submitTransaction(tx);
    return result.hash;
  }
}
