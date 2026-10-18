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
    title: "Myth or Fact? — The Basics",
    short: "The Basics",
    character: "rosie",
    difficulty: "Easy",
    kind: "10-question quiz",
    description: "Detective Rosie shows you a statement. You decide: myth or fact? Then see what the evidence says.",
    questions: 10,
    href: "/play/basics",
  },
  {
    id: "signs",
    title: "Know the Signs",
    short: "Know the Signs",
    character: "bloom",
    difficulty: "Easy–Medium",
    kind: "10-question quiz",
    description: "Learn possible warning signs and why noticed changes are worth checking.",
    questions: 10,
    href: "/play/signs",
  },
  {
    id: "risk",
    title: "Risk Factor Files",
    short: "Risk Factor Files",
    character: "monster",
    difficulty: "Medium",
    kind: "10-question quiz",
    description: "Separate evidence-based risk factors from misleading claims.",
    questions: 10,
    href: "/play/risk",
  },
  {
    id: "pairs",
    title: "Pink Pairs",
    short: "Pink Pairs",
    character: "pinky",
    difficulty: "Easy or Challenge",
    kind: "Memory game, untimed in Easy",
    description: "Flip cards to match a myth with its correction, or a theme with an action. A calm game for every age.",
    href: "/pink-pairs",
  },
  {
    id: "ultimate",
    title: "The Ultimate Myth Buster",
    short: "Ultimate Myth Buster",
    character: "captain",
    difficulty: "Challenging",
    kind: "15-question mixed quiz",
    description: "The final challenge across every topic, from warning signs to screening.",
    questions: 15,
    href: "/play/ultimate",
  },
];

export const QUIZ_CATEGORY_IDS: QuizCategoryId[] = ["basics", "signs", "risk", "ultimate"];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}
