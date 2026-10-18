import { Suspense } from "react";
import type { Metadata } from "next";
import { StartScreen } from "./StartScreen";

export const metadata: Metadata = { title: "Pick a nickname" };

export default function StartPage() {
  return (
    <Suspense>
      <StartScreen />
    </Suspense>
  );
}
