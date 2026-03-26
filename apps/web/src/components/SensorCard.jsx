import { Link } from 'react-router-dom';

export default function SensorCard({ sensor }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-gray-800 bg-gray-900/60 p-5 transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-3xl">{sensor.icon}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
            sensor.status === 'active'
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-gray-700/50 text-gray-500'
          }`}
        >
          {sensor.status}
        </span>
      </div>

      <h3 className="mb-1 text-lg font-semibold text-white">{sensor.name}</h3>
      <p className="mb-2 text-sm text-gray-400">{sensor.description}</p>
      <p className="mb-4 text-xs text-gray-500">
        &#x1F4CD; {sensor.location}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <span className="font-mono text-lg font-bold text-violet-400">
          {sensor.price} <span className="text-xs text-gray-500">USDC</span>
        </span>
        <Link
          to={`/sensor/${sensor.id}`}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          Buy Data
        </Link>
      </div>
    </div>
  );
}
