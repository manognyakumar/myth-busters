"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ProfileForm } from "@/components/player/ProfileForm";
import { setKiosk } from "@/lib/player";

/** Figma 02 Nickname & character selection (7:537). */
export function StartScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  useEffect(() => {
    if (params.get("kiosk") === "1") setKiosk(true);
    if (params.get("kiosk") === "0") setKiosk(false);
  }, [params]);

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-8 px-4 py-10 lg:px-0 lg:py-16">
      <p className="text-label-sm font-semibold text-magenta">Step 1 of 2</p>
      <h1 className="font-display text-[40px] leading-none lg:text-title">Pick a nickname and a guide</h1>
      <p className="text-body lg:text-body-lg">
        No account needed. Only your nickname and character appear on the global leaderboard. Please don’t use your real name.
      </p>
      <ProfileForm submitLabel="Start playing" onSaved={() => router.push(next)} />
      <p className="text-body">
        Played on another device?{" "}
        <Link href="/progress#recover" className="font-semibold text-magenta underline">
          Use a recovery code
        </Link>
      </p>
    </div>
  );
}

function safeNext(n: string | null) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/play";
}
