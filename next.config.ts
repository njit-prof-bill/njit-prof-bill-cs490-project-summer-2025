import withPWA from "next-pwa";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/resume/:path*",
        destination: "http://localhost:5000/resume/:path*",
      },
    ];
  },

};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
