import type { Metadata } from "next";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { BoothBoard } from "@/components/leaderboard/BoothBoard";
import { BrandLogo } from "@/components/ui/BrandLogo";

export const metadata: Metadata = { title: "Global leaderboard" };

/** The one global leaderboard. `?display=booth` shows the same ranking full-screen for a TV. */
export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ display?: string }> }) {
  const { display } = await searchParams;
  if (display === "booth") return <BoothBoard logo={<BrandLogo large />} />;
  return <LeaderboardView />;
}
