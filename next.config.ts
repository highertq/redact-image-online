import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The site exports to static files and promises that nothing is processed on a
  // server, so next/image must not be pointed at an optimisation endpoint — that
  // would route a visitor's request through a third party for one 67 KB figure.
  // The images shipped in /public are already sized and compressed by hand.
  images: { unoptimized: true },
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
