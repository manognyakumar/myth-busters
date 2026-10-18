"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Toggle } from "@/components/ui/Toggle";
import { getTimerOn, setTimerOn } from "@/lib/prefs";

/** Figma Round options (7:748). */
export function TimerOption() {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(getTimerOn()), []);
  return (
    <div className="flex items-center gap-4 py-6">
      <Icon name="clock" className="hidden sm:inline-block" />
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-label font-semibold">Question timer: 20 seconds per question</p>
        <p className="text-caption opacity-70">
          Turn it off for untimed play. Untimed rounds earn no speed bonus but still count on the leaderboard.
        </p>
      </div>
      <span className="hidden text-label font-semibold sm:inline" aria-hidden>
        Timer {on ? "on" : "off"}
      </span>
      <Toggle
        checked={on}
        label="Question timer"
        onChange={(v) => {
          setOn(v);
          setTimerOn(v);
        }}
      />
    </div>
  );
}
