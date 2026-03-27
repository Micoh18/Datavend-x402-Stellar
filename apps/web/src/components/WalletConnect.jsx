import { truncateAddress } from '../lib/stellar';
import { useWallet } from '../lib/wallet-context';

export default function WalletConnect() {
  const { address, error, connectFreighter, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-2">
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
