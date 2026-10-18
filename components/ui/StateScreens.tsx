import { Character } from "@/components/characters/Character";
import type { CharacterId } from "@/lib/characters";
import { ButtonLink } from "./Button";

export function Loading({ label = "Loading…", dark = false }: { label?: string; dark?: boolean }) {
  return (
    <div role="status" className={`flex min-h-[50vh] items-center justify-center p-8 text-body-lg ${dark ? "text-blush" : "text-ink"}`}>
      {label}
    </div>
  );
}

/** Friendly retry message for database/network errors. */
export function ErrorPanel({
  message,
  onRetry,
  dark = false,
  character = "bloom",
}: {
  message: string;
  onRetry?: () => void;
  dark?: boolean;
  character?: CharacterId;
}) {
  return (
    <div role="alert" className={`mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center ${dark ? "text-white" : "text-ink"}`}>
      <Character id={character} size={120} />
      <p className="text-h3 font-extrabold">Something didn’t load</p>
      <p className="text-body">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-12 items-center rounded-ui border-2 border-magenta bg-magenta px-6 py-3 text-label font-semibold text-white hover:bg-magenta-deep"
          >
            Try again
          </button>
        )}
        <ButtonLink href="/" variant={dark ? "onPlum" : "secondary"}>
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
