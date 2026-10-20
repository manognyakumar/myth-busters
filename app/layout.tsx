import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { CLUB_NAME, SITE_URL } from "@/lib/site";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const description =
  "Be Kind. Be Understanding. Be the Difference. An SNA Support Awareness Day game by " + CLUB_NAME + ".";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Myth Busters: SNA Edition — ${CLUB_NAME}`,
    template: "%s · Myth Busters · GDGOC RIT Dubai",
  },
  description,
  openGraph: {
    title: "Myth Busters: SNA Edition",
    description,
    siteName: `Myth Busters — ${CLUB_NAME}`,
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#2f6b3a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-ui focus:bg-white focus:p-3">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
