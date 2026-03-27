<p align="center">
  <img src="https://i.imgur.com/5Jp4yjB.png" alt="DataVend Logo" width="200" />
</p>

<h1 align="center">DataVend</h1>

<p align="center">
  <strong>Marketplace de datos IoT con micropagos x402 sobre Stellar</strong>
</p>

<p align="center">
  <a href="https://datavend-five.vercel.app">Demo en vivo</a> &bull;
  <a href="#como-funciona">Como funciona</a> &bull;
  <a href="#arquitectura">Arquitectura</a> &bull;
  <a href="#inicio-rapido">Inicio rapido</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stellar-Testnet-blue?logo=stellar" alt="Stellar Testnet" />
  <img src="https://img.shields.io/badge/x402-Protocol-orange" alt="x402 Protocol" />
  <img src="https://img.shields.io/badge/Soroban-Smart%20Contract-purple" alt="Soroban" />
  <img src="https://img.shields.io/badge/VendimiaTech-Hackathon%202026-722F37" alt="VendimiaTech" />
</p>

---

## El problema

Los datos de sensores agricolas estan atrapados en silos cerrados. Un productor de Mendoza no puede compartir la temperatura de su vinedo sin montar una infraestructura completa. Un investigador no puede acceder a datos de humedad del suelo sin negociar contratos y suscripciones.

**No existe una forma de simplemente pedir un dato y pagarlo.**

## La solucion

DataVend implementa el protocolo **x402** sobre **Stellar** para crear un marketplace donde cualquier sensor puede monetizar sus datos mediante micropagos automaticos:

```
GET /api/data?sensor=sensor_001
← HTTP 402 Payment Required
  { "amount": "0.005", "asset": "USDC", "payTo": "GACV..." }

# El cliente paga en Stellar (0.005 USDC, ~0.00001 XLM de fee)

GET /api/data?sensor=sensor_001
→ X-Payment: eyJ4NDAyVmVyc2lvbi...  (proof con tx_hash)
← HTTP 200 OK
  { "type": "temperature", "value": 19.3, "location": "Valle de Uco" }
```

Una peticion HTTP. Un micropago. Datos verificados on-chain.

---

<h2 id="como-funciona">Como funciona</h2>

```
    Comprador                    Sensor Node                   Stellar
    (Browser/Agent)              (API + x402)                  (Testnet)
         |                            |                            |
    1.   |--- GET /data ------------->|                            |
         |                            |                            |
    2.   |<-- 402 Payment Required ---|                            |
         |    payTo, amount, memo     |                            |
         |                            |                            |
    3.   |--- Payment tx (USDC) ------|--------------------------->|
         |                            |                       confirm tx
    4.   |--- GET /data ------------->|                            |
         |    X-Payment: {tx_hash}    |--- verify on-chain ------>|
         |                            |<-- tx valid --------------|
    5.   |<-- 200 OK + sensor data ---|                            |
```

### Por que Stellar

- **Fees de 0.00001 XLM** - hacen viable cobrar $0.005 por dato
- **Confirmacion en ~5 segundos** - la experiencia se siente instantanea
- **USDC nativo** - precios estables, sin volatilidad
- **Soroban** - registro on-chain de sensores con verificacion de pagos

### Para agentes de IA

Un agente con wallet propia puede ejecutar el flujo x402 sin intervencion humana. El protocolo HTTP 402 le dice cuanto pagar y a quien — es la primitiva perfecta para la economia agentica:

```bash
# Un agente IA comprando datos autonomamente
curl -s https://datavend.vercel.app/api/data?sensor=sensor_001
# → 402 { "accepts": [{ "payTo": "G...", "amount": "0.005" }] }

# Agente construye tx, firma con su keypair, y reintenta:
curl -s https://datavend.vercel.app/api/data?sensor=sensor_001 \
  -H "X-Payment: $(echo '{"x402Version":"1","tx_hash":"abc..."}' | base64)"
# → 200 { sensor data }
```

---

<h2 id="arquitectura">Arquitectura</h2>

