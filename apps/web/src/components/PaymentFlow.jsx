import { useState } from 'react';
import { txExplorerUrl } from '../lib/stellar';
import { DataVendClient } from '../lib/datavend-client';
import { useWallet } from '../lib/wallet-context';

export default function PaymentFlow({ sensor }) {
  const { address, secretKey, mode } = useWallet();
  const [status, setStatus] = useState('idle'); // idle | paying | received | error
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepLabels, setStepLabels] = useState([]);
  const [result, setResult] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  async function handleBuy() {
    if (!address) {
      setError('Connect your wallet first');
      setStatus('error');
      return;
    }

    setStatus('paying');
    setStepLabels([]);
    setCurrentStep(-1);
    setError(null);

    try {
      const client = new DataVendClient({
        secretKey: mode === 'demo' ? secretKey : undefined,
        publicKey: mode === 'freighter' ? address : undefined,
        onStep(stepIdx, label) {
          setCurrentStep(stepIdx);
          setStepLabels((prev) => {
            const next = [...prev];
            next[stepIdx] = label;
            return next;
          });
        },
      });

      const res = await client.queryWithPayment(sensor.endpoint);
      setResult(res.data);
      setTxHash(res.tx_hash);
      setStatus('received');
    } catch (err) {
      console.error('[PaymentFlow]', err);
      setError(err.message || 'Payment failed');
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setCurrentStep(-1);
    setStepLabels([]);
    setResult(null);
    setTxHash(null);
    setError(null);
  }

  if (status === 'idle') {
    return (
      <div className="space-y-2">
        <button
          onClick={handleBuy}
          disabled={!address}
          className={`w-full rounded-xl py-3 text-base font-semibold text-white transition-all active:scale-[0.98] ${
            address
              ? 'bg-violet-600 hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/20'
              : 'cursor-not-allowed bg-gray-700 text-gray-400'
          }`}
        >
          {address ? `Buy data now \u2014 ${sensor.price} USDC` : 'Connect wallet to buy'}
        </button>
        {!address && (
          <p className="text-center text-xs text-gray-500">
            Connect your wallet using the button in the navbar
          </p>
        )}
      </div>
    );
  }

  if (status === 'paying') {
    return (
      <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <p className="mb-3 text-sm font-medium text-violet-400">Processing x402 payment...</p>
        {stepLabels.map((label, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 font-mono text-sm transition-opacity ${
              i <= currentStep ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                i < currentStep
                  ? 'bg-emerald-400'
                  : i === currentStep
                  ? 'animate-pulse bg-violet-400'
                  : 'bg-gray-600'
              }`}
            />
            <span className={i < currentStep ? 'text-gray-400' : 'text-gray-200'}>
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'received' && result) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="text-lg">&#x2705;</span>
          <span className="font-semibold">Data received successfully!</span>
        </div>

        <pre className="overflow-x-auto rounded-lg bg-gray-950 p-4 font-mono text-xs text-gray-300">
          {JSON.stringify(result, null, 2)}
        </pre>

        {txHash && (
          <div className="flex items-center justify-between">
            <a
              href={txExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-violet-400 underline decoration-violet-400/30 hover:decoration-violet-400"
            >
              View tx on Stellar Expert &#x2192;
            </a>
            <button
              onClick={reset}
              className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Buy again
            </button>
          </div>
        )}
        {!txHash && (
          <button
            onClick={reset}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Buy again
          </button>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-red-400">&#x274C; {error}</p>
        <button
          onClick={reset}
          className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return null;
}
