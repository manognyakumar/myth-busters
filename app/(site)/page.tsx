import { ButtonLink } from "@/components/ui/Button";
import { Character } from "@/components/characters/Character";
import { Icon } from "@/components/ui/Icon";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { CHARACTERS, CHARACTER_IDS } from "@/lib/characters";
import { CLUB_FORM, CLUB_NAME, THEMES } from "@/lib/site";

/** Figma 01 Homepage (17:2902) + M1 Homepage — mobile (20:4680). */
export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">Myth Busters: Breast Cancer Awareness Edition, by {CLUB_NAME}</h1>

      {/* Hero */}
      <section className="overflow-hidden bg-blush">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 pt-8 lg:flex-row lg:items-end lg:px-16 lg:pt-16">
          <div className="flex flex-col items-start gap-[22px] lg:w-[740px] lg:shrink-0 lg:pb-[72px]">
            <p aria-hidden className="font-display text-[clamp(44px,12vw,128px)] leading-[0.86] tracking-[-0.02em] text-ink">
              MYTH
              <br />
              BUSTERS
            </p>
            <p className="text-[28px] font-extrabold leading-[1.1] text-magenta lg:text-h2">Breast Cancer Awareness Edition</p>
            <p className="text-[20px] font-semibold leading-[1.3] lg:text-[24px]">Spot the Myth. Discover the Truth. Make a Difference.</p>
            <p className="max-w-[600px] text-body lg:text-body-lg">
              Think you know the facts about breast cancer? Investigate common myths, discover the truth, match important
              information, and learn how awareness can make a difference.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink href="/play" size="large">
                PLAY NOW
              </ButtonLink>
              <ButtonLink href="/pink-pairs" size="large" variant="secondary">
                PINK PAIRS
              </ButtonLink>
            </div>
            <div className="hidden flex-wrap gap-2 sm:flex">
              <MoreLinks />
            </div>
          </div>

          {/* Stage: a myth, busted */}
          <div className="relative h-[330px] min-w-0 flex-1 lg:h-[640px]" aria-hidden>
            <div className="absolute left-0 top-[50px] flex w-[300px] flex-col items-start gap-3 rounded-answer bg-white p-[22px] lg:left-[60px] lg:top-[150px] lg:w-[470px] lg:gap-[18px] lg:p-9">
              <div className="flex flex-col gap-1">
                {["Breast cancer only", "happens to women."].map((line) => (
                  <span key={line} className="relative inline-block">
                    <span className="text-[20px] font-black leading-[1.1] tracking-[-0.5px] text-ink opacity-85 lg:text-[30px]">
                      {line}
                    </span>
                    <span className="absolute -left-2 -right-2 top-[55%] h-1.5 rotate-[1.2deg] rounded-[3px] bg-magenta" />
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-tag bg-plum px-3 py-1.5 text-label font-semibold text-white">
                <Icon name="x" size={16} />
                MYTH
              </span>
              <p className="text-[24px] font-extrabold leading-[1.15] lg:text-[30px]">Men can develop breast cancer too.</p>
              <p className="hidden text-body lg:block">
                Breast cancer is much more common in women, but men can also develop it.
              </p>
            </div>
            <div className="absolute left-[96px] top-[72px] hidden rounded-ui bg-white px-4 py-3 text-label font-semibold lg:block">
              Let’s investigate this claim!
            </div>
            <div className="absolute right-0 top-0 lg:left-[372px] lg:right-auto lg:top-[10px]">
              <Character id="rosie" size={124} className="lg:hidden" />
              <Character id="rosie" size={210} motion="bob" className="hidden lg:block" />
            </div>
            <div className="absolute right-4 top-[210px] lg:-left-10 lg:right-auto lg:top-[450px]">
              <Character id="pinky" size={120} className="lg:hidden" />
              <Character id="pinky" size={190} motion="wave" className="hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Secondary actions on mobile (M1 "More") */}
      <section className="flex flex-col gap-2 px-4 py-6 sm:hidden" aria-label="More">
        <MoreLinks stacked />
      </section>

      {/* Choose a game */}
      <section aria-labelledby="choose-heading" className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 pb-24 pt-6 lg:px-16 lg:pt-[88px]">
        <h2 id="choose-heading" className="font-display text-[40px] leading-none text-ink lg:text-title">
          Choose a game
        </h2>
        <p className="max-w-[640px] text-body lg:text-body-lg">
          Every round you finish adds Myth Buster Points to one shared leaderboard. Play in any order.
        </p>
        <CategoryGrid />
      </section>

      {/* Meet your guides */}
      <section aria-labelledby="guides-heading" className="bg-lavender">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 pt-14 lg:px-16 lg:pt-[88px]">
          <h2 id="guides-heading" className="font-display text-[40px] leading-none lg:text-title">
            Meet your guides
          </h2>
          <ul className="grid grid-cols-2 items-end gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {CHARACTER_IDS.map((id) => (
              <li key={id} className="flex flex-col items-center gap-3.5">
                <p className="w-full rounded-ui bg-white px-3.5 py-3 text-center text-label font-semibold">{CHARACTERS[id].catchphrase}</p>
                <Character id={id} size={150} className="lg:hidden" />
                <Character id={id} size={190} motion="bob" className="hidden lg:block" />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-label="Guide names" className="bg-plum">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-2 gap-6 px-4 pb-8 pt-6 sm:grid-cols-3 lg:grid-cols-5 lg:px-16">
          {CHARACTER_IDS.map((id) => (
            <li key={id} className="flex flex-col items-center gap-1 text-center">
              <span className="text-h3 font-extrabold text-white">{CHARACTERS[id].name}</span>
              <span className="text-caption text-lavender-mid">{CHARACTERS[id].role}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Awareness */}
      <section aria-labelledby="matter-heading" className="bg-magenta text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-4 py-10 lg:px-16 lg:py-24">
          <h2 id="matter-heading" className="font-display text-[44px] leading-[0.96] lg:text-[80px]">
            You matter.
            <br />
            Your health matters.
          </h2>
          <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
            {THEMES.map((t) => (
              <div key={t.key} className="flex flex-col gap-3 border-t-[3px] border-white pt-4 lg:pt-5">
                <h3 className="text-h3 font-extrabold lg:text-h2">{t.key}</h3>
                <p className="text-body lg:text-body-lg">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinic + disclaimer */}
      <section className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 lg:flex-row lg:items-center lg:gap-10 lg:px-16 lg:py-14">
        <p className="text-[28px] font-extrabold leading-[1.1] text-magenta lg:text-h2">
          Have questions?
          <br />
          Visit the University Clinic.
        </p>
        <MedicalDisclaimer className="lg:flex-1" />
      </section>
    </>
  );
}

function MoreLinks({ stacked = false }: { stacked?: boolean }) {
  const w = stacked ? "w-full" : "";
  return (
    <>
      <ButtonLink href="/leaderboard" variant="soft" className={w}>
        GLOBAL LEADERBOARD
      </ButtonLink>
      <ButtonLink href="/progress" variant="soft" className={w}>
        MY PROGRESS
      </ButtonLink>
      <ButtonLink href="/how-to-play" variant="soft" className={w}>
        HOW TO PLAY
      </ButtonLink>
      <ButtonLink href="/beyond" variant="soft" className={w}>
        BEYOND THE GAME
      </ButtonLink>
      <ButtonLink href={CLUB_FORM} external variant="secondary" className={w}>
        JOIN OUR CLUB
      </ButtonLink>
    </>
  );
}
