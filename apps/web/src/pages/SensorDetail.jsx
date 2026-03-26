import { useParams, Link } from 'react-router-dom';
import { SENSORS } from '../lib/sensors';
import { truncateAddress, accountExplorerUrl } from '../lib/stellar';
import PaymentFlow from '../components/PaymentFlow';

export default function SensorDetail() {
  const { id } = useParams();
  const sensor = SENSORS.find((s) => s.id === id);

  if (!sensor) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <p className="mb-4 text-lg">Sensor not found</p>
        <Link to="/sensors" className="text-violet-400 underline">
          &#x2190; Back to sensors
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        to="/sensors"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        &#x2190; All sensors
      </Link>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span className="text-4xl">{sensor.icon}</span>
            <h1 className="mt-2 text-2xl font-bold text-white">{sensor.name}</h1>
            <p className="text-gray-400">{sensor.description}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              sensor.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-gray-700/50 text-gray-500'
            }`}
          >
            {sensor.status}
          </span>
        </div>

        {/* Info grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <InfoItem label="Price per query" value={`${sensor.price} USDC`} mono />
          <InfoItem label="Location" value={sensor.location} />
          <InfoItem label="Sensor ID" value={sensor.id} mono />
          <InfoItem
            label="Owner"
            value={truncateAddress(sensor.owner)}
            mono
            link={accountExplorerUrl(sensor.owner)}
          />
        </div>

        {/* Endpoint */}
        <div className="mb-6 rounded-lg bg-gray-950 p-3">
          <p className="mb-1 text-xs text-gray-500">Endpoint</p>
          <code className="text-sm text-gray-300">{sensor.endpoint}/data</code>
        </div>

        {/* Payment flow */}
        <PaymentFlow sensor={sensor} />
      </div>
    </div>
  );
}

function InfoItem({ label, value, mono, link }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm text-violet-400 underline decoration-violet-400/30 hover:decoration-violet-400 ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </a>
      ) : (
        <p className={`text-sm text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
      )}
    </div>
  );
}
