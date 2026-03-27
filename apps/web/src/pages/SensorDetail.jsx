import { useParams, Link } from 'react-router-dom';
import { SENSORS } from '../lib/sensors';
import { truncateAddress, accountExplorerUrl } from '../lib/stellar';
import PaymentFlow from '../components/PaymentFlow';
import SensorIcon from '../components/SensorIcon';

export default function SensorDetail() {
  const { id } = useParams();
  const sensor = SENSORS.find((s) => s.id === id);

  if (!sensor) {
    return (
      <div className="page-enter flex flex-col items-center py-20 text-txt-soft">
        <p className="font-heading text-5xl font-black text-wine">?</p>
        <p className="mt-4 text-lg">Sensor no encontrado</p>
        <p className="mt-1 text-sm text-txt-muted">
          Puede que haya sido desregistrado del contrato, o que la URL est&eacute; mal.
        </p>
        <Link to="/sensors" className="mt-6 text-wine-light underline">
          &#x2190; Volver a sensores
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-2xl px-4 py-10">
      <Link
        to="/sensors"
        className="mb-6 inline-block text-sm text-txt-muted transition-colors hover:text-txt"
      >
        &#x2190; Todos los sensores
      </Link>

      <div className="rounded-2xl border border-line bg-card p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <SensorIcon type={sensor.icon} className="h-10 w-10" />
            <h1 className="mt-2 font-heading text-2xl font-bold text-txt-strong">{sensor.name}</h1>
            <p className="text-txt-soft">{sensor.description}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              sensor.status === 'active'
                ? 'bg-vid/15 text-vid-light'
                : 'bg-elevated/50 text-txt-muted'
            }`}
          >
            {sensor.status}
          </span>
        </div>

        {/* Info grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <InfoItem label="Precio por consulta" value={`${sensor.price} USDC`} mono />
          <InfoItem label="Ubicaci&oacute;n" value={sensor.location} />
          <InfoItem label="Sensor ID" value={sensor.id} mono />
          <InfoItem
            label="Owner"
            value={truncateAddress(sensor.owner)}
            mono
            link={accountExplorerUrl(sensor.owner)}
          />
        </div>

        {/* Endpoint */}
        <div className="mb-6 rounded-lg bg-base p-3">
          <p className="mb-1 text-xs text-txt-muted">Endpoint</p>
          <code className="break-all text-sm text-txt-soft">{sensor.endpoint}</code>
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
      <p className="text-xs text-txt-muted">{label}</p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm text-wine-light underline decoration-wine/30 hover:decoration-wine ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </a>
      ) : (
        <p className={`text-sm text-txt-strong ${mono ? 'font-mono' : ''}`}>{value}</p>
      )}
    </div>
  );
}
