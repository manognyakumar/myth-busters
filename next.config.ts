import type { NextConfig } from "next";
import { existsSync } from "node:fs";

const nextConfig: NextConfig = {
  // Set NEXT_PUBLIC_BASE_PATH=/mythbusters to serve the game under a subpath of the club site.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  poweredByHeader: false,
  env: {
    // Checked at build time so serverless functions don't need public/ on disk.
    NEXT_PUBLIC_HAS_RIT_LOGO: existsSync("public/brand/rit-dubai-logo.svg") ? "1" : "",
    // Netlify sets URL at build time; used when NEXT_PUBLIC_SITE_URL isn't configured.
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
