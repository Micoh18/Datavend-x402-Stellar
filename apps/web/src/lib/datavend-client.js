/**
 * Browser-compatible DataVendClient
 * Adapted from packages/buyer-sdk for frontend use.
 * Supports: demo mode (secret key) and Freighter mode (external signer).
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

export class DataVendClient {
  /**
   * @param {object} opts
   * @param {string} [opts.secretKey]  — demo mode: sign with this key
   * @param {string} [opts.publicKey]  — required if using Freighter (no secret)
   * @param {string} [opts.horizonUrl]
   * @param {function} [opts.onStep]   — callback(stepIndex, label) for UI progress
   */
  constructor(opts = {}) {
    this.horizonUrl = opts.horizonUrl || import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
    this.server = new Horizon.Server(this.horizonUrl);
    this.onStep = opts.onStep || (() => {});

    if (opts.secretKey) {
      this.keypair = Keypair.fromSecret(opts.secretKey);
      this.publicKey = this.keypair.publicKey();
      this.mode = 'demo';
    } else if (opts.publicKey) {
      this.keypair = null;
      this.publicKey = opts.publicKey;
      this.mode = 'freighter';
    } else {
      throw new Error('DataVendClient requires either secretKey or publicKey');
    }
  }

  /**
   * Full x402 flow with step-by-step progress callbacks.
   * @param {string} sensorUrl — base URL of sensor (e.g. http://localhost:3001)
   * @returns {Promise<{data: object, tx_hash: string, paid_usdc: string}>}
   */
  async queryWithPayment(sensorUrl) {
    const dataUrl = `${sensorUrl}/data`;

    // Step 0: Initial request
    this.onStep(0, 'Sending GET /data request...');
    const firstResponse = await fetch(dataUrl);

    if (firstResponse.ok) {
      const data = await firstResponse.json();
      this.onStep(5, '\u2713 Data received (free endpoint)!');
      return { data, tx_hash: null, paid_usdc: '0' };
    }

    if (firstResponse.status !== 402) {
      throw new Error(`Unexpected status: ${firstResponse.status} ${firstResponse.statusText}`);
    }

    // Step 1: Parse 402
    this.onStep(1, 'Received HTTP 402 \u2014 Payment Required');
    const paymentInfo = await firstResponse.json();

    if (!paymentInfo.accepts || paymentInfo.accepts.length === 0) {
      throw new Error('402 response missing payment instructions');
    }

    const paymentOption = paymentInfo.accepts[0];
    const { maxAmountRequired, payTo, memo, assetIssuer } = paymentOption;

    // Step 2: Build tx
    this.onStep(2, 'Building Stellar transaction...');
    const usdcAsset = new Asset('USDC', assetIssuer || DEFAULT_USDC_ISSUER);
    const account = await this.server.loadAccount(this.publicKey);

    const txBuilder = new TransactionBuilder(account, {
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
      .setTimeout(120);

    const tx = txBuilder.build();

    // Step 3: Sign & submit
    this.onStep(3, `Submitting payment (${maxAmountRequired} USDC)...`);
    let txHash;

    if (this.mode === 'demo') {
      tx.sign(this.keypair);
      const result = await this.server.submitTransaction(tx);
      txHash = result.hash;
    } else {
      // Freighter mode — ask extension to sign
      const { signTransaction } = await import('@stellar/freighter-api');
      const xdr = tx.toXDR();
      const { signedTxXdr } = await signTransaction(xdr, {
        networkPassphrase: Networks.TESTNET,
      });
      const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
      const result = await this.server.submitTransaction(signedTx);
      txHash = result.hash;
    }

    // Step 4: Re-request with proof
    this.onStep(4, 'Re-requesting with X-Payment proof...');
    const paymentProof = btoa(
      JSON.stringify({
        x402Version: '1',
        scheme: 'exact',
        network: 'stellar-testnet',
        tx_hash: txHash,
      })
    );

    const secondResponse = await fetch(dataUrl, {
      headers: { 'X-Payment': paymentProof },
    });

    if (secondResponse.ok) {
      const data = await secondResponse.json();
      this.onStep(5, '\u2713 Data received!');
      return { data, tx_hash: txHash, paid_usdc: maxAmountRequired };
    }

    const errorBody = await secondResponse.text();
    throw new Error(`Payment verified but data request failed: ${secondResponse.status} \u2014 ${errorBody}`);
  }
}
