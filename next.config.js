/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { instrumentationHook: true },
  images: {
    remotePatterns: [{ hostname: 'source.unsplash.com' }]
  }
}

module.exports = nextConfig
