import Link from "next/link";
import { CLINIC_LINE, CLUB_FORM, CLUB_NAME, CLUB_SITE, DISCLAIMER_SHORT } from "@/lib/site";

/** Figma Footer (6:453). Every page. */
export function Footer() {
  return (
    <footer className="bg-plum">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-6 px-4 py-8 md:flex-row md:gap-12 md:px-12 md:py-10">
        <div className="flex w-full flex-col gap-2.5 md:flex-1">
          <a href={CLUB_SITE} target="_blank" rel="noopener" className="text-label font-semibold text-white underline">
            Built by {CLUB_NAME}
          </a>
          <p className="text-caption text-lavender-mid">{DISCLAIMER_SHORT}</p>
        </div>
        <div className="flex w-full flex-col items-start gap-3 md:w-[360px]">
          <a href={CLUB_FORM} target="_blank" rel="noopener" className="text-label font-semibold text-white underline">
            Join our club
          </a>
          <p className="text-body text-blush">{CLINIC_LINE}</p>
          <Link href="/privacy" className="text-label font-semibold text-white underline">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
