import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Easter egg
console.log(
  '%c\u{1f347} DataVend',
  'font-size:24px;font-weight:bold;color:#722F37;'
);
console.log(
  '%cDatos de sensores por micropago \u2014 x402 sobre Stellar\nVendimiaTech Hackathon 2026 \u00b7 Mendoza, Argentina',
  'font-size:11px;color:#8B7355;'
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
