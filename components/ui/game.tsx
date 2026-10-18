import { Icon } from "./Icon";

/** Figma Answer Button (5:147). Correctness never relies on colour alone. */
export type Choice = "MYTH" | "FACT" | "NOT_SURE";

export function AnswerButton({
  choice,
  onClick,
  disabled,
  selected,
  compact = false,
}: {
  choice: Choice;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  compact?: boolean;
}) {
  const sel = selected ? "ring-4 ring-rose ring-offset-2 ring-offset-plum" : "";
  if (choice === "NOT_SURE") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-keyshortcuts="N"
        className={`flex h-16 w-full items-center justify-center gap-3 rounded-answer bg-lavender px-6 py-4 text-ink disabled:opacity-85 ${sel}`}
      >
        <span className="flex items-center justify-center rounded-full bg-white p-1.5">
          <Icon name="question" size={20} />
        </span>
        <span className="text-label font-semibold">NOT SURE</span>
        <span className="text-caption opacity-75">Press N</span>
      </button>
    );
  }
  const isFact = choice === "FACT";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-keyshortcuts={isFact ? "F" : "M"}
      className={`flex w-full flex-col items-center justify-center gap-2.5 rounded-answer p-6 disabled:opacity-85 ${
        compact ? "h-[168px]" : "h-[168px]"
      } ${isFact ? "bg-magenta text-white hover:bg-magenta-deep" : "border-2 border-plum bg-white text-ink hover:bg-blush"} ${sel}`}
    >
      <span className={`flex items-center justify-center rounded-full p-2.5 ${isFact ? "bg-white text-magenta" : "bg-plum text-white"}`}>
        <Icon name={isFact ? "check" : "x"} size={28} />
      </span>
      <span className="text-h2 font-extrabold">{isFact ? "FACT" : "MYTH"}</span>
      <span className="text-caption opacity-75">{isFact ? "Press F" : "Press M"}</span>
    </button>
  );
}

export type FeedbackResult = "correct" | "incorrect" | "not_sure" | "timeout";

/** Figma Feedback Tag (5:171). */
export function FeedbackTag({ result }: { result: FeedbackResult }) {
  const map = {
    correct: { cls: "bg-success text-white", icon: "check", text: "Correct" },
    incorrect: { cls: "bg-blush text-ink", icon: "x", text: "Not quite" },
    not_sure: { cls: "bg-lavender text-ink", icon: "question", text: "Answer revealed" },
    timeout: { cls: "bg-lavender text-ink", icon: "clock", text: "Time’s up — answer revealed" },
  } as const;
  const m = map[result];
  return (
    <span className={`inline-flex items-center gap-2 rounded-tag px-3.5 py-2 text-label font-semibold ${m.cls}`}>
      <Icon name={m.icon} size={20} />
      {m.text}
    </span>
  );
}

/** Figma Progress Bar (5:173): rose fill on a 20% white track. */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="relative h-2.5 w-full overflow-hidden rounded-[5px] bg-track"
    >
      <div className="absolute inset-y-0 left-0 rounded-[5px] bg-rose transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Figma Timer Ring (5:183): rose ring, blush in the last 5 seconds. No red. */
export function TimerRing({ remaining, total, size = 72 }: { remaining: number; total: number; size?: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, remaining / total));
  const last5 = remaining <= 5;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="timer" aria-label={`${Math.ceil(remaining)} seconds left`}>
      <svg viewBox="0 0 72 72" width={size} height={size} className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-track" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          stroke="currentColor"
          className={last5 ? "text-blush" : "text-rose"}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-extrabold ${last5 ? "text-blush" : "text-white"}`}
        style={{ fontSize: size / 3 }}
        aria-hidden
      >
        {Math.ceil(remaining)}
      </span>
    </div>
  );
}

/** Figma Badge (5:199). */
export function Badge({ name, rule, earned }: { name: string; rule: string; earned: boolean }) {
  return (
    <div className="flex w-[140px] flex-col items-center gap-2 text-center">
      <span className={`flex size-[72px] items-center justify-center rounded-full ${earned ? "bg-magenta text-white" : "bg-lavender text-ink"}`}>
        <Icon name={earned ? "star" : "lock"} size={32} label={earned ? "Earned" : "Locked"} />
      </span>
      <p className="text-label font-semibold">{name}</p>
      <p className="text-caption opacity-70">{rule}</p>
    </div>
  );
}

/** Small chip used on category cards (4px corners). */
export function Chip({ children, tone = "white" }: { children: React.ReactNode; tone?: "white" | "rose" | "magenta" | "plum" }) {
  const t = {
    white: "bg-white text-ink",
    rose: "bg-rose text-plum",
    magenta: "bg-magenta text-white",
    plum: "bg-plum text-white",
  }[tone];
  return <span className={`inline-flex items-center rounded-tag px-2 py-1 text-label-sm font-semibold ${t}`}>{children}</span>;
}
