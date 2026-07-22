import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Keep these out of the webpack/esbuild bundle — they ship native/JSON
  // assets (e.g. playwright-core's browsers.json) that bundling mangles,
  // which crashed PDF export on Vercel with "Cannot find module
  // .../playwright-core/browsers.json". Marking them external makes Next.js
  // require() them at runtime straight from node_modules and trace their
  // files for inclusion in the serverless output instead.
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // Security headers (supplemented by vercel.json)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },

  // Reduce bundle size
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Logging
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === "development" },
  },
};

export default withNextIntl(nextConfig);
