import { Link } from 'react-router-dom';
import SensorIcon from './SensorIcon';

export default function SensorCard({ sensor, featured }) {
  if (featured) {
    return (
      <div className="group col-span-full flex flex-col gap-6 rounded-2xl border border-line bg-card p-6 transition-all hover:border-wine/40 hover:shadow-lg hover:shadow-wine/5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-wine/10 p-4">
          <SensorIcon type={sensor.icon} className="h-10 w-10" />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-3">
            <h3 className="font-heading text-xl font-bold text-txt-strong">{sensor.name}</h3>
            <StatusBadge status={sensor.status} />
          </div>
          <p className="mb-1 text-sm text-txt-soft">{sensor.description}</p>
          <p className="text-xs text-txt-muted">&#x1F4CD; {sensor.location}</p>
        </div>
        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
          <span className="font-mono text-2xl font-bold text-wine">
            {sensor.price} <span className="text-xs text-txt-muted">USDC</span>
          </span>
          <Link
            to={`/sensor/${sensor.id}`}
            className="rounded-lg bg-vid px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-vid-light"
          >
            Comprar dato
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-card p-5 transition-all hover:border-wine/40 hover:shadow-lg hover:shadow-wine/5">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-wine/10 p-2.5">
          <SensorIcon type={sensor.icon} className="h-full w-full" />
        </div>
        <StatusBadge status={sensor.status} />
      </div>

      <h3 className="mb-1 text-lg font-semibold text-txt-strong">{sensor.name}</h3>
      <p className="mb-2 text-sm text-txt-soft">{sensor.description}</p>
      <p className="mb-4 text-xs text-txt-muted">
        &#x1F4CD; {sensor.location}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <span className="font-mono text-lg font-bold text-wine-light">
          {sensor.price} <span className="text-xs text-txt-muted">USDC</span>
        </span>
        <Link
          to={`/sensor/${sensor.id}`}
          className="rounded-lg bg-vid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-vid-light"
        >
          Comprar
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
        status === 'active'
          ? 'bg-vid/15 text-vid-light'
          : 'bg-elevated/50 text-txt-muted'
      }`}
    >
      {status}
    </span>
  );
}
