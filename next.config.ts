import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: false,
  // Client router cache: always refetch dynamic pages; ISR pages at most 30 s old when switching sections.
  experimental: { staleTimes: { dynamic: 0, static: 30 } },
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
