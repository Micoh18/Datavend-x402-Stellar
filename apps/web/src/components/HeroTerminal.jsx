import { useState, useEffect, useRef } from 'react';

const LINES = [
  { text: '$ curl -s https://sensor1.datavend.app/data', color: 'text-txt', delay: 60 },
  { text: '', pause: 400 },
  { text: '< HTTP/1.1 402 Payment Required', color: 'text-wine-light', delay: 40 },
  { text: '{', color: 'text-tierra-light', delay: 30 },
  { text: '  "x402Version": "1",', color: 'text-tierra-light', delay: 25 },
  { text: '  "accepts": [{', color: 'text-tierra-light', delay: 25 },
  { text: '    "asset": "USDC",', color: 'text-tierra-light', delay: 25 },
  { text: '    "maxAmountRequired": "0.005",', color: 'text-wine-light', delay: 25 },
  { text: '    "payTo": "GCSO3...",', color: 'text-tierra-light', delay: 25 },
  { text: '    "network": "stellar-testnet"', color: 'text-tierra-light', delay: 25 },
  { text: '  }]', color: 'text-tierra-light', delay: 25 },
  { text: '}', color: 'text-tierra-light', delay: 30 },
  { text: '', pause: 600 },
  { text: '$ # pago USDC en Stellar...', color: 'text-txt-muted', delay: 50 },
  { text: '  tx_hash: 8451e078...47044062', color: 'text-vid-light', delay: 40 },
  { text: '', pause: 400 },
  { text: '$ curl -s -H "X-Payment: <proof>" sensor1.datavend.app/data', color: 'text-txt', delay: 45 },
  { text: '', pause: 300 },
  { text: '< HTTP/1.1 200 OK', color: 'text-vid-light', delay: 40 },
  { text: '{', color: 'text-vid-light', delay: 30 },
  { text: '  "sensor_id": "sensor_001",', color: 'text-vid-light', delay: 25 },
  { text: '  "type": "temperature",', color: 'text-vid-light', delay: 25 },
  { text: '  "value": 18.4,', color: 'text-txt-strong font-semibold', delay: 25 },
  { text: '  "unit": "\u00b0C",', color: 'text-vid-light', delay: 25 },
  { text: '  "location": "Valle de Uco, Mendoza"', color: 'text-vid-light', delay: 25 },
  { text: '}', color: 'text-vid-light', delay: 30 },
];

export default function HeroTerminal() {
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (currentLine >= LINES.length) return;

    const line = LINES[currentLine];

    if (line.pause) {
      const timer = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCharIndex(0);
      }, line.pause);
      return () => clearTimeout(timer);
    }

    if (!line.text) {
      setVisibleLines((prev) => [...prev, { text: '', color: '' }]);
      setCurrentLine((l) => l + 1);
      setCharIndex(0);
      return;
    }

    if (charIndex === 0 && visibleLines.length <= currentLine) {
      setVisibleLines((prev) => [...prev, { text: '', color: line.color }]);
    }

    if (charIndex < line.text.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => {
          const next = [...prev];
          const idx = next.length - 1;
          next[idx] = { ...next[idx], text: line.text.slice(0, charIndex + 1) };
          return next;
        });
        setCharIndex((c) => c + 1);
      }, line.delay);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentLine((l) => l + 1);
      setCharIndex(0);
    }, 80);
    return () => clearTimeout(timer);
  }, [currentLine, charIndex, visibleLines.length]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-wine-dark" />
        <span className="h-2.5 w-2.5 rounded-full bg-tierra" />
        <span className="h-2.5 w-2.5 rounded-full bg-vid" />
        <span className="ml-2 text-[11px] text-txt-muted">terminal &mdash; x402 flow</span>
      </div>

      {/* Terminal body */}
      <div
        ref={containerRef}
        className="h-[340px] overflow-y-auto bg-base p-4 font-mono text-[13px] leading-relaxed"
      >
        {visibleLines.map((line, i) => (
          <div key={i} className={`${line.color} whitespace-pre`}>
            {line.text || '\u00a0'}
          </div>
        ))}
        {currentLine < LINES.length && (
          <span className="inline-block h-4 w-2 animate-pulse bg-txt-muted/60" />
        )}
      </div>
    </div>
  );
}