```
datavend/
├── contracts/sensor_registry/    # Soroban smart contract (Rust)
│   └── src/lib.rs                # Registro de sensores on-chain
├── api/                          # Serverless functions (Vercel)
│   ├── data.js                   # x402 paywall + datos de sensor
│   ├── info.js                   # Metadata publica de sensores
│   ├── faucet.js                 # Faucet de USDC testnet
│   └── health.js                 # Health check
├── apps/web/                     # Frontend React + Tailwind
│   └── src/
│       ├── components/
│       │   ├── PaymentFlow.jsx   # Terminal x402 en tiempo real
│       │   └── WalletConnect.jsx # Integracion Freighter + faucet
│       └── lib/
│           └── datavend-client.js # Cliente x402 para browser
├── packages/
│   ├── sensor-node/              # Sensor node Express (standalone)
│   └── buyer-sdk/                # SDK + CLI para comprar datos
└── scripts/
    └── setup-wallets.js          # Setup de wallets testnet
```

### Stack

| Capa | Tecnologia |
|------|------------|
| Smart Contract | Rust + Soroban SDK 22.0.1 |
| Sensor API | Node.js + Stellar SDK + Vercel Serverless |
| Frontend | React 19 + Tailwind CSS 4 + Vite 8 |
| Wallet | Freighter (browser extension) |
| Network | Stellar Testnet + Horizon API |

### Contrato Soroban

El contrato `SensorRegistry` vive on-chain y permite:

```rust
// Registrar un sensor con su endpoint y precio
register_sensor(caller, sensor_id, endpoint_url, price_stroops, description)

// Consultar sensores activos
list_sensors() -> Vec<Symbol>
get_sensor(sensor_id) -> SensorInfo

// Verificar que un pago es suficiente
verify_payment_amount(sensor_id, paid_stroops) -> bool
```

**Contract ID:** `CDRIFIUEG6NSPA4C2G3ZLEJGJ73E5WBMSBQAV3HLZJBBTBX3B2AS4ZQG`

---

<h2 id="inicio-rapido">Inicio rapido</h2>

### Prerequisitos

- Node.js 18+
- [Freighter Wallet](https://www.freighter.app/) (extension de navegador)

### Instalacion

```bash
git clone https://github.com/Micoh18/Datavend-x402-Stellar.git
cd Datavend-x402-Stellar
npm install
```

### Setup de wallets testnet

```bash
node scripts/setup-wallets.js
```

Esto genera 4 cuentas Stellar testnet (3 sensores + 1 comprador), crea un issuer de USDC de prueba, establece trustlines y distribuye tokens.

### Desarrollo local

```bash
# Terminal 1 — Frontend
npm run dev:web

# Terminal 2 — Sensor nodes (requiere Docker)
npm run dev:sensors
```

### Probar el flujo x402

```bash
# Con el CLI
cd packages/buyer-sdk
node cli.js --sensor http://localhost:3001

# Con curl (esperar 402)
curl http://localhost:3001/data
```

---

## Demo en vivo

**[datavend-five.vercel.app](https://datavend-five.vercel.app)**

Para probar:

1. Instalar [Freighter](https://www.freighter.app/) y cambiar a **Testnet**
2. Conectar wallet en la app
3. Agregar trustline USDC (issuer: `GDRYVCUS7E4K5QDZYWUGRD35SEQJ5MYOQIBUS67GO6DLDZ5WIXDLNGKR`)
4. Click **"Faucet USDC"** para recibir 10 USDC de prueba
5. Elegir un sensor y comprar datos — ver el protocolo x402 en tiempo real

### Sensores disponibles

| Sensor | Tipo | Precio | Ubicacion |
|--------|------|--------|-----------|
| sensor_001 | Temperatura | 0.005 USDC | Valle de Uco, Mendoza |
| sensor_002 | Humedad del suelo | 0.005 USDC | Malbec Block A, Lujan de Cuyo |
| sensor_003 | pH fermentacion | 0.010 USDC | Bodega T-07, San Rafael |

---

## Equipo

Construido durante el **VendimiaTech Hackathon 2026**.

---

<p align="center">
  <sub>Hecho con Stellar, Soroban y mucho cafe.</sub>
</p>
