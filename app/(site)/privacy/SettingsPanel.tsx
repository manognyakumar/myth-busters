"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/characters/Character";
import { Button } from "@/components/ui/Button";
import { CHARACTERS, CHARACTER_IDS, type CharacterId } from "@/lib/characters";
import { api, ApiFailure, errorText, setKiosk, isKiosk, usePlayer, type Profile } from "@/lib/player";

/** Figma "Your settings" panel (15 Privacy & settings). */
export function SettingsPanel() {
  const { ready, profile, setProfile, newPlayer } = usePlayer();
  const [nickname, setNickname] = useState("");
  const [character, setCharacter] = useState<CharacterId>("pinky");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [kiosk, setKioskState] = useState(false);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
      setCharacter(profile.character);
    }
    setKioskState(isKiosk());
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ profile: Profile }>("/api/profile", { nickname: nickname.trim(), character });
      setProfile(r.profile);
      setMsg("Saved.");
    } catch (err) {
      setMsg(errorText(err instanceof ApiFailure ? err.code : "server_error"));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete your nickname, scores and achievements from Myth Busters? This can’t be undone.")) return;
    setBusy(true);
    try {
      await api("/api/profile", undefined, "DELETE");
      await newPlayer();
      setMsg("Your data has been deleted.");
    } catch (err) {
      setMsg(errorText(err instanceof ApiFailure ? err.code : "server_error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside aria-labelledby="settings" className="flex flex-col gap-4 rounded-ui bg-lavender p-6 lg:w-[440px] lg:shrink-0">
      <h2 id="settings" className="text-h3 font-extrabold">
        Your settings
      </h2>
      {!ready ? null : !profile ? (
        <p className="text-body">
          No profile on this device.{" "}
          <Link href="/start" className="font-semibold text-magenta underline">
            Pick a nickname
          </Link>
        </p>
      ) : (
        <form onSubmit={save} className="flex flex-col gap-4">
          <label htmlFor="settings-nick" className="text-label font-semibold">
            Nickname
          </label>
          <input
            id="settings-nick"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={16}
            className="min-h-12 rounded-ui border border-warm-gray bg-white px-3.5 text-body focus:border-magenta"
          />
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-label font-semibold">Character</legend>
            <div className="flex flex-wrap gap-2">
              {CHARACTER_IDS.map((id) => (
                <label key={id} className="cursor-pointer rounded-full has-[:checked]:outline-3 has-[:checked]:outline-offset-2 has-[:checked]:outline-magenta has-[:focus-visible]:outline-rose">
                  <input type="radio" name="settings-char" value={id} checked={character === id} onChange={() => setCharacter(id)} className="sr-only" />
                  <Avatar id={id} size={48} />
                  <span className="sr-only">{CHARACTERS[id].name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" disabled={busy}>
            Save changes
          </Button>
        </form>
      )}
      {msg && (
        <p role="status" className="text-body font-semibold text-magenta">
          {msg}
        </p>
      )}
      <Link href="/progress#recover" className="flex min-h-12 items-center justify-center rounded-ui border-2 border-magenta bg-white px-6 text-label font-semibold text-magenta">
        Show my recovery code
      </Link>
      <button
        type="button"
        onClick={async () => {
          await newPlayer();
          setMsg("This device has forgotten you. Your scores stay on the leaderboard.");
        }}
        className="min-h-12 text-label font-semibold"
      >
        Forget me on this device
      </button>
      {profile && (
        <button type="button" onClick={remove} disabled={busy} className="min-h-12 text-label font-semibold text-magenta underline">
          Delete my data
        </button>
      )}
      <label className="flex min-h-12 items-center gap-3 text-body">
        <input
          type="checkbox"
          checked={kiosk}
          onChange={(e) => {
            setKiosk(e.target.checked);
            setKioskState(e.target.checked);
          }}
          className="size-5 accent-magenta"
        />
        Booth tablet mode (show “Next player” after each round)
      </label>
      <p className="text-caption opacity-70">Questions about your data? Contact the club through our website.</p>
    </aside>
  );
}
