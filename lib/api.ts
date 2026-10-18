"use client";

import { asset } from "./site";

/** Fire-and-forget anonymous CTA counter (spec §9). */
export function trackCta(event: "results_shown" | "join_clicked") {
  try {
    const body = JSON.stringify({ event });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(asset("/api/cta"), new Blob([body], { type: "application/json" }));
    } else {
      void fetch(asset("/api/cta"), { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
    }
  } catch {
    /* counting is best-effort */
  }
}
