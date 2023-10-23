/** @type {import('next').NextConfig} */
module.exports = {
  output: process.env.STANDALONE && 'standalone',
  experimental: { instrumentationHook: true },
  images: {
    remotePatterns: [{ hostname: 'source.unsplash.com' }]
  }
}
