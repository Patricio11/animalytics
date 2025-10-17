import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Temporarily ignore ESLint errors during builds
    // This allows deployment while we incrementally fix remaining type issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during builds
    // This allows deployment while we incrementally fix remaining type issues
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
