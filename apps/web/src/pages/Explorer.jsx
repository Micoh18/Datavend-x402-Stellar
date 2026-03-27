import { useState, useEffect } from 'react';
import { fetchRecentTransactions, txExplorerUrl, truncateAddress } from '../lib/stellar';

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-5 w-28 rounded" />
          <div className="skeleton h-5 w-32 rounded" />
          <div className="skeleton h-5 w-10 rounded" />
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-5 flex-1 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function Explorer() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions(15).then((records) => {
      setTxs(records);
      setLoading(false);
    });
  }, []);

  const totalFees = txs.reduce(
    (sum, tx) => sum + parseInt(tx.fee_charged || '0', 10) / 10_000_000,
    0
  );

  return (
    <div className="page-enter mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 font-heading text-3xl font-bold text-txt-strong">Explorador de transacciones</h1>
      <p className="mb-8 text-txt-soft">
        Transacciones recientes en Stellar Testnet. En producci&oacute;n filtra solo las del contrato DataVend.
      </p>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Stats sidebar */}
        <aside className="flex shrink-0 flex-row gap-4 lg:w-48 lg:flex-col">
          <StatCard label="Transacciones" value={loading ? '--' : txs.length} />
          <StatCard label="Fee total" value={loading ? '--' : `${totalFees.toFixed(5)} XLM`} />
          <StatCard label="Red" value="Testnet" accent />
        </aside>

        {/* Table */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="rounded-xl border border-line bg-card p-6">
              <TableSkeleton />
            </div>
          ) : txs.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-line bg-card py-16 text-center">
              <p className="font-heading text-4xl font-bold text-txt-muted">&#x1F50D;</p>
              <p className="mt-3 text-txt-soft">No se encontraron transacciones</p>
              <p className="mt-1 text-sm text-txt-muted">
                Puede que Horizon est&eacute; ca&iacute;do o que no haya actividad reciente en testnet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-card text-xs uppercase tracking-wider text-txt-muted">
                    <th className="px-4 py-3">Hash</th>
                    <th className="px-4 py-3">Origen</th>
                    <th className="px-4 py-3">Ops</th>
                    <th className="px-4 py-3">Fee</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {txs.map((tx) => (
                    <tr key={tx.hash} className="transition-colors hover:bg-card/60">
                      <td className="px-4 py-3">
                        <a
                          href={txExplorerUrl(tx.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-wine-light underline decoration-wine/30 hover:decoration-wine"
                        >
                          {tx.hash.slice(0, 10)}...
                        </a>
                      </td>
                      <td className="px-4 py-3 font-mono text-txt-soft">
                        {truncateAddress(tx.source_account)}
                      </td>
                      <td className="px-4 py-3 text-txt-soft">{tx.operation_count}</td>
                      <td className="px-4 py-3 text-txt-muted">
                        {(parseInt(tx.fee_charged, 10) / 10_000_000).toFixed(5)} XLM
                      </td>
                      <td className="px-4 py-3 text-txt-muted">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="flex-1 rounded-xl border border-line bg-card p-4 lg:flex-none">
      <p className="text-xs text-txt-muted">{label}</p>
      <p className={`mt-1 font-mono text-lg font-bold ${accent ? 'text-vid' : 'text-txt-strong'}`}>
        {value}
      </p>
    </div>
  );
}
