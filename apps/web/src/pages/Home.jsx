import { Link } from 'react-router-dom';
import HeroTerminal from '../components/HeroTerminal';

export default function Home() {
  return (
    <div className="page-enter">
      {/* Hero — split layout */}
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-16 pb-20 lg:flex-row lg:items-center lg:gap-16 lg:pt-24">
        <div className="flex-1">
          <h1 className="font-heading text-5xl font-black leading-tight text-txt-strong md:text-6xl">
            DataVend
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-txt-soft">
            Datos de sensores de vi&ntilde;edos mendocinos, por micropago.
            Protocolo x402 sobre Stellar.
          </p>
          <p className="mt-2 text-sm text-txt-muted">
            Temperatura &middot; Humedad &middot; pH &mdash; un request, un pago, dato instant&aacute;neo.
          </p>
          <Link
            to="/sensors"
            className="mt-8 inline-block rounded-xl bg-wine px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-wine-light hover:shadow-lg hover:shadow-wine/20"
          >
            Compr&aacute; un dato por $0.005 &#x2192;
          </Link>
          <p className="mt-3 text-xs text-txt-muted">
            Testnet &mdash; sin wallet real, pod&eacute;s probar con modo demo.
          </p>
        </div>

        <div className="flex-1 lg:max-w-xl">
          <HeroTerminal />
        </div>
      </section>

      {/* Contraste — argumento econ&oacute;mico */}
      <section className="border-t border-line px-6 py-20">
        <div className="mx-auto max-w-lg text-center">

          <p className="text-txt-muted text-xs tracking-widest uppercase font-mono mb-4">
            antes
          </p>
          <p className="text-txt-muted text-2xl leading-tight line-through decoration-wine/40">
            $500 &ndash; $2.000 / mes
          </p>
          <p className="text-txt-muted text-sm mt-2">
            para saber la temperatura de tu vi&ntilde;edo tres veces al d&iacute;a.
          </p>

          <div className="border-t border-line my-10" />

          <p className="text-wine text-xs tracking-widest uppercase font-mono mb-4">
            ahora
          </p>
          <p className="font-heading text-6xl font-black leading-none text-txt-strong md:text-7xl">
            $0.005
          </p>
          <p className="text-txt-strong text-lg mt-3">
            por lectura.
          </p>
          <p className="text-txt-soft text-sm mt-2">
            Sin cuenta. Sin contrato. El sensor te cobra directo.
          </p>

        </div>
      </section>

      {/* Foto vi&ntilde;edo — contexto emocional */}
      <section className="relative overflow-hidden">
        {/* PLACEHOLDER: reemplazar src con foto real de vi&ntilde;edo mendocino */}
        <div className="h-72 w-full bg-elevated md:h-96">
          <img
            src="/img/24980.jpg"
            alt="Vi&ntilde;edo en Valle de Uco, Mendoza"
            className="h-full w-full object-cover" style={{ objectPosition: 'center 70%' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
              e.target.insertAdjacentHTML('afterend',
                '<span class="text-txt-muted text-sm font-mono">placeholder: foto vi&ntilde;edo mendocino con hileras de vid</span>'
              );
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <p className="mx-auto max-w-2xl text-center text-sm text-txt-soft">
            Los vi&ntilde;edos producen datos todo el d&iacute;a.
            Hasta ahora, acceder a ellos requer&iacute;a un contrato
            con un proveedor de IoT.
          </p>
        </div>
      </section>

      {/* Sensor en campo — la realidad f&iacute;sica */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-16 md:flex-row md:items-center md:gap-12">
          {/* PLACEHOLDER: foto de un sensor/nodo IoT en un vi&ntilde;edo */}
          <div className="flex-1 overflow-hidden rounded-xl bg-elevated">
            <img
              src="/img/Viniot_red-de-sensores-Iot.jpg"
              alt="Sensor IoT instalado entre hileras de vid"
              className="h-64 w-full object-cover md:h-80"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'h-64', 'md:h-80');
                e.target.insertAdjacentHTML('afterend',
                  '<span class="text-txt-muted text-sm font-mono px-4 text-center">placeholder: sensor IoT en vi&ntilde;edo, caja peque&ntilde;a con antena entre plantas</span>'
                );
              }}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs font-mono tracking-widest uppercase text-txt-muted mb-3">
              El sensor como microservicio
            </p>
            <p className="text-txt-soft text-sm leading-relaxed">
              Cada nodo tiene su propia wallet Stellar y un endpoint HTTP.
              Cuando alguien quiere un dato, el sensor responde
              con <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-xs text-wine">402 Payment Required</code> y
              el precio. El comprador paga en USDC, el sensor verifica on-chain
              y entrega el dato. Sin servidores intermedios.
            </p>
            <p className="text-txt-muted text-xs mt-4">
              Protocolo x402 &mdash; el est&aacute;ndar abierto de Coinbase
              para pagos m&aacute;quina-a-m&aacute;quina.
            </p>
          </div>
        </div>
      </section>

      {/* Cosecha — el dato tiene valor real */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col-reverse gap-8 px-4 py-16 md:flex-row md:items-center md:gap-12">
          <div className="flex-1">
            <p className="text-xs font-mono tracking-widest uppercase text-txt-muted mb-3">
              Datos que mueven decisiones
            </p>
            <p className="text-txt-soft text-sm leading-relaxed">
              Un en&oacute;logo necesita saber si la temperatura baj&oacute;
              de 5&deg;C anoche para decidir la cosecha. Un agr&oacute;nomo
              monitorea el pH del suelo para ajustar el riego. Hoy pagan
              miles de d&oacute;lares por esa informaci&oacute;n. Con DataVend,
              la consulta cuesta lo que vale: fracciones de centavo.
            </p>
          </div>
          {/* PLACEHOLDER: foto de cosecha / en&oacute;logo en bodega / uvas de cerca */}
          <div className="flex-1 overflow-hidden rounded-xl bg-elevated">
            <img
              src="/img/hands-holding-cutting-grape-from-plant.jpg"
              alt="Cosecha de uvas en Mendoza"
              className="h-64 w-full object-cover md:h-80"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'h-64', 'md:h-80');
                e.target.insertAdjacentHTML('afterend',
                  '<span class="text-txt-muted text-sm font-mono px-4 text-center">placeholder: cosecha de uvas, manos cortando racimos, o en&oacute;logo en bodega</span>'
                );
              }}
            />
          </div>
        </div>
      </section>

      {/* Prueba de vida + CTA final */}
      <section className="border-t border-line px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-txt-soft text-sm">
            Tres sensores corriendo en Stellar Testnet ahora mismo.
          </p>
          <Link
            to="/sensors"
            className="mt-6 inline-block rounded-xl bg-wine px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-wine-light hover:shadow-lg hover:shadow-wine/20"
          >
            Prueba la demo &#x2192;
          </Link>
        </div>
      </section>
    </div>
  );
}
