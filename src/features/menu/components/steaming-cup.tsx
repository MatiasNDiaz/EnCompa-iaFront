import { cn } from "@/lib/utils";

/**
 * Taza de café con humito (trazo lineal, mismo estilo que los íconos de Lucide).
 * Las tres líneas de vapor suben y se desvanecen; quietas con prefers-reduced-motion.
 */
export function SteamingCup({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={cn("size-5", className)}
    >
      <g>
        <path className="steam-line" d="M8 2.5c-.6.8-.6 1.7 0 2.5" />
        <path className="steam-line" d="M11.5 2.5c-.6.8-.6 1.7 0 2.5" />
        <path className="steam-line" d="M15 2.5c-.6.8-.6 1.7 0 2.5" />
      </g>
      {/* taza */}
      <path d="M4 8h14v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      {/* asa */}
      <path d="M18 9.5h1.25a2.25 2.25 0 0 1 0 4.5H18" />
      {/* plato */}
      <path d="M3 21.5h18" />
    </svg>
  );
}
