"use client";

import { CLUB_FORM, CLUB_NAME } from "@/lib/site";
import { Icon } from "./Icon";
import { QrCode } from "./QrCode";
import { trackCta } from "@/lib/api";

/** Figma Club CTA (6:959). Shown on every results screen and on Beyond the Game. */
export function ClubCta({ className = "" }: { className?: string }) {
  return (
    <section
      aria-labelledby="club-cta-heading"
      className={`flex flex-col items-start gap-8 rounded-ui bg-magenta p-6 text-white md:flex-row md:items-center md:p-10 ${className}`}
    >
      <div className="flex flex-1 flex-col items-start gap-3">
        <h2 id="club-cta-heading" className="text-h2 font-extrabold">
          Enjoyed Myth Busters?
        </h2>
        <p className="text-body-lg">
          This game was built by {CLUB_NAME}. Join us to build more projects like this.
        </p>
        <a
          href={CLUB_FORM}
          target="_blank"
          rel="noopener"
          onClick={() => trackCta("join_clicked")}
          className="inline-flex min-h-12 items-center gap-2.5 rounded-ui border-2 border-magenta bg-white px-6 py-3 text-label font-semibold text-magenta hover:bg-blush"
        >
          Join our club
          <Icon name="arrow" size={20} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
      <div className="flex flex-col items-center gap-2">
        <QrCode value={CLUB_FORM} label="QR code linking to the club sign-up form" />
        <p className="text-caption">Scan to join</p>
      </div>
    </section>
  );
}
