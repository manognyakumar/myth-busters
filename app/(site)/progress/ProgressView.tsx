"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/characters/Character";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/game";
import { ErrorPanel, Loading } from "@/components/ui/StateScreens";
import { ProfileForm } from "@/components/player/ProfileForm";
import { RecoveryPanel } from "@/components/player/Recovery";
import { CHARACTERS } from "@/lib/characters";
import { getCategory } from "@/lib/categories";
import { api, ApiFailure, errorText, usePlayer } from "@/lib/player";

type Progress = {
  total_nmbp: number;
  rounds_completed: number;
  categories_completed: number;
  best_nmbp: number;
  rank: number | null;
  quiz_accuracy: number | null;
  pairs_best: { easy: number | null; challenge: number | null } | null;
  achievements: { id: string; name: string; rule: string; earned: boolean }[];
  recent: { attempt_id: string; category: string; mode: string; nmbp: number; raw_score: number; completed_at: string }[];
};

const fmt = (n: number) => n.toLocaleString("en-US");
const time = (s: number | null | undefined) => (s == null ? "Not played yet" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

/** Figma 13 My progress & achievements (10:3049). Same data as the global leaderboard. */
export function ProgressView() {
  const { ready, profile } = usePlayer();
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api<Progress>("/api/progress"));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiFailure ? e.code : "server_error");
    }
  }, []);

  useEffect(() => {
    if (ready && profile) void load();
    if (typeof window !== "undefined" && window.location.hash === "#profile") setEditing(true);
  }, [ready, profile, load]);

  if (!ready) return <Loading />;
  if (!profile) {
    return (
      <div className="mx-auto flex max-w-[960px] flex-col gap-6 px-4 py-12">
        <h1 className="font-display text-[40px] leading-none lg:text-title">My progress</h1>
        <p className="text-body-lg">You haven’t picked a nickname on this device yet.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/start?next=/progress" size="large">
            Pick a nickname
          </ButtonLink>
        </div>
        <RecoveryPanel />
      </div>
    );
  }

  return (
    <>
      <section id="profile" className="bg-blush">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 lg:flex-row lg:items-center lg:px-16 lg:py-12">
          <Avatar id={profile.character} size={104} />
          <div className="flex flex-1 flex-col gap-1">
            <h1 className="font-display text-[36px] leading-none lg:text-title">{profile.nickname}</h1>
            <p className="text-body">Guide: {CHARACTERS[profile.character].name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
              Change nickname or character
            </Button>
            <ButtonLink href="/play">Continue playing</ButtonLink>
          </div>
        </div>
        {editing && (
          <div className="mx-auto max-w-[1440px] px-4 pb-10 lg:px-16">
            <div className="rounded-ui bg-white p-6">
              <ProfileForm submitLabel="Save changes" onSaved={() => setEditing(false)} />
            </div>
          </div>
        )}
      </section>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 py-10 lg:px-16 lg:py-14">
        {error ? (
          <ErrorPanel message={errorText(error)} onRetry={load} />
        ) : !data ? (
          <Loading />
        ) : (
          <>
            <section aria-labelledby="numbers" className="flex flex-col gap-4">
              <h2 id="numbers" className="text-h2 font-extrabold">
                Your numbers
              </h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                <Num label="Total Myth Buster Points" value={fmt(data.total_nmbp)} highlight />
                <Num label="Global rank" value={data.rank ? `#${data.rank}` : "Not ranked yet"} />
                <Num label="Completed rounds" value={String(data.rounds_completed)} />
                <Num label="Categories explored" value={`${data.categories_completed} / 5`} />
                <Num label="Personal best" value={data.rounds_completed ? `${data.best_nmbp} NMBP` : "—"} />
                <Num label="Quiz accuracy" value={data.quiz_accuracy == null ? "—" : `${Math.round(data.quiz_accuracy * 100)}%`} />
                <Num label="Pink Pairs best, Easy" value={time(data.pairs_best?.easy)} />
                <Num label="Pink Pairs best, Challenge" value={time(data.pairs_best?.challenge)} />
              </div>
            </section>

            <section aria-labelledby="achievements" className="flex flex-col gap-3">
              <h2 id="achievements" className="text-h2 font-extrabold">
                Achievements
              </h2>
              <p className="text-body">Badges are awarded only after the server checks your round.</p>
              <ul className="grid grid-cols-2 justify-items-center gap-6 rounded-ui bg-blush p-6 sm:grid-cols-4 lg:grid-cols-8">
                {data.achievements.map((a) => (
                  <li key={a.id}>
                    <Badge name={a.name} rule={a.rule} earned={a.earned} />
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="recent" className="flex flex-col gap-3">
              <h2 id="recent" className="text-h2 font-extrabold">
                Recent rounds
              </h2>
              {data.recent.length === 0 ? (
                <p className="text-body">
                  No rounds yet.{" "}
                  <Link href="/play" className="font-semibold text-magenta underline">
                    Play your first round
                  </Link>
                </p>
              ) : (
                <table className="w-full border-separate border-spacing-y-2 text-left">
                  <thead className="text-caption opacity-70">
                    <tr>
                      <th className="px-3 font-normal">Category</th>
                      <th className="hidden px-3 font-normal sm:table-cell">Mode</th>
                      <th className="hidden px-3 font-normal sm:table-cell">Score</th>
                      <th className="px-3 font-normal">Myth Buster Points</th>
                      <th className="px-3 font-normal">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((r) => (
                      <tr key={r.attempt_id} className="text-body">
                        <td className="rounded-l-ui border-y border-l border-warm-gray px-3 py-2.5">
                          <Link href={`/results/${r.attempt_id}`} className="hover:underline">
                            {getCategory(r.category)?.title}
                          </Link>
                        </td>
                        <td className="hidden border-y border-warm-gray px-3 sm:table-cell">{modeName(r.mode)}</td>
                        <td className="hidden border-y border-warm-gray px-3 sm:table-cell">{fmt(r.raw_score)}</td>
                        <td className="border-y border-warm-gray px-3 font-semibold text-magenta">+{r.nmbp}</td>
                        <td className="rounded-r-ui border-y border-r border-warm-gray px-3">{when(r.completed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
        <RecoveryPanel />
      </div>
    </>
  );
}

function modeName(m: string) {
  return m === "pairs_easy" ? "Easy" : m === "pairs_challenge" ? "Challenge" : "Quiz";
}

function when(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : d.toLocaleDateString();
}

function Num({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 rounded-ui p-4 ${highlight ? "bg-magenta text-white" : "border border-warm-gray bg-white"}`}>
      <span className="text-label-sm font-semibold">{label}</span>
      <span className="text-[24px] font-extrabold leading-tight lg:text-[32px]">{value}</span>
    </div>
  );
}
