import "server-only";
import { createHmac, randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function newRecoveryCode() {
  const chars = Array.from({ length: 12 }, () => ALPHABET[randomInt(ALPHABET.length)]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8).join("")}`;
}

export function hashRecoveryCode(code: string) {
  const pepper = process.env.RECOVERY_PEPPER;
  if (!pepper) throw new Error("RECOVERY_PEPPER is not set");
  const normalised = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return createHmac("sha256", pepper).update(normalised).digest("hex");
}
