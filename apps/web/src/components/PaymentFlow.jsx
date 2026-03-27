import { useState, useRef, useEffect } from 'react';
import { txExplorerUrl, truncateAddress } from '../lib/stellar';
import { DataVendClient } from '../lib/datavend-client';
import { useWallet } from '../lib/wallet-context';

function ProtocolLine({ event }) {
  const { type, detail } = event;

  if (type === 'request') {
    return (
      <div className="space-y-0.5">
        <p className="text-vid font-bold">
          → {detail.method} {new URL(detail.url).pathname} HTTP/1.1
        </p>
        <p className="text-txt-muted text-[11px]">
          Host: {new URL(detail.url).host}
        </p>
        {detail.headers?.['X-Payment'] && (
          <>
            <p className="text-wine-light text-[11px]">
              X-Payment: {detail.headers['X-Payment'].slice(0, 40)}...
            </p>
            <details className="ml-2">
              <summary className="cursor-pointer text-[11px] text-txt-muted hover:text-txt-soft">
                ▸ decoded proof
              </summary>
              <pre className="mt-1 text-[11px] text-wine-light leading-relaxed">
{JSON.stringify(detail.proofDecoded, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    );
  }

  if (type === 'response') {
    const is402 = detail.status === 402;
    const is200 = detail.status === 200;
    const statusColor = is402
      ? 'text-amber-500'
      : is200
        ? 'text-vid'
        : 'text-red-500';

    return (
      <div className="space-y-0.5">
        <p className={`font-bold ${statusColor}`}>
          ← HTTP/1.1 {detail.status} {detail.statusText}
        </p>
        {is402 && detail.body?.accepts?.[0] && (
          <div className="ml-2 space-y-0.5 text-[11px]">
            <p className="text-txt-soft">
              x402Version: {detail.body.x402Version}
            </p>
            <p className="text-txt-soft">
              scheme: {detail.body.accepts[0].scheme}
            </p>
            <p className="text-txt-soft">
              network: {detail.body.accepts[0].network}
            </p>
            <p className="text-amber-500">
              amount: {detail.body.accepts[0].maxAmountRequired} {detail.body.accepts[0].asset}
            </p>
            <p className="text-txt-soft">
              payTo: {truncateAddress(detail.body.accepts[0].payTo)}
            </p>
            <p className="text-txt-soft">
              memo: {detail.body.accepts[0].memo}
            </p>
            <p className="text-txt-muted">
              expires: {new Date(detail.body.accepts[0].expires * 1000).toLocaleTimeString()}
            </p>
          </div>
        )}
        {is200 && detail.body && (
          <details className="ml-2" open>
            <summary className="cursor-pointer text-[11px] text-vid hover:text-vid-light">
              ▸ response body
            </summary>
            <pre className="mt-1 max-h-40 overflow-auto rounded bg-base/50 p-2 text-[11px] text-txt-soft leading-relaxed">
{JSON.stringify(detail.body, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  }

  if (type === 'tx') {
    if (detail.phase === 'building') {
      return (
        <div className="space-y-0.5 border-l-2 border-wine/30 pl-2">
          <p className="text-wine-light text-[11px] font-semibold">
            ⟳ Building Stellar transaction
          </p>
          <p className="text-[11px] text-txt-muted">
            {detail.amount} {detail.asset} → {truncateAddress(detail.destination)}
          </p>
          <p className="text-[11px] text-txt-muted">
            memo: {detail.memo} | network: {detail.network}
          </p>
        </div>
      );
    }
    if (detail.phase === 'signing') {
      return (
        <p className="border-l-2 border-wine/30 pl-2 text-[11px] text-wine-light">
          ⟳ Awaiting signature from {detail.signer}...
        </p>
      );
    }
    if (detail.phase === 'submitting') {
      return (
        <p className="border-l-2 border-wine/30 pl-2 text-[11px] text-wine-light animate-pulse">
          ⟳ Submitting to Stellar Testnet...
        </p>
      );
    }
    if (detail.phase === 'confirmed') {
      return (
        <div className="border-l-2 border-vid/50 pl-2 space-y-0.5">
          <p className="text-vid text-[11px] font-semibold">
            ✓ Transaction confirmed — ledger #{detail.ledger}
          </p>
          <a
            href={txExplorerUrl(detail.tx_hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-wine-light underline decoration-wine/30 hover:decoration-wine break-all"
          >
            tx: {detail.tx_hash}
          </a>
        </div>
      );
    }
  }

  return null;
}

function AgentSnippet({ sensor }) {
  const [copied, setCopied] = useState(false);
  const snippet = `# AI Agent x402 flow — zero human intervention
curl -s ${sensor.endpoint}/data
# → HTTP 402 { "accepts": [{ "payTo": "G...", "amount": "${sensor.price}" }] }

# Agent builds + signs Stellar tx automatically, then:
curl -s ${sensor.endpoint}/data \\
  -H "X-Payment: $(echo '{"x402Version":"1","tx_hash":"..."}' | base64)"
# → HTTP 200 { sensor data }`;

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs text-txt-muted hover:text-txt-soft">
        ▸ ¿Cómo lo usaría un agente IA?
      </summary>
      <div className="relative mt-2 rounded-lg bg-base border border-line p-3">
        <button
          onClick={copy}
          className="absolute top-2 right-2 rounded border border-line px-1.5 py-0.5 text-[10px] text-txt-muted hover:text-txt transition-colors"
        >
          {copied ? '✓' : 'copy'}
        </button>
        <pre className="text-[11px] text-txt-soft leading-relaxed whitespace-pre-wrap">
          {snippet}
        </pre>
        <p className="mt-2 text-[11px] text-txt-muted">
          Un agente IA con wallet propia ejecuta este flujo sin intervención
          humana — el protocolo HTTP 402 le dice cuánto pagar y a quién.
        </p>
      </div>
    </details>
  );
}

export default function PaymentFlow({ sensor }) {
  const { address } = useWallet();
  const [status, setStatus] = useState('idle');
  const [events, setEvents] = useState([]);
  const [result, setResult] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events]);

  function pushEvent(type, detail) {
    setEvents((prev) => [...prev, { type, detail, ts: Date.now() }]);
  }

  async function handleBuy() {
    if (!address) {
      setError('Conecta tu wallet primero');
      setStatus('error');
      return;
    }

    setStatus('paying');
    setEvents([]);
    setResult(null);
    setTxHash(null);
    setError(null);

    try {
      const client = new DataVendClient({
        publicKey: address,
        onProtocol(type, detail) {
          pushEvent(type, detail);
        },
      });

      const res = await client.queryWithPayment(sensor.endpoint);
      setResult(res.data);
      setTxHash(res.tx_hash);
      setStatus('received');
    } catch (err) {
      console.error('[PaymentFlow]', err);
      setError(err.message || 'Pago fallido');
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setEvents([]);
    setResult(null);
    setTxHash(null);
    setError(null);
  }

  if (status === 'idle') {
    return (
      <div className="space-y-3">
        <button
          onClick={handleBuy}
          disabled={!address}
          className={`w-full rounded-xl py-3 text-base font-semibold text-white transition-all active:scale-[0.98] ${
            address
              ? 'bg-vid hover:bg-vid-light hover:shadow-lg hover:shadow-vid/20'
              : 'cursor-not-allowed bg-elevated text-txt-muted'
          }`}
        >
          {address ? `Comprar dato — ${sensor.price} USDC` : 'Conecta wallet para comprar'}
        </button>
        {!address && (
          <p className="text-center text-xs text-txt-muted">
            Conectá tu wallet desde el botón en la barra de navegación
          </p>
        )}
        <AgentSnippet sensor={sensor} />
      </div>
    );
  }

  if (status === 'paying' || status === 'received') {
    return (
      <div className="space-y-3">
        {/* Terminal header */}
        <div className="flex items-center justify-between rounded-t-xl border border-line bg-elevated px-3 py-1.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-vid/60" />
            </div>
            <span className="font-mono text-[11px] text-txt-muted">
              x402 protocol — {new URL(sensor.endpoint).host}
            </span>
          </div>
          {status === 'received' && (
            <span className="rounded-full bg-vid/10 px-2 py-0.5 text-[10px] font-semibold text-vid">
              verified
            </span>
          )}
        </div>

        {/* Terminal body */}
        <div
          ref={terminalRef}
          className="-mt-3 max-h-[420px] overflow-y-auto rounded-b-xl border border-t-0 border-line bg-card p-3 font-mono space-y-2.5"
        >
          {events.map((evt, i) => (
            <ProtocolLine key={i} event={evt} />
          ))}
          {status === 'paying' && (
            <span className="inline-block h-3 w-1.5 animate-pulse bg-txt-muted" />
          )}
        </div>

        {/* Post-payment actions */}
        {status === 'received' && (
          <div className="flex items-center justify-between">
            {txHash && (
              <a
                href={txExplorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-wine-light underline decoration-wine/30 hover:decoration-wine"
              >
                Verificar en Stellar Expert →
              </a>
            )}
            <button
              onClick={reset}
              className="rounded-lg border border-line px-3 py-1.5 text-sm text-txt-muted transition-colors hover:text-txt"
            >
              Nueva consulta
            </button>
          </div>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <div>
          <p className="text-sm font-medium text-red-500">Pago fallido</p>
          <p className="mt-1 text-xs text-txt-soft">{error}</p>
        </div>

        {events.length > 0 && (
          <details>
            <summary className="cursor-pointer text-xs text-txt-muted hover:text-txt-soft">
              ▸ Protocol log ({events.length} events)
            </summary>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-line bg-card p-2 font-mono space-y-2">
              {events.map((evt, i) => (
                <ProtocolLine key={i} event={evt} />
              ))}
            </div>
          </details>
        )}

        <button
          onClick={reset}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-txt-muted transition-colors hover:text-txt"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return null;
}
