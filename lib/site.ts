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
  "This game provides general educational information and is not a substitute for professional medical advice, diagnosis, or treatment. If you notice a new or concerning change, contact a qualified healthcare professional.";
export const DISCLAIMER_SHORT =
  "This game provides general educational information and is not a substitute for professional medical advice, diagnosis, or treatment.";
export const CLINIC_LINE = "Have questions? Visit the University Clinic.";

export const THEMES = [
  { key: "LEARN", text: "Know what is normal for you." },
  {
    key: "CHECK",
    text: "A change doesn’t always mean cancer, but noticed changes are worth checking with a healthcare professional.",
  },
  { key: "SUPPORT", text: "You are not alone. A kind conversation can encourage someone to seek help." },
  { key: "TAKE CARE", text: "Your health matters. Make time for regular check-ups and healthy habits." },
] as const;
