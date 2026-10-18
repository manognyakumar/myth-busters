import Link from "next/link";
import { CLUB_FORM, CLUB_NAME } from "@/lib/site";
import { BrandLogo } from "./BrandLogo";
import { MobileMenu } from "./MobileMenu";
import { NAV } from "@/lib/nav";

/** Figma Header (6:435): white strip, logo on white only, full club name. */
export function Header() {
  return (
    <header className="relative border-b border-warm-gray bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2.5 lg:gap-6 lg:px-12 lg:py-3.5">
        <Link href="/" aria-label="Myth Busters home" className="shrink-0">
          <BrandLogo />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Link href="/" className="hidden text-label font-semibold text-magenta lg:block">
            Myth Busters
          </Link>
          <p className="text-[11px] leading-[1.5] lg:text-caption">{CLUB_NAME}</p>
        </div>
        <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap text-label font-semibold hover:text-magenta">
              {n.label}
            </Link>
          ))}
        </nav>
        <a
          href={CLUB_FORM}
          target="_blank"
          rel="noopener"
          className="hidden min-h-12 items-center rounded-ui border-2 border-magenta bg-white px-6 py-3 text-label font-semibold text-magenta hover:bg-blush lg:inline-flex"
        >
          Join our club
        </a>
        <MobileMenu />
      </div>
    </header>
  );
}
