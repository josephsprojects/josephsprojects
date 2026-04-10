import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: true,
  experimental: { serverActions: { allowedOrigins: ['localhost:3000', 'dataprimetech.com'] } },
}

export default nextConfig
