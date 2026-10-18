"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/characters/Character";
import { usePlayer } from "@/lib/player";

/** Figma "Playing as" chip (7:709) with Change + New player (shared booth devices). */
export function PlayingAs() {
  const { ready, profile, newPlayer } = usePlayer();
  const router = useRouter();
  if (!ready) return <div className="h-[72px] w-[270px] rounded-ui bg-white" aria-hidden />;
  if (!profile) {
    return (
      <Link href="/start" className="flex min-h-12 items-center rounded-ui bg-white px-4 py-3 text-label font-semibold text-magenta">
        Pick a nickname to start
      </Link>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-ui bg-white px-4 py-3">
      <Avatar id={profile.character} size={48} />
      <div className="flex flex-col gap-0.5">
        <span className="text-caption opacity-70">Playing as</span>
        <span className="text-label font-semibold">{profile.nickname}</span>
      </div>
      <Link href="/progress#profile" className="flex min-h-12 items-center text-label font-semibold text-magenta">
        Change
      </Link>
      <button
        type="button"
        onClick={async () => {
          await newPlayer();
          router.push("/start");
        }}
        className="flex min-h-12 items-center text-label font-semibold text-ink underline"
      >
        New player
      </button>
    </div>
  );
}
