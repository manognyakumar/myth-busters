import type { Metadata } from "next";
import { Character } from "@/components/characters/Character";
import { ClubCta } from "@/components/ui/ClubCta";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { THEMES } from "@/lib/site";

export const metadata: Metadata = { title: "Beyond the game" };

type Link = { label: string; href: string };
const CDC: Link = { label: "CDC: Autism", href: "https://www.cdc.gov/autism/" };
const NIMH: Link = { label: "NIMH: ADHD", href: "https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd" };
const NHS: Link = { label: "NHS: ADHD", href: "https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/" };
const IDA: Link = { label: "International Dyslexia Association", href: "https://dyslexiaida.org/dyslexia-basics/" };
const CRPD: Link = { label: "UN CRPD", href: "https://www.un.org/development/desa/disabilities/convention-on-the-rights-of-persons-with-disabilities.html" };
const WAI: Link = { label: "W3C WAI: Captions", href: "https://www.w3.org/WAI/media/av/captions/" };
const UAE: Link = { label: "UAE: People of Determination", href: "https://u.ae/en/information-and-services/social-affairs/people-of-determination" };

const CARDS: { icon: IconName; lead: string; body: string; links: Link[] }[] = [
  {
    icon: "heart",
    lead: THEMES[0].text,
    body: "Patience, a friendly word and a little flexibility go a long way. Treat people as people first, not as a diagnosis or a label.",
    links: [UAE, CRPD],
  },
  {
    icon: "book",
    lead: THEMES[1].text,
    body: "Autism, ADHD and dyslexia are differences in how the brain works, not a lack of intelligence or effort. Many disabilities, such as chronic pain or hearing loss, can’t be seen.",
    links: [CDC, NIMH, NHS, IDA],
  },
  {
    icon: "check",
    lead: THEMES[2].text,
    body: "Accommodations such as extra time, captions or a quiet room keep the standard the same and remove the barrier. Captioned videos and accessible slides help everyone.",
    links: [CRPD, WAI],
  },
  {
    icon: "search",
    lead: THEMES[3].text,
    body: "Not everyone wants help, and the right help depends on the person. Ask first, listen, and respect the answer. Need an accommodation yourself? The Student Affairs Office at RIT Dubai can help.",
    links: [UAE],
  },
];

/** Figma 14 Beyond the game (10:3254). */
export default function BeyondPage() {
  return (
    <>
      <section className="bg-blush">
        <div className="mx-auto flex max-w-[1440px] items-center gap-10 px-4 py-10 lg:px-16 lg:py-14">
          <div className="flex flex-1 flex-col gap-3.5">
            <h1 className="font-display text-[40px] leading-none lg:text-title">Beyond the game</h1>
            <p className="text-body lg:text-body-lg">
              Trusted information to take with you, organised around this year’s four awareness themes. Every person’s experience is
              different.
            </p>
          </div>
          <Character id="bloom" size={200} className="hidden sm:block" />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-10 lg:grid-cols-2 lg:px-16 lg:py-14">
        {CARDS.map((c, i) => (
          <article key={THEMES[i].key} className="flex flex-col gap-3.5 rounded-ui border border-warm-gray p-6 lg:p-8">
            <h2 className="flex items-center gap-3.5 text-h2 font-extrabold text-magenta">
              <span className="flex rounded-full bg-magenta p-3 text-white">
                <Icon name={c.icon} size={28} />
              </span>
              {THEMES[i].key}
            </h2>
            <p className="text-h3 font-extrabold">{c.lead}</p>
            <p className="text-body">{c.body}</p>
            <ul className="flex flex-wrap gap-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-tag border border-magenta px-3 py-2 text-label-sm font-semibold text-magenta hover:bg-blush"
                  >
                    {l.label}
                    <Icon name="external" size={16} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 pb-16 lg:px-16">
        <section className="flex items-center gap-5 rounded-ui bg-plum p-7 text-white">
          <Icon name="heart" size={32} className="hidden text-rose sm:inline-block" />
          <div className="flex flex-col gap-1.5">
            <p className="text-h3 font-extrabold text-rose lg:text-h2">Need support or an accommodation? Contact the Student Affairs Office at RIT Dubai.</p>
            <p className="text-body text-blush">
              Student Affairs can talk you through accommodations, support services and who to contact, in confidence.
            </p>
          </div>
        </section>
        <MedicalDisclaimer />
        <ClubCta />
      </div>
    </>
  );
}
