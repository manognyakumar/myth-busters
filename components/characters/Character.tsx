import { CHARACTERS, type CharacterId } from "@/lib/characters";
import { asset } from "@/lib/site";

export type CharacterMotion = "none" | "bob" | "wave" | "pop" | "dissolve";

/** Figma Character/* components (3:3 … 3:71). Original SVG art, 200×200 viewBox. */
export function Character({
  id,
  size = 200,
  motion = "none",
  className = "",
  decorative = true,
}: {
  id: CharacterId;
  size?: number;
  motion?: CharacterMotion;
  className?: string;
  decorative?: boolean;
}) {
  const c = CHARACTERS[id];
  const anim = motion === "none" ? "" : `anim-${motion}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(`/figma/characters/${c.file}.svg`)}
      width={size}
      height={size}
      alt={decorative ? "" : `${c.name}, ${c.role}`}
      className={`block shrink-0 ${anim} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Figma Avatar/* components (3:91 … 3:163): 64px circle, 3px ring, art at 100px offset (-21,-15). */
export function Avatar({ id, size = 64, className = "" }: { id: CharacterId; size?: number; className?: string }) {
  const c = CHARACTERS[id];
  const k = size / 64;
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full border-solid ${c.ring} ${c.fill} ${className}`}
      style={{ width: size, height: size, borderWidth: 3 * k }}
      role="img"
      aria-label={c.name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(`/figma/avatars/${c.file}.svg`)}
        width={100}
        height={100}
        alt=""
        className="absolute max-w-none"
        style={{ width: 100 * k, height: 100 * k, left: -21 * k, top: -15 * k }}
      />
    </span>
  );
}
