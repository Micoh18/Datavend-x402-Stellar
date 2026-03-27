import { Keypair } from '@stellar/stellar-sdk';

const SENSORS = {
  sensor_001: {
    secret: process.env.SENSOR_001_SECRET,
    price: '0.005',
    description: 'Temperatura viñedo Valle de Uco',
  },
  sensor_002: {
    secret: process.env.SENSOR_002_SECRET,
    price: '0.005',
    description: 'Humedad suelo Malbec Block A',
  },
  sensor_003: {
    secret: process.env.SENSOR_003_SECRET,
    price: '0.010',
    description: 'pH tanque fermentación bodega',
  },
};

export default function handler(req, res) {
  const sensorId = req.query.sensor;

  // If no sensor specified, return all sensors
  if (!sensorId) {
    const list = Object.entries(SENSORS)
      .filter(([, cfg]) => cfg.secret)
      .map(([id, cfg]) => ({
        sensor_id: id,
        description: cfg.description,
        price_usdc: cfg.price,
        public_key: Keypair.fromSecret(cfg.secret).publicKey(),
        network: 'stellar-testnet',
        x402_endpoint: `/api/data?sensor=${id}`,
      }));
    return res.status(200).json({ sensors: list });
  }

  const cfg = SENSORS[sensorId];
  if (!cfg || !cfg.secret) {
    return res.status(404).json({ error: `Sensor ${sensorId} not found` });
  }

  return res.status(200).json({
    sensor_id: sensorId,
    description: cfg.description,
    price_usdc: cfg.price,
    public_key: Keypair.fromSecret(cfg.secret).publicKey(),
    network: 'stellar-testnet',
    x402_endpoint: `/api/data?sensor=${sensorId}`,
  });
}
