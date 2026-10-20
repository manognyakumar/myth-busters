import type { CharacterId } from "./characters";

export type CategoryId = "basics" | "signs" | "risk" | "pairs" | "ultimate";
export type QuizCategoryId = Exclude<CategoryId, "pairs">;

export type CategoryInfo = {
  id: CategoryId;
  title: string;
  short: string;
  character: CharacterId;
  difficulty: string;
  kind: string;
  description: string;
  questions?: number;
  href: string;
};

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "basics",
    title: "Myth or Fact? Neurodiversity Basics",
    short: "Neurodiversity Basics",
    character: "rosie",
    difficulty: "Easy",
    kind: "10-question quiz",
    description: "Autism, ADHD and dyslexia: what’s true and what’s a stereotype.",
    questions: 10,
    href: "/play/basics",
  },
  {
    id: "signs",
    title: "Beyond What You See",
    short: "Beyond What You See",
    character: "bloom",
    difficulty: "Easy–Medium",
    kind: "10-question quiz",
    description: "Invisible disabilities and everyday disability etiquette.",
    questions: 10,
    href: "/play/signs",
  },
  {
    id: "risk",
    title: "Accommodation Files",
    short: "Accommodation Files",
    character: "monster",
    difficulty: "Medium",
    kind: "10-question quiz",
    description: "What accommodations are, why they’re fair, and how support works.",
    questions: 10,
    href: "/play/risk",
  },
  {
    id: "pairs",
    title: "Bee Pairs",
    short: "Bee Pairs",
    character: "pinky",
    difficulty: "Easy or Challenge",
    kind: "Memory game, untimed in Easy",
    description: "Match a myth to the truth, or a value to a kind action. A calm game for every age.",
    href: "/pink-pairs",
  },
  {
    id: "ultimate",
    title: "The Ultimate Myth Buster",
    short: "Ultimate Myth Buster",
    character: "captain",
    difficulty: "Challenging",
    kind: "15-question mixed quiz",
    description: "15 mixed questions from every category.",
    questions: 15,
    href: "/play/ultimate",
  },
];

export const QUIZ_CATEGORY_IDS: QuizCategoryId[] = ["basics", "signs", "risk", "ultimate"];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}
