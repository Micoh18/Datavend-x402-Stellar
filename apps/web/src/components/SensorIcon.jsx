const icons = {
  temperature: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M14.5 14.76V4a2.5 2.5 0 0 0-5 0v10.76a4.5 4.5 0 1 0 5 0Z" />
      <circle cx="12" cy="18" r="2" fill="currentColor" stroke="none" />
      <line x1="12" y1="18" x2="12" y2="9" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
      <line x1="15" y1="7" x2="17" y2="7" strokeWidth="1" />
      <line x1="15" y1="10" x2="16.5" y2="10" strokeWidth="1" />
      <line x1="15" y1="13" x2="17" y2="13" strokeWidth="1" />
    </svg>
  ),
  humidity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69Z" />
      <path d="M8.5 14a3.5 3.5 0 0 0 3.5 3.5" strokeOpacity="0.5" />
    </svg>
  ),
  ph: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <rect x="5" y="2" width="4" height="20" rx="1" />
      <rect x="5" y="14" width="4" height="8" rx="1" fill="currentColor" fillOpacity="0.2" />
      <line x1="13" y1="6" x2="19" y2="6" />
      <line x1="13" y1="10" x2="17" y2="10" />
      <line x1="13" y1="14" x2="19" y2="14" />
      <line x1="13" y1="18" x2="16" y2="18" />
    </svg>
  ),
};

export default function SensorIcon({ type, className = 'h-8 w-8' }) {
  return (
    <span className={`inline-block text-tierra ${className}`}>
      {icons[type] || icons.temperature}
    </span>
  );
}
