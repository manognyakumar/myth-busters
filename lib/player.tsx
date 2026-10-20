"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { browserSupabase } from "./supabase/browser";
import type { CharacterId } from "./characters";
import { asset } from "./site";

export type Profile = { id: string; nickname: string; character: CharacterId; has_recovery_code?: boolean };

export class ApiFailure extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

async function token(): Promise<string> {
  const sb = browserSupabase();
  const { data } = await sb.auth.getSession();
  if (data.session) return data.session.access_token;
  const { data: signed, error } = await sb.auth.signInAnonymously();
  if (error || !signed.session) throw new ApiFailure(503, "auth_unavailable");
  return signed.session.access_token;
}

/** Authenticated JSON call to our own route handlers (the only path to the game backend). */
export async function api<T>(path: string, body?: unknown, method = body === undefined ? "GET" : "POST"): Promise<T> {
  let res: Response;
  try {
    res = await fetch(asset(path), {
      method,
      headers: { authorization: `Bearer ${await token()}`, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiFailure(0, "network");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiFailure(res.status, json.error ?? "server_error");
  return json as T;
}

/** Like `api`, but never creates an anonymous user: the token is sent only when a session already exists. */
export async function apiPublic<T>(path: string): Promise<T> {
  const { data } = await browserSupabase().auth.getSession();
  const headers: Record<string, string> = {};
  if (data.session) headers.authorization = `Bearer ${data.session.access_token}`;
  let res: Response;
  try {
    res = await fetch(asset(path), { headers, cache: "no-store" });
  } catch {
    throw new ApiFailure(0, "network");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiFailure(res.status, json.error ?? "server_error");
  return json as T;
}

type PlayerState = {
  ready: boolean;
  profile: Profile | null;
  error: string | null;
  setProfile: (p: Profile | null) => void;
  refresh: () => Promise<void>;
  newPlayer: () => Promise<void>;
};

const Ctx = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      // Don't create an anonymous user just for browsing; sign-in happens on first save.
      const { data } = await browserSupabase().auth.getSession();
      if (!data.session) {
        setProfile(null);
        return;
      }
      const { profile } = await api<{ profile: Profile | null }>("/api/profile");
      setProfile(profile);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiFailure ? e.code : "server_error");
    } finally {
      setReady(true);
    }
  }, []);

  /** Shared devices: forget this browser's identity so the next visitor starts fresh. */
  const newPlayer = useCallback(async () => {
    await browserSupabase().auth.signOut({ scope: "local" });
    try {
      sessionStorage.clear();
    } catch {}
    setProfile(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ ready, profile, error, setProfile, refresh, newPlayer }), [ready, profile, error, refresh, newPlayer]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePlayer outside PlayerProvider");
  return v;
}

const KIOSK_KEY = "mythbusters-kiosk";
export function isKiosk() {
  try {
    return localStorage.getItem(KIOSK_KEY) === "1";
  } catch {
    return false;
  }
}
export function setKiosk(on: boolean) {
  try {
    if (on) localStorage.setItem(KIOSK_KEY, "1");
    else localStorage.removeItem(KIOSK_KEY);
  } catch {}
}

export const ERROR_TEXT: Record<string, string> = {
  network: "We couldn’t reach the game server. Check your connection and try again.",
  server_error: "Something went wrong on our side. Please try again.",
  auth_unavailable: "We couldn’t start your session. Please try again.",
  rate_limited: "You’ve played a lot of rounds this hour. Take a short break and try again soon.",
  nickname_taken: "That nickname is already taken. Try another one.",
  nickname_format: "Use 3–16 letters, numbers or spaces.",
  nickname_unkind: "Please choose a kinder nickname.",
  not_enough_questions: "This round isn’t ready yet. Reviewed questions are still being added.",
  not_enough_pairs: "Bee Pairs isn’t ready yet. Reviewed cards are still being added.",
  invalid_code: "That recovery code didn’t match. Check it and try again.",
  device_has_progress: "This device already has its own scores. Use “New player” first, then enter your code.",
};
export const errorText = (code: string) => ERROR_TEXT[code] ?? ERROR_TEXT.server_error;
