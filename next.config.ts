import type { NextConfig } from "next";
import { execSync } from "child_process";

let lastCommit = '';
try {
  lastCommit = execSync('git log -1 --format=%ai').toString().trim();
} catch {}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LAST_COMMIT: lastCommit,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
