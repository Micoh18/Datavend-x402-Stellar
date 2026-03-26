import SensorCard from '../components/SensorCard';
import { SENSORS } from '../lib/sensors';

export default function Sensors() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-white">Available Sensors</h1>
      <p className="mb-8 text-gray-400">
        Browse sensor data endpoints registered on Stellar Testnet. Click &quot;Buy Data&quot; to
        execute an x402 micropayment.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SENSORS.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
    </div>
  );
}
