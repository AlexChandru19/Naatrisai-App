export function CompassMark({ className = "h-9 w-9" }: { className?: string }) {
  // Four directions (நாற்றிசை) as a kolam-inspired compass
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="nsg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0a500" />
          <stop offset="1" stopColor="#c8321a" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#nsg)" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="#fff" strokeOpacity=".35" strokeDasharray="2 3" />
      <path d="M24 5 L28 24 L24 43 L20 24 Z" fill="#fff" />
      <path d="M5 24 L24 20 L43 24 L24 28 Z" fill="#fff" fillOpacity=".75" />
      <circle cx="24" cy="24" r="3.2" fill="#c8321a" stroke="#fff" strokeWidth="1.5" />
      {[[24, 9], [39, 24], [24, 39], [9, 24]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.2" fill="#c8321a" />)}
    </svg>
  );
}
