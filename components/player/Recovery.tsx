"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { api, ApiFailure, errorText, usePlayer, type Profile } from "@/lib/player";

/** Figma "Play on another device" (13 My progress): one-time recovery code, no email. */
export function RecoveryPanel() {
  const { profile, setProfile, refresh } = usePlayer();
  const [code, setCode] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function show() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ code: string }>("/api/recovery/create", {});
      setCode(r.code);
    } catch (e) {
      setMsg(errorText(e instanceof ApiFailure ? e.code : "server_error"));
    } finally {
      setBusy(false);
    }
  }

  async function redeem(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ profile: Profile }>("/api/recovery/redeem", { code: input.trim() });
      setProfile(r.profile);
      await refresh();
      setMsg(`Welcome back, ${r.profile.nickname}! Your progress is now on this device.`);
      setEntering(false);
    } catch (err) {
      setMsg(errorText(err instanceof ApiFailure ? err.code : "server_error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="recover" aria-labelledby="recover-heading" className="flex flex-col gap-4 rounded-ui bg-lavender p-6 lg:flex-row lg:items-center lg:gap-6 lg:p-8">
      <Icon name="shield" className="hidden text-magenta lg:inline-block" />
      <div className="flex flex-1 flex-col gap-1">
        <h2 id="recover-heading" className="text-h3 font-extrabold">
          Play on another device
        </h2>
        <p className="text-body">
          Your progress is linked to this browser. To continue on another device, use your one-time recovery code there. Keep it private — no
          email needed.
        </p>
        {msg && (
          <p role="status" className="text-body font-semibold text-magenta">
            {msg}
          </p>
        )}
      </div>
      {entering ? (
        <form onSubmit={redeem} className="flex flex-wrap items-center gap-3">
          <label htmlFor="recovery-code" className="sr-only">
            Recovery code
          </label>
          <input
            id="recovery-code"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="XXXX-XXXX-XXXX"
            autoComplete="off"
            className="min-h-12 rounded-ui border-2 border-warm-gray bg-white px-4 font-mono text-body uppercase focus:border-magenta"
          />
          <button type="submit" disabled={busy} className="min-h-12 rounded-ui bg-magenta px-5 text-label font-semibold text-white">
            Restore
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {profile && (
            <>
              <output aria-live="polite" className="flex min-h-12 items-center rounded-ui border border-warm-gray bg-white px-4 font-mono text-body tracking-wider">
                {code ?? "•••• •••• ••••"}
              </output>
              <button type="button" onClick={show} disabled={busy} className="min-h-12 rounded-ui bg-magenta px-5 text-label font-semibold text-white">
                {code ? "New code" : "Show my code"}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setEntering(true)}
            className="min-h-12 rounded-ui border-2 border-magenta bg-white px-5 text-label font-semibold text-magenta"
          >
            Enter a code
          </button>
        </div>
      )}
      {code && <p className="sr-only">Showing a new code replaces any code you were given before.</p>}
    </section>
  );
}
