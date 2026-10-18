import type { Metadata } from "next";
import { ResultsScreen } from "@/components/results/ResultsScreen";

export const metadata: Metadata = { title: "Round results" };

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  return <ResultsScreen attemptId={(await params).id} />;
}
