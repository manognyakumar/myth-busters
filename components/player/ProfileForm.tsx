"use client";

import Link from "next/link";
import { useState } from "react";
import { Character } from "@/components/characters/Character";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { CHARACTERS, CHARACTER_IDS, type CharacterId } from "@/lib/characters";
import { api, ApiFailure, errorText, usePlayer, type Profile } from "@/lib/player";

const NICK_RE = /^[A-Za-z0-9 ]{3,16}$/;

/** Figma 02 Nickname & character selection (7:553): nickname field + character picker. */
export function ProfileForm({ submitLabel, onSaved }: { submitLabel: string; onSaved: (p: Profile) => void }) {
  const { profile, setProfile } = usePlayer();
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [character, setCharacter] = useState<CharacterId>(profile?.character ?? "pinky");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const valid = NICK_RE.test(nickname.trim());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setError("nickname_format");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { profile } = await api<{ profile: Profile }>("/api/profile", { nickname: nickname.trim(), character });
      setProfile(profile);
      onSaved(profile);
    } catch (err) {
      setError(err instanceof ApiFailure ? err.code : "server_error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-8" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="nickname" className="text-label font-semibold">
          Nickname
        </label>
        <div className="flex items-center gap-2 rounded-ui border-2 border-warm-gray bg-white px-4 py-3.5 focus-within:border-magenta">
          <input
            id="nickname"
            name="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={16}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="nickname-hint nickname-error"
            aria-invalid={error ? true : undefined}
            className="min-w-0 flex-1 bg-transparent text-body-lg outline-none"
            placeholder="BusyBee24"
          />
          {valid && <Icon name="check" size={20} className="text-success" label="Looks good" />}
        </div>
        <p id="nickname-hint" className="text-caption opacity-70">
          3–16 characters, letters, numbers and spaces, checked for kindness and uniqueness
        </p>
        <p id="nickname-error" role="alert" className="text-body font-semibold text-magenta">
          {error ? errorText(error) : ""}
        </p>
      </div>

      <fieldset className="flex flex-col gap-6">
        <legend className="mb-6 text-h3 font-extrabold">Choose your guide</legend>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CHARACTER_IDS.map((id) => {
            const c = CHARACTERS[id];
            const selected = id === character;
            return (
              <label
                key={id}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-ui p-4 text-center has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-rose ${
                  selected ? "border-2 border-magenta bg-blush" : "border border-warm-gray bg-white hover:bg-blush"
                }`}
              >
                <input
                  type="radio"
                  name="character"
                  value={id}
                  checked={selected}
                  onChange={() => setCharacter(id)}
                  className="sr-only"
                />
                <Character id={id} size={120} />
                <span className="text-label font-semibold">{c.name}</span>
                <span className="text-caption opacity-70">{c.role}</span>
                {selected && (
                  <span className="inline-flex items-center gap-1 rounded-tag bg-magenta px-2 py-1 text-label-sm font-semibold text-white">
                    <Icon name="check" size={14} />
                    Selected
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="large" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
        <p className="flex-1 text-body text-magenta">
          You can change your nickname or character any time in My Progress.{" "}
          <Link href="/privacy" className="underline">
            What we store → Privacy
          </Link>
        </p>
      </div>
    </form>
  );
}
