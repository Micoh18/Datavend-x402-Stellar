// Same-origin in production (Vercel), configurable for local dev
const API_BASE = import.meta.env.VITE_SENSOR_API_URL || '';

export const SENSORS = [
  {
    id: 'sensor_001',
    name: 'Temperature',
    icon: 'temperature',
    description: 'Temperatura vi\u00f1edo Valle de Uco, Mendoza',
    location: 'Valle de Uco, Mendoza',
    price: '0.005',
    status: 'active',
    endpoint: `${API_BASE}/api/data?sensor=sensor_001`,
    owner: import.meta.env.VITE_SENSOR_001_PUBLIC || 'GCO3K47OKKLFE4TDUYLH5ROR67CSXBCMLS5224HX56EFXPZGKNCKBCXQ',
  },
  {
    id: 'sensor_002',
    name: 'Humidity',
    icon: 'humidity',
    description: 'Humedad relativa parcela Malbec Bloque A',
    location: 'Malbec Block A, Luj\u00e1n de Cuyo',
    price: '0.005',
    status: 'active',
    endpoint: `${API_BASE}/api/data?sensor=sensor_002`,
    owner: import.meta.env.VITE_SENSOR_002_PUBLIC || 'GACVKSIB5EVCBEQTAZPZ6Q4UYRQFKWFDEIZ6AEQIGMXCAD24KAXEGKM7',
  },
  {
    id: 'sensor_003',
    name: 'pH Tank',
    icon: 'ph',
    description: 'pH del tanque de fermentaci\u00f3n T-07, Bodega Andina',
    location: 'Bodega T-07, San Rafael',
    price: '0.010',
    status: 'active',
    endpoint: `${API_BASE}/api/data?sensor=sensor_003`,
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
