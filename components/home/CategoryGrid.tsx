import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Character } from "@/components/characters/Character";
import { PairCardView } from "@/components/ui/PairCard";
import { Chip } from "@/components/ui/game";

/** "Choose a game" grid — shared by 01 Homepage (17:3021) and 03 Category selection (20:2852). */
export function CategoryGrid() {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px_300px] lg:grid-rows-[440px_440px]">
      {/* The Basics */}
      <article className="relative flex items-end overflow-hidden rounded-ui bg-blush p-5 lg:pb-0 lg:pl-10 lg:pr-6 lg:pt-10">
        <div className="flex flex-1 flex-col items-start gap-3.5 self-stretch lg:pb-10">
          <Chip tone="magenta">Good first game</Chip>
          <h3 className="max-w-[11ch] text-[26px] font-extrabold leading-[1.05] max-lg:min-h-[92px] lg:max-w-none lg:text-[34px]">Myth or Fact? Neurodiversity Basics</h3>
          <div className="flex flex-wrap gap-1.5">
            <Chip tone="rose">Easy</Chip>
            <Chip>10-question quiz</Chip>
          </div>
          <p className="flex-1 text-body lg:text-body-lg">
            Autism, ADHD and dyslexia: what’s true and what’s a stereotype?
          </p>
          <div className="hidden lg:block">
            <ButtonLink href="/play/basics" size="large">
              Play Basics
            </ButtonLink>
          </div>
          <ButtonLink href="/play/basics" className="w-full lg:hidden">
            Play Basics
          </ButtonLink>
        </div>
        <Character id="rosie" size={290} className="hidden lg:block" />
        <Character id="rosie" size={88} className="absolute right-3 top-3 lg:hidden" />
      </article>

      <SmallCard
        id="signs"
        title="Beyond What You See"
        character="bloom"
        difficulty="Easy–Medium"
        kind="10-question quiz"
        text="Invisible disabilities and everyday disability etiquette."
      />
      <SmallCard
        id="risk"
        title="Accommodation Files"
        character="monster"
        difficulty="Medium"
        kind="10-question quiz"
        text="What accommodations are, why they’re fair, and how support works."
      />

      {/* Bee Pairs */}
      <article className="relative flex items-end gap-6 overflow-hidden rounded-ui bg-magenta p-5 text-white lg:col-span-2 lg:pb-0 lg:pl-10 lg:pr-6 lg:pt-10">
        <div className="flex w-full flex-col items-start gap-3.5 self-stretch lg:w-[420px] lg:shrink-0 lg:pb-10">
          <h3 className="max-w-[8ch] text-[26px] font-extrabold leading-[1.05] max-lg:min-h-[92px] lg:max-w-none lg:text-[40px]">Bee Pairs</h3>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-tag bg-blush px-2.5 py-1 text-label-sm font-semibold text-ink">Easy or Challenge</span>
            <span className="rounded-tag bg-white px-2.5 py-1 text-label-sm font-semibold text-ink">Memory game, untimed in Easy</span>
          </div>
          <p className="flex-1 text-body lg:text-body-lg">
            Match a myth to the truth, or a value to a kind action. A calm game for every age.
          </p>
          <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto">
            <ButtonLink href="/pink-pairs/easy" variant="secondary">
              Play Easy
            </ButtonLink>
            <ButtonLink href="/pink-pairs/challenge" variant="onPlum">
              Play Challenge
            </ButtonLink>
          </div>
        </div>
        <div className="relative hidden h-full min-w-0 flex-1 lg:block" aria-hidden>
          <PairCardView state="face" kind="Theme" text="BE KIND" className="absolute left-0 top-[86px] h-[227px] w-[192px] -rotate-6" />
          <PairCardView state="matched" text="Accommodations are an unfair advantage." className="absolute left-[169px] top-[52px] h-[214px] w-[175px] rotate-3" />
          <PairCardView state="matched" text="They remove barriers so everyone is tested on the same skills." className="absolute left-[352px] top-[55px] h-[222px] w-[185px] rotate-6" />
          <Character id="pinky" size={140} className="absolute left-[250px] top-[260px]" />
        </div>
        <Character id="pinky" size={88} className="absolute right-3 top-3 lg:hidden" />
      </article>

      {/* Ultimate */}
      <article className="relative flex flex-col items-start gap-3 rounded-ui bg-plum p-5 text-white lg:p-7">
        <Character id="captain" size={93} className="max-lg:absolute max-lg:right-3 max-lg:top-3 max-lg:size-[88px]!" />
        <h3 className="max-w-[11ch] text-[26px] font-extrabold leading-[1.05] max-lg:min-h-[92px] lg:max-w-none lg:text-h3">The Ultimate Myth Buster</h3>
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="rose">Challenging</Chip>
          <span className="rounded-tag bg-lavender px-2.5 py-1 text-label-sm font-semibold text-ink">15-question mixed quiz</span>
        </div>
        <p className="flex-1 text-body text-blush">15 mixed questions from every category.</p>
        <ButtonLink href="/play/ultimate" className="w-full">
          Play
        </ButtonLink>
      </article>
    </div>
  );
}

function SmallCard({
  id,
  title,
  character,
  difficulty,
  kind,
  text,
}: {
  id: string;
  title: string;
  character: "bloom" | "monster";
  difficulty: string;
  kind: string;
  text: string;
}) {
  return (
    <article className="relative flex flex-col items-start gap-3 rounded-ui bg-lavender p-5 lg:p-7">
      <Character id={character} size={124} className="max-lg:absolute max-lg:right-3 max-lg:top-3 max-lg:size-[88px]!" />
      <h3 className="max-w-[10ch] text-[26px] font-extrabold leading-[1.05] max-lg:min-h-[92px] lg:max-w-none lg:text-h3">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        <Chip tone="rose">{difficulty}</Chip>
        <Chip>{kind}</Chip>
      </div>
      <p className="flex-1 text-body">{text}</p>
      <Link
        href={`/play/${id}`}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-ui border-2 border-magenta bg-white px-6 py-3 text-label font-semibold text-magenta hover:bg-blush"
      >
        Play <span className="sr-only">{title}</span>
      </Link>
    </article>
  );
}

