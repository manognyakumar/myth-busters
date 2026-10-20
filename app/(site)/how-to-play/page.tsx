import type { Metadata } from "next";
import { Avatar } from "@/components/characters/Character";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { CharacterId } from "@/lib/characters";

export const metadata: Metadata = { title: "How to play" };

const GAMES: { title: string; avatar: CharacterId; steps: string[] }[] = [
  {
    title: "Quizzes",
    avatar: "rosie",
    steps: [
      "Read the statement on screen.",
      "Choose MYTH or FACT — or pick “Not sure”. That’s okay too.",
      "See the answer, a simple explanation and a trusted source.",
      "Earn 100 points for each correct answer, plus up to 50 for speed when the timer is on.",
      "Incorrect, not sure or timed out? 0 points for that question. You never lose points.",
    ],
  },
  {
    title: "Bee Pairs",
    avatar: "pinky",
    steps: [
      "Choose Easy (8 cards, no timer) or Challenge (16 cards).",
      "Flip two cards to find a pair: a myth and its correction, or a theme and its action.",
      "Matched cards stay face up and explain the connection. Tap the speaker to hear it read aloud.",
      "Not a match? The cards turn back over — try to remember where they were.",
      "Finish to see a fact sheet of every pair you matched.",
    ],
  },
];

const POINTS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "trophy",
    title: "Myth Buster Points",
    text: "Every finished round becomes 0–1,000 points, so quizzes and Bee Pairs count equally on one leaderboard.",
  },
  { icon: "question", title: "Quizzes", text: "100 per correct answer + up to 50 speed bonus (timed). Untimed rounds get no speed bonus." },
  { icon: "grid", title: "Bee Pairs", text: "Start at 2,000. −25 per second, −50 per incorrect flip, minimum 200. Challenge Mode × 1.5." },
  {
    icon: "users",
    title: "Keyboard & access",
    text: "M = Myth, F = Fact, N = Not sure. Arrow keys + Enter in Bee Pairs. Timer can always be turned off.",
  },
];

/** Figma 04 How to play (8:695). */
export default function HowToPlayPage() {
  return (
    <>
      <section className="bg-blush">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-10 lg:px-16 lg:py-14">
          <h1 className="font-display text-[40px] leading-none lg:text-title">How to play</h1>
          <p className="text-body lg:text-body-lg">
            Two kinds of games, one global leaderboard. Play on your own, at your own pace — no host, no room codes, no account.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-10 lg:grid-cols-2 lg:px-16 lg:py-14">
        {GAMES.map((g) => (
          <article key={g.title} className="flex flex-col gap-5 rounded-ui border border-warm-gray bg-white p-6 lg:p-8">
            <div className="flex items-center gap-4">
              <Avatar id={g.avatar} size={64} />
              <h2 className="text-h2 font-extrabold">{g.title}</h2>
            </div>
            <ol className="flex flex-col gap-5">
              {g.steps.map((s, i) => (
                <li key={s} className="flex items-start gap-4 text-body">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-magenta text-label font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1 leading-7">{s}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>
      <section aria-labelledby="points" className="bg-lavender">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-10 lg:px-16 lg:py-14">
          <h2 id="points" className="text-h2 font-extrabold">
            How points work
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {POINTS.map((p) => (
              <div key={p.title} className="flex flex-col gap-2.5 rounded-ui bg-white p-6">
                <Icon name={p.icon} size={28} className="text-magenta" />
                <h3 className="text-h3 font-extrabold">{p.title}</h3>
                <p className="text-body">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="mx-auto flex max-w-[1440px] flex-wrap gap-4 px-4 py-12 lg:px-16">
        <ButtonLink href="/play" size="large">
          Play now
        </ButtonLink>
        <ButtonLink href="/pink-pairs" size="large" variant="secondary">
          Try Bee Pairs
        </ButtonLink>
      </div>
    </>
  );
}
