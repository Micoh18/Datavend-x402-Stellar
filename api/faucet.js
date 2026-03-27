import { Keypair, Horizon, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const ISSUER_SECRET = process.env.USDC_ISSUER_SECRET;
const FAUCET_AMOUNT = '10';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const address = req.query.address;
  if (!address || !address.startsWith('G') || address.length !== 56) {
    return res.status(400).json({ error: 'Invalid Stellar address' });
  }

  if (!ISSUER_SECRET) {
    return res.status(500).json({ error: 'Faucet not configured' });
  }

  const horizon = new Horizon.Server(HORIZON_URL);
  const issuer = Keypair.fromSecret(ISSUER_SECRET);
  const USDC = new Asset('USDC', issuer.publicKey());

  try {
    // Check if account has USDC trustline
    const acc = await horizon.loadAccount(address);
    const hasTrustline = acc.balances.some(
      (b) => b.asset_code === 'USDC' && b.asset_issuer === issuer.publicKey()
    );

    if (!hasTrustline) {
      return res.status(400).json({
        error: 'No USDC trustline',
        issuer: issuer.publicKey(),
        hint: 'Add USDC trustline in Freighter: Manage Assets → Add Asset → Code: USDC, Issuer: ' + issuer.publicKey(),
      });
    }

    // Send USDC
    const issuerAcc = await horizon.loadAccount(issuer.publicKey());
    const tx = new TransactionBuilder(issuerAcc, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination: address, asset: USDC, amount: FAUCET_AMOUNT }))
      .setTimeout(60)
      .build();

    tx.sign(issuer);
    const result = await horizon.submitTransaction(tx);

    return res.status(200).json({
      success: true,
      amount: FAUCET_AMOUNT,
      asset: 'USDC',
      tx_hash: result.hash,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
