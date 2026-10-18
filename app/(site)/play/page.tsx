import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ButtonLink } from "@/components/ui/Button";
import { PlayingAs } from "@/components/player/PlayingAs";
import { TimerOption } from "./TimerOption";

export const metadata: Metadata = { title: "Pick a challenge" };

/** Figma 03 Category selection (7:689). */
export default function PlayPage() {
  return (
    <>
      <section className="bg-blush">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-5 px-4 py-10 lg:flex-row lg:items-center lg:px-16 lg:py-14">
          <div className="flex flex-1 flex-col gap-3">
            <h1 className="font-display text-[40px] leading-none lg:text-title">Pick a challenge</h1>
            <p className="text-body lg:text-body-lg">
              Play any category, in any order. Every completed round adds to your Myth Buster Points on one global leaderboard.
            </p>
          </div>
          <PlayingAs />
        </div>
      </section>
      <div className="mx-auto max-w-[1440px] px-4 lg:px-16">
        <TimerOption />
        <CategoryGrid />
        <div className="flex flex-wrap gap-4 py-10 lg:pb-[72px]">
          <ButtonLink href="/leaderboard" variant="soft">
            Global leaderboard
          </ButtonLink>
          <ButtonLink href="/progress" variant="soft">
            My progress
          </ButtonLink>
          <ButtonLink href="/how-to-play" variant="soft">
            How to play
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
