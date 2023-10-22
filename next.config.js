/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  experimental: { instrumentationHook: true },
  images: {
    remotePatterns: [{ hostname: 'source.unsplash.com' }]
  }
}
