import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-enter flex flex-col items-center justify-center px-4 py-32 text-center">
      <p className="font-heading text-7xl font-black text-wine">402</p>
      <p className="mt-3 text-lg text-txt-soft">
        Payment Required... es broma, solo est&aacute;s perdido.
      </p>
      <p className="mt-1 text-sm text-txt-muted">
        Esta ruta no existe. Ni siquiera con micropagos.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-wine px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-wine-light"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
