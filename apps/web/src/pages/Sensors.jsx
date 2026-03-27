import SensorCard from '../components/SensorCard';
import { SENSORS } from '../lib/sensors';

export default function Sensors() {
  return (
    <div className="page-enter mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 font-heading text-3xl font-bold text-txt-strong">Sensores disponibles</h1>
      <p className="mb-8 text-txt-soft">
        Endpoints de datos registrados en Stellar Testnet. Cada consulta ejecuta un micropago x402 en USDC.
      </p>

      {/* Bento grid — first sensor featured, rest normal */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SensorCard sensor={SENSORS[0]} featured />
        {SENSORS.slice(1).map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
    </div>
  );
}
