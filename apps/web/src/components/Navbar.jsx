import { Link, useLocation } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-wine/15 text-wine-light'
        : 'text-txt-soft hover:text-txt'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-base/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-txt-strong">
          <img src="/icon vend.svg" alt="DataVend" className="h-7 w-7" />
          <span>DataVend</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/sensors" className={linkClass('/sensors')}>
            Sensores
          </Link>
          <Link to="/explorer" className={linkClass('/explorer')}>
            Explorer
          </Link>
          <ThemeToggle />
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
