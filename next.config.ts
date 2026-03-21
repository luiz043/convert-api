import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://64.181.170.90:8080/api/:path*",
      },
    ]
  },
}

export default nextConfig
