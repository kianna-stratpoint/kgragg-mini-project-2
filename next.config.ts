import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Useful to add this too
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com", // Unsplash sometimes uses this
      },
    ],
  },
};

export default nextConfig;
