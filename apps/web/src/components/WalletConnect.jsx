import { truncateAddress } from '../lib/stellar';
import { useWallet } from '../lib/wallet-context';

export default function WalletConnect() {
  const { address, mode, connectFreighter, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-gray-800 px-3 py-1.5 font-mono text-xs text-gray-300">
          {mode === 'demo' && (
            <span className="mr-1.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
              Demo
            </span>
          )}
          {mode === 'freighter' && (
            <span className="mr-1.5 rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-400">
              Freighter
            </span>
          )}
          {truncateAddress(address)}
        </span>
        <button
          onClick={disconnect}
          className="rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          &#x2715;
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectFreighter}
      className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
    >
      Connect Wallet
    </button>
  );
}
