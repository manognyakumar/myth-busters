import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Character } from "@/components/characters/Character";
import { Icon, type IconName } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Pink Pairs" };

const STEPS: [IconName, string][] = [
  ["grid", "Flip two cards"],
  ["check", "Find a matching pair"],
  ["bulb", "Learn why they match"],
  ["speaker", "Listen: read any pair aloud"],
];

/** Figma 07 Pink Pairs — choose a mode (8:1101). */
export default function PinkPairsPage() {
  return (
    <>
      <section className="bg-blush">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-4 py-10 lg:flex-row lg:gap-10 lg:px-16 lg:py-12">
          <div className="flex flex-col items-center gap-3">
            <p className="rounded-ui bg-white px-4 py-3 text-label font-semibold">Every fact you learn makes a difference!</p>
            <Character id="pinky" size={160} motion="wave" className="lg:hidden" />
            <Character id="pinky" size={220} motion="wave" className="hidden lg:block" />
          </div>
          <div className="flex flex-1 flex-col gap-3.5">
            <h1 className="font-display text-[40px] leading-none lg:text-title">Pink Pairs</h1>
            <p className="text-body lg:text-body-lg">
              A calm memory game for everyone. Flip two cards at a time to match a myth with its correction, or an awareness theme with an
              action. Every match explains why.
            </p>
            <ul className="flex flex-wrap gap-3">
              {STEPS.map(([icon, text]) => (
                <li key={text} className="flex items-center gap-2 rounded-ui bg-white px-3 py-2.5 text-label font-semibold">
                  <Icon name={icon} size={20} className="text-magenta" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-label="Choose a mode" className="mx-auto grid max-w-[1440px] gap-6 px-4 py-10 lg:grid-cols-2 lg:px-16 lg:py-14">
        <ModeCard
          title="Easy Mode"
          chip="Relaxed"
          chipCls="bg-lavender text-ink"
          rows={2}
          size="h-[74px] w-[60px]"
          points={["8 cards, 4 pairs", "No countdown timer — take your time", "Large cards, great for tablets and all ages"]}
          href="/pink-pairs/easy"
          cta="Play Easy"
          featured
        />
        <ModeCard
          title="Challenge Mode"
          chip="× 1.5 points"
          chipCls="bg-rose text-plum"
          rows={4}
          size="h-[54px] w-[44px]"
          points={["16 cards, 8 pairs", "Elapsed time and incorrect flips are tracked", "Pairs rotate each replay"]}
          href="/pink-pairs/challenge"
          cta="Play Challenge"
        />
      </section>
      <p className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 pb-14 text-body lg:px-16">
        <Icon name="users" size={20} />
        Keyboard: arrow keys to move between cards, Enter to flip. Reduced-motion settings are respected.
      </p>
    </>
  );
}

function ModeCard({
  title,
  chip,
  chipCls,
  rows,
  size,
  points,
  href,
  cta,
  featured = false,
}: {
  title: string;
  chip: string;
  chipCls: string;
  rows: number;
  size: string;
  points: string[];
  href: string;
  cta: string;
  featured?: boolean;
}) {
  return (
    <article className={`flex flex-col gap-5 rounded-ui bg-white p-6 lg:p-8 ${featured ? "border-2 border-magenta" : "border border-warm-gray"}`}>
      <div className="flex items-center gap-3">
        <h2 className="flex-1 text-h3 font-extrabold lg:text-h2">{title}</h2>
        <span className={`rounded-tag px-2 py-1 text-label-sm font-semibold ${chipCls}`}>{chip}</span>
      </div>
      <div aria-hidden className="flex flex-col items-center gap-2 rounded-ui bg-blush p-5">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-2">
            {Array.from({ length: 4 }, (_, c) => (
              <span key={c} className={`rounded-ui bg-magenta ${size}`} />
            ))}
          </div>
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2.5 text-body">
            <Icon name="check" size={20} className="text-magenta" />
            {p}
          </li>
        ))}
      </ul>
      <ButtonLink href={href} size="large" className="mt-auto w-full">
        {cta}
      </ButtonLink>
    </article>
  );
}
