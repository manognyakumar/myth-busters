"use client";

import { useState } from "react";
import { Avatar, Character } from "@/components/characters/Character";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorPanel, Loading } from "@/components/ui/StateScreens";
import { CLUB_NAME } from "@/lib/site";
import { useLeaderboard, type Me, type Row } from "./useLeaderboard";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/** Figma 12 Global leaderboard (10:2049) and 12b empty state (10:2453). */
export function LeaderboardView() {
  const [page, setPage] = useState(0);
  const { board, error, reload } = useLeaderboard(page);
  const myNick = board?.me?.profile?.nickname?.toLowerCase();

  return (
    <div className="bg-plum-gradient text-white">
      <section className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 pb-6 pt-8 lg:flex-row lg:items-end lg:gap-6 lg:px-16 lg:pt-12">
        <div className="flex flex-1 flex-col gap-2.5">
          <h1 className="font-display text-[clamp(30px,3.6vw,52px)] leading-none text-rose">GLOBAL MYTH BUSTERS</h1>
          <p className="text-body-lg">One community. Five challenges. Every fact makes a difference.</p>
          <p className="text-caption text-lavender-mid">Hosted by {CLUB_NAME}</p>
        </div>
        <LivePill />
        <ButtonLink href="/play" size="large">
          PLAY NOW
        </ButtonLink>
      </section>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 pb-16 pt-4 lg:flex-row lg:items-start lg:px-16">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {error && !board ? (
            <ErrorPanel dark message="We couldn’t load the leaderboard. Check your connection and try again." onRetry={reload} />
          ) : !board ? (
            <Loading dark label="Loading the leaderboard…" />
          ) : board.total_players === 0 ? (
            <EmptyState />
          ) : (
            <>
              {page === 0 && <Podium rows={board.rows.slice(0, 3)} myNick={myNick} />}
              <RankTable rows={page === 0 ? board.rows.slice(3) : board.rows} myNick={myNick} />
              <div className="flex flex-wrap items-center gap-3 py-2">
                <p className="flex-1 text-caption text-lavender-mid">
                  Showing {page === 0 ? "the top 50" : `ranks ${page * 50 + 1}–${page * 50 + board.rows.length}`} of {board.total_players}{" "}
                  player{board.total_players === 1 ? "" : "s"} across all five categories
                </p>
                {page > 0 && (
                  <Button variant="onPlum" onClick={() => setPage((p) => p - 1)}>
                    Previous 50
                  </Button>
                )}
                {(page + 1) * 50 < board.total_players && (
                  <Button variant="onPlum" onClick={() => setPage((p) => p + 1)}>
                    Next 50
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
        <MyRanking me={board?.me ?? null} />
      </div>
    </div>
  );
}

export function LivePill({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-ui px-3 py-2 text-label-sm font-semibold ${
        light ? "bg-blush text-ink" : "bg-row text-white"
      }`}
    >
      <span className="size-2.5 rounded-full bg-rose" aria-hidden />
      Live, updates automatically
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-ui bg-row px-6 py-12 text-center">
      <Character id="pinky" size={200} motion="wave" />
      <h2 className="font-display text-[32px] leading-none lg:text-[48px]">Be the first Myth Buster!</h2>
      <p className="max-w-[560px] text-body lg:text-body-lg">
        No rounds have been completed yet. Finish any round in any category to put your nickname on the global leaderboard.
      </p>
      <ButtonLink href="/play" size="large">
        PLAY NOW
      </ButtonLink>
    </div>
  );
}

const PODIUM = [
  { place: 2, h: "h-[120px]", bg: "bg-silver", avatar: 74 },
  { place: 1, h: "h-[170px]", bg: "bg-gold", avatar: 90 },
  { place: 3, h: "h-[90px]", bg: "bg-bronze", avatar: 74 },
];

/** Figma Podium (10:2080). */
export function Podium({ rows, myNick, big = false }: { rows: Row[]; myNick?: string; big?: boolean }) {
  return (
    <ol className="flex items-end justify-center gap-3 pb-4 pt-2 lg:gap-4" aria-label="Top three">
      {PODIUM.map(({ place, h, bg, avatar }) => {
        const r = rows[place - 1];
        return (
          <li key={place} className={`flex flex-col items-center gap-2 ${big ? "w-[220px]" : "w-[104px] sm:w-[180px]"}`}>
            {r ? (
              <>
                <Avatar id={r.character} size={big ? avatar + 22 : avatar} />
                <span className="max-w-full truncate text-center text-label font-semibold">
                  {r.nickname}
                  {r.nickname.toLowerCase() === myNick && <span className="sr-only"> (you)</span>}
                </span>
                <span className="text-label-sm font-semibold text-rose">{fmt(r.total_nmbp)} pts</span>
              </>
            ) : (
              <span className="text-caption text-lavender-mid">Waiting for a player</span>
            )}
            <span
              className={`flex w-full items-center justify-center rounded-ui ${bg} ${h} font-display text-[56px] leading-none text-plum`}
              aria-label={`Place ${place}`}
            >
              {place}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Figma Leaderboard Row (6:406) + table header (10:2181). */
export function RankTable({ rows, myNick, big = false }: { rows: Row[]; myNick?: string; big?: boolean }) {
  if (rows.length === 0) return null;
  return (
    <table className="w-full border-separate border-spacing-y-3">
      <caption className="sr-only">Global ranking</caption>
      <thead className="hidden text-caption text-lavender-mid md:table-header-group">
        <tr>
          <th scope="col" className="w-[72px] px-6 text-left font-normal">
            Rank
          </th>
          <th scope="col" className="text-left font-normal">
            Player
          </th>
          <th scope="col" className="w-[90px] text-right font-normal">
            Rounds
          </th>
          <th scope="col" className="w-[110px] text-right font-normal">
            Categories
          </th>
          <th scope="col" className="w-[100px] text-right font-normal">
            Avg NMBP
          </th>
          <th scope="col" className="w-[170px] pr-6 text-right font-normal">
            Myth Buster Points
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const you = r.nickname.toLowerCase() === myNick;
          const cell = you ? "bg-magenta" : "bg-row";
          const sub = you ? "text-white" : "text-lavender-mid";
          return (
            <tr key={r.rank} className={big ? "text-[22px]" : ""}>
              <td className={`${cell} rounded-l-ui py-3.5 pl-4 md:pl-6 ${you ? "border-y-2 border-l-2 border-rose" : ""}`}>
                <span className={`text-h3 font-extrabold ${you ? "text-white" : "text-rose"}`}>{r.rank}</span>
              </td>
              <td className={`${cell} py-3.5 ${you ? "border-y-2 border-rose" : ""}`}>
                <span className="flex items-center gap-3 md:gap-5">
                  <Avatar id={r.character} size={48} />
                  <span className="truncate text-label font-semibold">{r.nickname}</span>
                  {you && <span className="rounded-tag bg-white px-2 py-0.5 text-label-sm font-semibold text-magenta">You</span>}
                </span>
                <span className={`mt-1 block text-caption md:hidden ${sub}`}>
                  {r.rounds_completed} rounds · {r.categories_completed} categories · avg {fmt(r.avg_nmbp)}
                </span>
              </td>
              <Num cell={cell} you={you} value={r.rounds_completed} label="rounds" />
              <Num cell={cell} you={you} value={r.categories_completed} label="categories" />
              <Num cell={cell} you={you} value={r.avg_nmbp} label="avg NMBP" />
              <td className={`${cell} rounded-r-ui py-3.5 pr-4 text-right md:pr-6 ${you ? "border-y-2 border-r-2 border-rose" : ""}`}>
                <span className={`block text-h3 font-extrabold ${you ? "text-white" : "text-rose"}`}>{fmt(r.total_nmbp)}</span>
                <span className={`block text-caption ${sub}`}>Myth Buster Points</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Num({ cell, you, value, label }: { cell: string; you: boolean; value: number; label: string }) {
  return (
    <td className={`${cell} hidden py-3.5 text-right md:table-cell ${you ? "border-y-2 border-rose" : ""}`}>
      <span className="block text-label font-semibold">{fmt(value)}</span>
      <span className={`block text-caption ${you ? "text-white" : "text-lavender-mid"}`}>{label}</span>
    </td>
  );
}

/** Figma My Ranking (10:2404): personal view of the same global leaderboard. */
function MyRanking({ me }: { me: Me | null }) {
  const earned = me?.achievements?.filter((a) => a.earned).length ?? 0;
  const totalAch = me?.achievements?.length ?? 8;
  return (
    <aside aria-labelledby="my-ranking" className="flex flex-col gap-4 rounded-ui bg-white p-6 text-ink lg:w-[340px] lg:shrink-0">
      <h2 id="my-ranking" className="text-h3 font-extrabold">
        My Ranking
      </h2>
      {me?.profile ? (
        <>
          <div className="flex items-center gap-3">
            <Avatar id={me.profile.character} size={64} />
            <div className="flex flex-col gap-0.5">
              <span className="text-label font-semibold">{me.profile.nickname}</span>
              <span className={`font-extrabold leading-[1.1] text-magenta ${me.rank ? "text-h2" : "text-h3"}`}>
                {me.rank ? `Rank #${me.rank}` : "Not ranked yet"}
              </span>
            </div>
          </div>
          <dl className="flex flex-col">
            {[
              ["Total Myth Buster Points", fmt(me.total_nmbp)],
              ["Completed rounds", String(me.rounds_completed)],
              ["Categories explored", `${me.categories_completed} / 5`],
              ["Achievements", `${earned} / ${totalAch}`],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2 border-t border-warm-gray py-2">
                <dt className="flex-1 text-body">{k}</dt>
                <dd className="text-label font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <ButtonLink href="/play" className="w-full">
            Continue playing
          </ButtonLink>
        </>
      ) : (
        <>
          <p className="text-body">Pick a nickname and finish any round to see your rank here.</p>
          <ButtonLink href="/start" className="w-full">
            Start playing
          </ButtonLink>
        </>
      )}
    </aside>
  );
}
