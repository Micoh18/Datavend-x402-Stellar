import { Link } from 'react-router-dom';

const STEPS = [
  { label: 'GET', desc: 'Request data', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { label: '402', desc: 'Payment required', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { label: 'PAY', desc: 'Stellar tx', color: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
  { label: 'DATA', desc: 'Receive data', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-20 pb-16 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white md:text-6xl">
          DataVend
        </h1>
        <p className="mb-2 text-xl text-violet-400 font-medium">
          Pay-per-query sensor data marketplace
        </p>
        <p className="mb-10 max-w-lg text-gray-400">
          Buy real-world sensor data with micropayments on Stellar.
          Temperature, humidity, pH &mdash; one API call, one payment, instant data.
        </p>

        {/* x402 flow visual */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className={`flex flex-col items-center rounded-xl border px-6 py-4 ${step.color}`}
              >
                <span className="font-mono text-2xl font-bold">{step.label}</span>
                <span className="mt-1 text-xs opacity-70">{step.desc}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="text-2xl text-gray-600">&#x2192;</span>
              )}
            </div>
          ))}
        </div>

        <Link
          to="/sensors"
          className="rounded-xl bg-violet-600 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/20"
        >
          Explore Sensors &#x2192;
        </Link>
      </section>

      {/* How it works */}
      <section className="w-full max-w-4xl px-4 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">How x402 works</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              n: '1',
              title: 'Discover sensors',
              desc: 'Browse registered sensors on the Soroban smart contract. Each sensor publishes its price and data endpoint.',
            },
            {
              n: '2',
              title: 'Request data',
              desc: 'Send a GET request to the sensor endpoint. If no payment is attached, you receive an HTTP 402 with payment instructions.',
            },
            {
              n: '3',
              title: 'Pay on Stellar',
              desc: 'Build and sign a Stellar transaction for the exact USDC amount. Submit it to Stellar Testnet for instant confirmation.',
            },
            {
              n: '4',
              title: 'Receive data',
              desc: 'Re-send the request with the X-Payment header containing the tx proof. The sensor verifies and returns the data.',
            },
          ].map((item) => (
            <div
              key={item.n}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-5"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                  {item.n}
                </span>
                <h3 className="font-semibold text-white">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
