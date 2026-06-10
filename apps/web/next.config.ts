import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  allowedDevOrigins: ['34.131.111.242'],
}

export default nextConfig
