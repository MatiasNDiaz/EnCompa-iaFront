/** Rama con hojas (decorativa, trazo y relleno suaves en caramelo). */
export function Branch({ className }: { className?: string }) {
  const leaves = [
    { x: 118, y: 40, r: -32, s: 1 },
    { x: 84, y: 92, r: 28, s: 0.95 },
    { x: 140, y: 120, r: -50, s: 1.05 },
    { x: 92, y: 170, r: 38, s: 0.9 },
    { x: 152, y: 196, r: -58, s: 0.95 },
    { x: 108, y: 238, r: 24, s: 0.85 },
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 300"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      className={className}
    >
      <path d="M190 300 C 160 240, 140 190, 128 130 S 112 40, 120 0" strokeWidth="2" />
      {leaves.map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}>
          <path
            d="M0 0 C 14 -18, 46 -20, 62 0 C 46 20, 14 18, 0 0 Z"
            fill="currentColor"
            fillOpacity="0.28"
            strokeWidth="1.4"
          />
          <path d="M2 0 L 58 0" strokeWidth="1" />
          {[14, 26, 38].map((vx) => (
            <path key={vx} d={`M${vx} 0 l 8 -7 M${vx} 0 l 8 7`} strokeWidth="0.8" />
          ))}
        </g>
      ))}
    </svg>
  );
}
