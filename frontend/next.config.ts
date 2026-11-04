import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["geoip-lite"],
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
