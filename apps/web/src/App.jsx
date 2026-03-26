import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './lib/wallet-context';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Sensors from './pages/Sensors';
import SensorDetail from './pages/SensorDetail';
import Explorer from './pages/Explorer';

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sensors" element={<Sensors />} />
              <Route path="/sensor/:id" element={<SensorDetail />} />
              <Route path="/explorer" element={<Explorer />} />
            </Routes>
          </main>
          <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-600">
            DataVend &mdash; VendimiaTech Hackathon 2026 &middot; Built on Stellar
          </footer>
        </div>
      </WalletProvider>
    </BrowserRouter>
  );
}
