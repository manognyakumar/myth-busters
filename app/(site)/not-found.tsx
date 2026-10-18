import { Character } from "@/components/characters/Character";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
      <Character id="monster" size={160} />
      <h1 className="font-display text-[40px] leading-none">Page not found</h1>
      <p className="text-body-lg">Sounds convincing… but this page doesn’t exist.</p>
      <ButtonLink href="/" size="large">
        Back to home
      </ButtonLink>
    </div>
  );
}
