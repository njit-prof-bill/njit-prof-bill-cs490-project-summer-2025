import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add any other Next.js config options here
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);