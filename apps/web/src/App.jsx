import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './lib/wallet-context';
import { ThemeProvider } from './lib/theme-context';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const Sensors = lazy(() => import('./pages/Sensors'));
const SensorDetail = lazy(() => import('./pages/SensorDetail'));
const Explorer = lazy(() => import('./pages/Explorer'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="skeleton mb-4 h-8 w-48 rounded-lg" />
      <div className="skeleton mb-8 h-4 w-80 rounded" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <WalletProvider>
          <div className="flex min-h-screen flex-col bg-base text-txt transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/sensors" element={<Sensors />} />
                  <Route path="/sensor/:id" element={<SensorDetail />} />
                  <Route path="/explorer" element={<Explorer />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <footer className="border-t border-line py-6 text-center text-xs text-txt-muted">
              <p>DataVend &mdash; VendimiaTech Hackathon 2026</p>
              <div className="mt-1 flex items-center justify-center gap-3">
                <a
                  href="https://lab.stellar.org/r/testnet/contract/CDRIFIUEG6NSPA4C2G3ZLEJGJ73E5WBMSBQAV3HLZJBBTBX3B2AS4ZQG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wine-light transition-colors hover:text-wine"
                >
                  Contrato en Stellar
                </a>
                <span className="text-line">&middot;</span>
                <span className="text-tierra-light">Built on Stellar</span>
              </div>
            </footer>
          </div>
        </WalletProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
