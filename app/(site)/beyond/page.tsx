import type { Metadata } from "next";
import { Character } from "@/components/characters/Character";
import { ClubCta } from "@/components/ui/ClubCta";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { THEMES } from "@/lib/site";

export const metadata: Metadata = { title: "Beyond the game" };

type Link = { label: string; href: string };
const WHO: Link = { label: "World Health Organization", href: "https://www.who.int/news-room/fact-sheets/detail/breast-cancer" };
const WHO_GBCI: Link = { label: "WHO Global Breast Cancer Initiative", href: "https://www.who.int/initiatives/global-breast-cancer-initiative" };
const NCI: Link = { label: "National Cancer Institute", href: "https://www.cancer.gov/types/breast" };
const NCI_RISK: Link = { label: "NCI: Breast cancer prevention", href: "https://www.cancer.gov/types/breast/patient/breast-prevention-pdq" };
const NCI_SCREEN: Link = { label: "NCI: Mammograms", href: "https://www.cancer.gov/types/breast/mammograms-fact-sheet" };
const NHS_SIGNS: Link = { label: "NHS: Symptoms", href: "https://www.nhs.uk/conditions/breast-cancer-in-women/symptoms-of-breast-cancer-in-women/" };
const DHA: Link = { label: "Dubai Health Authority", href: "https://www.dha.gov.ae/en" };

const CARDS: { icon: IconName; lead: string; body: string; links: Link[] }[] = [
  {
    icon: "book",
    lead: THEMES[0].text,
    body: "Breast cancer can affect anyone, including men. Learning the facts helps you recognise common myths and misleading claims. Factors such as age, family history and inherited gene changes can affect risk — but having no known risk factors does not mean no risk.",
    links: [WHO, NCI, NCI_RISK],
  },
  {
    icon: "search",
    lead: THEMES[1].text,
    body: "Possible changes include a new lump or swelling in the breast, chest or armpit, a change in breast shape or size, or skin or nipple changes. Screening depends on your age, risk factors and medical history — a professional can advise what is right for you.",
    links: [NHS_SIGNS, NCI_SCREEN, DHA],
  },
  {
    icon: "heart",
    lead: THEMES[2].text,
    body: "If someone you know is affected by breast cancer, listening without judgement and encouraging professional support can make a real difference.",
    links: [WHO_GBCI],
  },
  {
    icon: "check",
    lead: THEMES[3].text,
    body: "Regular check-ups give you a chance to ask questions. Your University Clinic is a good first step.",
    links: [DHA],
  },
];

/** Figma 14 Beyond the game (10:3254). No body images or self-exam steps by design. */
export default function BeyondPage() {
  return (
    <>
      <section className="bg-blush">
        <div className="mx-auto flex max-w-[1440px] items-center gap-10 px-4 py-10 lg:px-16 lg:py-14">
          <div className="flex flex-1 flex-col gap-3.5">
            <h1 className="font-display text-[40px] leading-none lg:text-title">Beyond the game</h1>
            <p className="text-body lg:text-body-lg">
              Trusted information to take with you, organised around this year’s four awareness themes. Nothing here replaces advice from a
              healthcare professional.
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
            <p className="text-h3 font-extrabold text-rose lg:text-h2">Have questions? Visit the University Clinic.</p>
            <p className="text-body text-blush">
              An awareness prompt, not a substitute for medical care. If you notice a new or concerning change, contact a qualified healthcare
              professional.
            </p>
          </div>
        </section>
        <MedicalDisclaimer />
        <ClubCta />
      </div>
    </>
  );
}
