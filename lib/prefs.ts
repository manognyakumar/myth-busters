"use client";

const TIMER_KEY = "mythbusters-timer";

/** Per-device convenience only; the server records whether each attempt was timed. */
export function getTimerOn(): boolean {
  try {
    return localStorage.getItem(TIMER_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setTimerOn(on: boolean) {
  try {
    localStorage.setItem(TIMER_KEY, on ? "on" : "off");
  } catch {}
}
