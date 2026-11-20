import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: false,
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
