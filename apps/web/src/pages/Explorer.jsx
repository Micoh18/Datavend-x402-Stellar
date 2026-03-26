import { useState, useEffect } from 'react';
import { fetchRecentTransactions, txExplorerUrl, truncateAddress } from '../lib/stellar';

export default function Explorer() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions(15).then((records) => {
      setTxs(records);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-white">Transaction Explorer</h1>
      <p className="mb-8 text-gray-400">
        Recent transactions on Stellar Testnet. In production, this filters to DataVend contract
        transactions only.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : txs.length === 0 ? (
        <p className="py-10 text-center text-gray-500">No transactions found</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Hash</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Ops</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {txs.map((tx) => (
                <tr key={tx.hash} className="hover:bg-gray-900/40 transition-colors">
                  <td className="px-4 py-3">
                    <a
                      href={txExplorerUrl(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-violet-400 underline decoration-violet-400/30 hover:decoration-violet-400"
                    >
                      {tx.hash.slice(0, 10)}...
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-300">
                    {truncateAddress(tx.source_account)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{tx.operation_count}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {(parseInt(tx.fee_charged, 10) / 10_000_000).toFixed(5)} XLM
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
