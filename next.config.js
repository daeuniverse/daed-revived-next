/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { instrumentationHook: true },
  images: {
    remotePatterns: [{ hostname: 'source.unsplash.com' }]
  }
}

module.exports = nextConfig
