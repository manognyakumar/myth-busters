import { Icon, type IconName } from "./Icon";
import { asset } from "@/lib/site";

export type PairCardState = "back" | "face" | "matched";

/** Figma Pair Card (6:291). 10px corners, ≤12 words of text. */
export function PairCardView({
  state,
  kind,
  text,
  icon = "search",
  className = "",
}: {
  state: PairCardState;
  kind?: string;
  text?: string;
  icon?: IconName;
  className?: string;
}) {
  if (state === "back") {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 rounded-pair bg-magenta p-4 text-white ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/figma/bee-outline.svg")} width={72} height={72} alt="" className="size-[72px]" />
        <span className="text-label-sm font-semibold">Myth Busters</span>
      </div>
    );
  }
  const matched = state === "matched";
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-pair p-4 text-center ${
        matched ? "border-2 border-magenta bg-blush" : "border border-warm-gray bg-white"
      } ${className}`}
    >
      <span className="flex items-center gap-1.5 text-label-sm font-semibold text-magenta">
        <Icon name={matched ? "check" : icon} size={18} />
        {matched ? "Matched" : kind}
      </span>
      <span className="text-body text-ink">{text}</span>
    </div>
  );
}
