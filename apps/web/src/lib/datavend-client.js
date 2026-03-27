/**
 * Browser-compatible DataVendClient
 * Emits real protocol data at each step for transparent x402 visualization.
 */
import {
  Networks,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
  Horizon,
} from '@stellar/stellar-sdk';

const DEFAULT_USDC_ISSUER = 'GDRYVCUS7E4K5QDZYWUGRD35SEQJ5MYOQIBUS67GO6DLDZ5WIXDLNGKR';

/**
 * @callback OnProtocolEvent
 * @param {string} type - Event type: 'request' | 'response' | 'tx' | 'complete' | 'info'
 * @param {object} detail - Real protocol data for this event
 */

export class DataVendClient {
  /**
   * @param {object} opts
   * @param {string} opts.publicKey
   * @param {string} [opts.horizonUrl]
   * @param {OnProtocolEvent} [opts.onProtocol] - callback(type, detail) with real data
   */
  constructor(opts = {}) {
    if (!opts.publicKey) {
      throw new Error('DataVendClient requires publicKey (connect Freighter first)');
    }
    this.horizonUrl = opts.horizonUrl || import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
    this.server = new Horizon.Server(this.horizonUrl);
    this.onProtocol = opts.onProtocol || (() => {});
    this.publicKey = opts.publicKey;
  }

  /**
   * Full x402 flow emitting real protocol events.
   * @param {string} sensorUrl
   * @returns {Promise<{data: object, tx_hash: string, paid_usdc: string}>}
   */
  async queryWithPayment(sensorUrl) {
    // sensorUrl is the full endpoint URL (e.g. "https://host/api/data?sensor=X")
    const dataUrl = sensorUrl;

    // 1. Initial GET — no payment header
    this.onProtocol('request', {
      method: 'GET',
      url: dataUrl,
      headers: {},
    });

    const firstResponse = await fetch(dataUrl);

    if (firstResponse.ok) {
      const data = await firstResponse.json();
      this.onProtocol('response', { status: 200, statusText: 'OK', body: data });
      return { data, tx_hash: null, paid_usdc: '0' };
    }

    if (firstResponse.status !== 402) {
      throw new Error(`Unexpected status: ${firstResponse.status} ${firstResponse.statusText}`);
    }

    // 2. Received 402 — show the real payment instructions
    const paymentInfo = await firstResponse.json();
    this.onProtocol('response', {
      status: 402,
      statusText: 'Payment Required',
      body: paymentInfo,
    });

    if (!paymentInfo.accepts || paymentInfo.accepts.length === 0) {
      throw new Error('402 response missing payment instructions');
    }

    const paymentOption = paymentInfo.accepts[0];
    const { maxAmountRequired, payTo, memo, assetIssuer } = paymentOption;

    // 3. Build Stellar transaction
    this.onProtocol('tx', {
      phase: 'building',
      destination: payTo,
      amount: maxAmountRequired,
      asset: 'USDC',
      memo,
      network: 'stellar-testnet',
    });

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

    // 4. Sign via Freighter
    this.onProtocol('tx', { phase: 'signing', signer: 'Freighter' });

    const { signTransaction } = await import('@stellar/freighter-api');
    const xdr = tx.toXDR();
    const { signedTxXdr, error: signError } = await signTransaction(xdr, {
      networkPassphrase: Networks.TESTNET,
    });

    if (signError || !signedTxXdr) {
      throw new Error(signError || 'Firma rechazada en Freighter');
    }

    // 5. Submit to Stellar
    this.onProtocol('tx', { phase: 'submitting' });
    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
    const result = await this.server.submitTransaction(signedTx);
    const txHash = result.hash;

    this.onProtocol('tx', {
      phase: 'confirmed',
      tx_hash: txHash,
      ledger: result.ledger,
    });

    // 6. Re-request with X-Payment proof
    const proofPayload = {
      x402Version: '1',
      scheme: 'exact',
      network: 'stellar-testnet',
      tx_hash: txHash,
    };
    const paymentProof = btoa(JSON.stringify(proofPayload));

    this.onProtocol('request', {
      method: 'GET',
      url: dataUrl,
      headers: { 'X-Payment': paymentProof },
      proofDecoded: proofPayload,
    });

    const secondResponse = await fetch(dataUrl, {
      headers: { 'X-Payment': paymentProof },
    });

    if (secondResponse.ok) {
      const data = await secondResponse.json();
      this.onProtocol('response', { status: 200, statusText: 'OK', body: data });
      return { data, tx_hash: txHash, paid_usdc: maxAmountRequired };
    }

    const errorBody = await secondResponse.text();
    throw new Error(`Payment verified but data request failed: ${secondResponse.status} — ${errorBody}`);
  }
}
