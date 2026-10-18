"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** Figma QR Code (6:25): white tile, 4px corners, ink modules. Generated client-side. */
export function QrCode({ value, size = 120, label }: { value: string; size?: number; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toString(value, { type: "svg", margin: 1, color: { dark: "#292235", light: "#ffffff" } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(null));
    return () => {
      alive = false;
    };
  }, [value]);
  return (
    <div
      role="img"
      aria-label={label}
      className="rounded-tag bg-white p-1 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
