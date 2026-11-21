import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: false,
  // Client router cache: always refetch dynamic pages; ISR pages at most 30 s old when switching sections.
  experimental: { staleTimes: { dynamic: 0, static: 30 } },
  // naatrisai.vercel.app → naatrisai.in (308). Exact-host match, so per-deployment preview URLs keep working;
  // /api/* (crons, hooks) is left alone so nothing that calls the old host breaks.
  async redirects() {
    return [{ source: "/:path((?!api/).*)", has: [{ type: "host", value: "naatrisai.vercel.app" }], destination: "https://naatrisai.in/:path", permanent: true }];
  },
  serverExternalPackages: ["harfbuzzjs", "@resvg/resvg-js"],
  outputFileTracingIncludes: { "/og": ["./assets/**/*", "./node_modules/harfbuzzjs/dist/*.wasm"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
