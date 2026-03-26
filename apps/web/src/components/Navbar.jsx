import { Link, useLocation } from 'react-router-dom';
import WalletConnect from './WalletConnect';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-violet-500/20 text-violet-400'
        : 'text-gray-400 hover:text-gray-200'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="text-2xl">&#x1F52C;</span>
          <span>DataVend</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/sensors" className={linkClass('/sensors')}>
            Sensors
          </Link>
          <Link to="/explorer" className={linkClass('/explorer')}>
            Explorer
          </Link>
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
