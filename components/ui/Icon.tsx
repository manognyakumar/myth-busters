import type { CSSProperties } from "react";
import { asset } from "@/lib/site";

export type IconName =
  | "check" | "x" | "question" | "lock" | "star" | "ribbon" | "speaker" | "clock"
  | "trophy" | "arrow" | "external" | "bulb" | "book" | "heart" | "search" | "users"
  | "menu" | "grid" | "chart" | "user" | "shield" | "refresh" | "play";

/** Figma line icons (Components page, 5:3–5:79), recoloured via currentColor. */
export function Icon({
  name,
  size = 24,
  className = "",
  label,
}: {
  name: IconName;
  size?: number;
  className?: string;
  label?: string;
}) {
  const style = {
    "--icon": `url(${asset(`/figma/icons/${name}.svg`)})`,
    width: size,
    height: size,
  } as CSSProperties;
  return (
    <span
      className={`icon ${className}`}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
