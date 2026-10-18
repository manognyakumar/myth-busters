import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PairsGame } from "@/components/pairs/PairsGame";

export function generateStaticParams() {
  return [{ mode: "easy" }, { mode: "challenge" }];
}

export const metadata: Metadata = { title: "Pink Pairs" };

export default async function PairsPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  if (mode !== "easy" && mode !== "challenge") notFound();
  return <PairsGame mode={mode} />;
}
