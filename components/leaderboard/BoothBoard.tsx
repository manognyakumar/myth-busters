"use client";

import { useEffect, useState } from "react";
import { QrCode } from "@/components/ui/QrCode";
import { Character } from "@/components/characters/Character";
import { BASE_PATH, CLUB_FORM, CLUB_NAME, SITE_URL } from "@/lib/site";
import { LivePill, Podium, RankTable } from "./LeaderboardView";
import { useLeaderboard } from "./useLeaderboard";

/** Figma B1 Leaderboard — booth display (11:999): same single ranking, full-screen, no navigation. */
export function BoothBoard({ logo }: { logo: React.ReactNode }) {
  const { board } = useLeaderboard(0);
  // The game's own address, so the QR never points at a misconfigured SITE_URL.
  const [playUrl, setPlayUrl] = useState(SITE_URL);
  useEffect(() => setPlayUrl(`${window.location.origin}${BASE_PATH}/`), []);
  useEffect(() => {
    document.body.dataset.booth = "1";
    return () => {
      delete document.body.dataset.booth;
    };
  }, []);
  return (
    <div className="bg-plum-gradient fixed inset-0 z-[60] flex flex-col overflow-auto text-white">
      <div className="flex items-center gap-6 bg-white px-16 py-4 text-ink">
        {logo}
        <p className="flex-1 text-h3 font-extrabold">{CLUB_NAME}</p>
        <LivePill light />
      </div>
      <div className="flex flex-1 gap-14 px-16 py-10">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <h1 className="font-display text-[72px] leading-none text-rose whitespace-nowrap">GLOBAL MYTH BUSTERS</h1>
          <p className="text-[32px] leading-tight">One community. Five challenges. Every fact makes a difference.</p>
          {!board ? null : board.total_players === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              <Character id="pinky" size={240} motion="wave" />
              <p className="font-display text-[64px] leading-none">Be the first Myth Buster!</p>
              <p className="text-[28px]">Scan the code to play on your phone.</p>
            </div>
          ) : (
            <>
              <Podium rows={board.rows.slice(0, 3)} big />
              <RankTable rows={board.rows.slice(3, 10)} big />
            </>
          )}
        </div>
        <aside className="flex w-[420px] shrink-0 flex-col gap-6">
          <BoothQr title="Scan to play" value={playUrl} text="Play on your phone — no account needed." caption="Game homepage" />
          <BoothQr title="Join our club" value={CLUB_FORM} text={CLUB_NAME} caption="forms.gle/5tkfQ8CGDw3QFPLy5" />
        </aside>
      </div>
    </div>
  );
}

function BoothQr({ title, value, text, caption }: { title: string; value: string; text: string; caption: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-ui bg-white p-7 text-center text-ink">
      <h2 className="text-h2 font-extrabold">{title}</h2>
      <QrCode value={value} size={228} label={`QR code: ${title}`} />
      <p className="text-body-lg">{text}</p>
      <p className="text-caption opacity-70">{caption}</p>
    </div>
  );
}
