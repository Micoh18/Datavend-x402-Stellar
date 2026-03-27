import { useState } from 'react';
import { truncateAddress } from '../lib/stellar';
import { useWallet } from '../lib/wallet-context';

function FaucetButton({ address }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [msg, setMsg] = useState('');

  async function requestUSDC() {
    setStatus('loading');
    try {
      const res = await fetch(`/api/faucet?address=${address}`);
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.hint || data.error);
        setStatus('error');
        return;
      }
      setMsg(`+${data.amount} USDC`);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setMsg(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="relative">
      <button
        onClick={requestUSDC}
        disabled={status === 'loading'}
        className="rounded-lg bg-vid/15 px-2 py-1.5 text-[11px] font-semibold text-vid transition-colors hover:bg-vid/25 disabled:opacity-50"
        title="Recibir USDC de prueba (testnet)"
      >
        {status === 'loading' ? '...' : status === 'done' ? '✓' : 'Faucet USDC'}
      </button>
      {status === 'done' && (
        <span className="absolute -top-5 left-0 text-[10px] text-vid animate-pulse">{msg}</span>
      )}
      {status === 'error' && (
        <span className="absolute top-full left-0 mt-1 max-w-56 text-[10px] text-red-400">{msg}</span>
      )}
    </div>
  );
}

export default function WalletConnect() {
  const { address, error, connectFreighter, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <FaucetButton address={address} />
        <span className="rounded-full bg-elevated px-3 py-1.5 font-mono text-xs text-txt-soft">
          <span className="mr-1.5 rounded bg-wine/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-wine-light">
            Freighter
          </span>
          {truncateAddress(address)}
        </span>
        <button
          onClick={disconnect}
          className="rounded-lg px-2 py-1.5 text-xs text-txt-muted transition-colors hover:text-txt"
          title="Desconectar"
        >
          &#x2715;
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={connectFreighter}
        className="rounded-lg bg-wine px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-wine-light"
      >
        Conectar Wallet
      </button>
      {error && (
        <span className="max-w-48 text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}
