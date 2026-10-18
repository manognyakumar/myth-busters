"use client";

/** Switch (Figma "toggle" 7:757): magenta track when on, warm-gray when off. */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex min-h-12 items-center"
    >
      <span className={`relative h-[30px] w-[52px] rounded-full transition-colors ${checked ? "bg-magenta" : "bg-warm-gray"}`}>
        <span className={`absolute top-[3px] size-6 rounded-full bg-white transition-[left] ${checked ? "left-[25px]" : "left-[3px]"}`} />
      </span>
    </button>
  );
}
