// Sensor registry — uses VITE_ env vars for endpoints, falls back to localhost
export const SENSORS = [
  {
    id: 'sensor_001',
    name: 'Temperature',
    icon: '\u{1f321}\ufe0f',
    description: 'Temperatura vi\u00f1edo Valle de Uco, Mendoza',
    location: 'Valle de Uco, Mendoza',
    price: '0.005',
    status: 'active',
    endpoint: import.meta.env.VITE_SENSOR_001_URL || 'http://localhost:3001',
    owner: import.meta.env.VITE_SENSOR_001_PUBLIC || 'GCO3K47OKKLFE4TDUYLH5ROR67CSXBCMLS5224HX56EFXPZGKNCKBCXQ',
  },
  {
    id: 'sensor_002',
    name: 'Humidity',
    icon: '\u{1f4a7}',
    description: 'Humedad relativa parcela Malbec Bloque A',
    location: 'Malbec Block A, Luj\u00e1n de Cuyo',
    price: '0.005',
    status: 'active',
    endpoint: import.meta.env.VITE_SENSOR_002_URL || 'http://localhost:3002',
    owner: import.meta.env.VITE_SENSOR_002_PUBLIC || 'GACVKSIB5EVCBEQTAZPZ6Q4UYRQFKWFDEIZ6AEQIGMXCAD24KAXEGKM7',
  },
  {
    id: 'sensor_003',
    name: 'pH Tank',
    icon: '\u{1f9ea}',
    description: 'pH del tanque de fermentaci\u00f3n T-07, Bodega Andina',
    location: 'Bodega T-07, San Rafael',
    price: '0.010',
    status: 'active',
    endpoint: import.meta.env.VITE_SENSOR_003_URL || 'http://localhost:3003',
    owner: import.meta.env.VITE_SENSOR_003_PUBLIC || 'GCBWXXQA2TRBYUQAHBTEX5SXPCZ2SAGCNHKGDEJY3G6HQZS3UVK2WRPQ',
  },
];

// Fallback mock readings — used only if sensor node is unreachable
export function generateMockReading(sensorId) {
  const now = new Date().toISOString();
  const readings = {
    sensor_001: {
      sensor_id: 'sensor_001',
      type: 'temperature',
      value: +(18 + Math.random() * 6).toFixed(1),
      unit: '\u00b0C',
      location: 'Valle de Uco, Mendoza',
      timestamp: now,
      metadata: { altitude_m: 1100, vine_variety: 'Malbec' },
    },
    sensor_002: {
      sensor_id: 'sensor_002',
      type: 'humidity',
      value: +(55 + Math.random() * 25).toFixed(1),
      unit: '%RH',
      location: 'Malbec Block A, Luj\u00e1n de Cuyo',
      timestamp: now,
      metadata: { soil_type: 'alluvial', irrigation: 'drip' },
    },
    sensor_003: {
      sensor_id: 'sensor_003',
      type: 'pH',
      value: +(3.2 + Math.random() * 0.6).toFixed(2),
      unit: 'pH',
      location: 'Bodega T-07, San Rafael',
      timestamp: now,
      metadata: { tank_volume_l: 5000, grape: 'Cabernet Sauvignon' },
    },
  };
  return readings[sensorId] || readings.sensor_001;
}
