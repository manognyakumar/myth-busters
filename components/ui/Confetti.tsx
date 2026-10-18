"use client";

import { useEffect, useState } from "react";

const COLORS = ["var(--color-rose)", "var(--color-blush)", "var(--color-lavender-mid)", "var(--color-white)"];

/** Small celebration (<1.5s, no flashing). Skipped entirely under prefers-reduced-motion. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: pieces }, (_, i) => (
        <span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-[2px]"
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animation: `mb-confetti ${0.9 + ((i * 7) % 5) / 10}s ease-in ${((i * 3) % 4) / 10}s both`,
          }}
        />
      ))}
    </div>
  );
}
