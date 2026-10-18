import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CLUB_NAME, CLUB_SITE } from "@/lib/site";
import { SettingsPanel } from "./SettingsPanel";

export const metadata: Metadata = { title: "Privacy" };

const SECTIONS: { icon: IconName; title: string; items: React.ReactNode[] }[] = [
  {
    icon: "check",
    title: "What we store",
    items: [
      "Your nickname and chosen character",
      "Your scores, rounds and achievements",
      "An anonymous player ID created by your browser",
      "Timestamps of when rounds start and finish (to check scores fairly)",
      "A scrambled (hashed) copy of your recovery code, if you create one",
    ],
  },
  {
    icon: "x",
    title: "What we never ask for",
    items: ["Your real name, phone number, email address or student ID", "Any medical history or personal health information"],
  },
  {
    icon: "bulb",
    title: "Why",
    items: [
      "To run the game, keep scores fair, and show one global leaderboard.",
      "We count how many results screens are shown and how many people tap “Join our club” — anonymously, as simple totals.",
      "To stop abuse we briefly keep a rate-limit record of how many rounds start from each network address; it is never shown or linked to your nickname.",
    ],
  },
  {
    icon: "clock",
    title: "How long",
    items: [
      "Game data is kept for the Breast Cancer Awareness Month campaign so the leaderboard works. [Retention period — to be confirmed by the club before launch]",
      "You can delete your data yourself at any time with “Delete my data”.",
    ],
  },
  {
    icon: "user",
    title: "Your devices",
    items: [
      "Your browser remembers you on this device. Browser storage alone can’t recognise you on another device — use a recovery code from My Progress.",
      "Only your nickname and character are ever shown publicly.",
    ],
  },
];

/** Figma 15 Privacy & settings (10:3647). */
export default function PrivacyPage() {
  return (
    <>
      <section className="bg-blush">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-10 lg:px-16 lg:py-14">
          <h1 className="font-display text-[40px] leading-none lg:text-title">Privacy</h1>
          <p className="max-w-[1000px] text-body lg:text-body-lg">
            Myth Busters is run by {CLUB_NAME}. Here is exactly what we keep, in plain language.
          </p>
        </div>
      </section>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 lg:flex-row lg:items-start lg:px-16 lg:py-14">
        <div className="flex flex-1 flex-col gap-6">
          {SECTIONS.map((s) => (
            <section key={s.title} className="flex flex-col gap-2">
              <h2 className="flex items-center gap-2 text-h3 font-extrabold">
                <Icon name={s.icon} className="text-magenta" />
                {s.title}
              </h2>
              <ul className="flex flex-col gap-1.5 pl-1">
                {s.items.map((it, i) => (
                  <li key={i} className="flex gap-2 text-body">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-magenta" />
                    {it}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-body">
            Questions about your data? Contact the club through{" "}
            <a href={CLUB_SITE} target="_blank" rel="noopener" className="font-semibold text-magenta underline">
              our website
            </a>
            .
          </p>
        </div>
        <SettingsPanel />
      </div>
    </>
  );
}
