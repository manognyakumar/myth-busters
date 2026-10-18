import "server-only";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

export const NICKNAME_RE = /^[A-Za-z0-9 ]{3,16}$/;

/** Returns an error code, or null when the nickname is acceptable. */
export function checkNickname(raw: string): string | null {
  const nick = raw.trim().replace(/\s+/g, " ");
  if (!NICKNAME_RE.test(nick)) return "nickname_format";
  if (matcher.hasMatch(nick) || matcher.hasMatch(nick.replace(/\s/g, ""))) return "nickname_unkind";
  return null;
}
