export type CharacterId = "pinky" | "rosie" | "bloom" | "monster" | "captain";

export type CharacterInfo = {
  id: CharacterId;
  name: string;
  role: string;
  personality: string;
  catchphrase: string;
  file: string;
  /** Avatar ring + fill, from Figma Avatar/* components (3:90). */
  ring: string;
  fill: string;
};

export const CHARACTERS: Record<CharacterId, CharacterInfo> = {
  pinky: {
    id: "pinky",
    name: "Pinky",
    role: "Awareness Ambassador",
    personality: "Warm, welcoming, encouraging",
    catchphrase: "Every fact you learn makes a difference!",
    file: "pinky",
    ring: "border-rose",
    fill: "bg-blush",
  },
  rosie: {
    id: "rosie",
    name: "Detective Rosie",
    role: "Myth Hunter",
    personality: "Curious, clever, observant",
    catchphrase: "Let’s investigate this claim!",
    file: "detective-rosie",
    ring: "border-magenta",
    fill: "bg-blush",
  },
  bloom: {
    id: "bloom",
    name: "Professor Bloom",
    role: "Fact Expert",
    personality: "Calm, knowledgeable, reassuring",
    catchphrase: "Here’s what the evidence tells us.",
    file: "professor-bloom",
    ring: "border-plum",
    fill: "bg-lavender",
  },
  monster: {
    id: "monster",
    name: "Myth Monster",
    role: "Misinformation Mascot",
    personality: "Mischievous but harmless",
    catchphrase: "Sounds convincing... but is it true?",
    file: "myth-monster",
    ring: "border-lavender-mid",
    fill: "bg-lavender",
  },
  captain: {
    id: "captain",
    name: "Captain Courage",
    role: "Achievement Hero",
    personality: "Energetic, positive, motivational",
    catchphrase: "Knowledge is a powerful first step!",
    file: "captain-courage",
    ring: "border-magenta-deep",
    fill: "bg-blush",
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[];
