export const CLUB_NAME =
  "Google Developer Group on Campus - Rochester Institute of Technology of Dubai";
export const CLUB_SHORT = "GDGOC RIT Dubai";
export const CLUB_SITE = "https://gdgocritdubai.netlify.app/";
export const CLUB_FORM = "https://forms.gle/5tkfQ8CGDw3QFPLy5";
/** Optional subpath (e.g. "/mythbusters") when served under the club site. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (p: string) => `${BASE_PATH}${p}`;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const DISCLAIMER =
  "This game is for awareness only and isn’t a diagnosis or advice. Every person’s experience is different.";
export const DISCLAIMER_SHORT = DISCLAIMER;
export const CLINIC_LINE = "Need support or an accommodation? Contact the Student Affairs Office at RIT Dubai.";

export const THEMES = [
  { key: "BE KIND", text: "Small acts of kindness make a big difference." },
  { key: "BE UNDERSTANDING", text: "Many disabilities are invisible. Everyone learns differently, and that’s okay." },
  { key: "BE THE DIFFERENCE", text: "Accommodations remove barriers. Speak up for an inclusive campus." },
  { key: "ASK FIRST", text: "Offer help, then listen. The person knows best what they need." },
] as const;
