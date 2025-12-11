import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    APP_BASE_URL:
      process.env.VERCEL_ENV === "preview"
        ? `https://${process.env.VERCEL_BRANCH_URL}`
        : process.env.APP_BASE_URL,
  },
};

export default nextConfig;
