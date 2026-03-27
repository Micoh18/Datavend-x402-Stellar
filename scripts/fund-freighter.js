import { Keypair, Horizon, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from '@stellar/stellar-sdk';

const ISSUER_SECRET = 'SDOBPF4WBPF43BYRSWRNC3NRNVGPEBFNI27A6U73HIMXANT4L6T4NBKM';
const BUYER = 'GDSAGECLO2COE3Y7F3SVX5TEWRBSYV4ZQGMUGAECOJSLVFPP2ILJS5FA';

const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
const issuer = Keypair.fromSecret(ISSUER_SECRET);
const USDC = new Asset('USDC', issuer.publicKey());

// Check if trustline exists first
const acc = await horizon.loadAccount(BUYER);
const hasTrustline = acc.balances.some(b => b.asset_code === 'USDC' && b.asset_issuer === issuer.publicKey());

if (!hasTrustline) {
  console.log('No USDC trustline found — necesitás agregar trustline desde Freighter primero');
  console.log('Issuer: ' + issuer.publicKey());
  process.exit(1);
}

console.log('Trustline OK, sending 100 USDC...');
const issuerAcc = await horizon.loadAccount(issuer.publicKey());
const tx = new TransactionBuilder(issuerAcc, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(Operation.payment({ destination: BUYER, asset: USDC, amount: '100' }))
  .setTimeout(60)
  .build();
tx.sign(issuer);
await horizon.submitTransaction(tx);
console.log('Done! Sent 100 USDC to ' + BUYER);
