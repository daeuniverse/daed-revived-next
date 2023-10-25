/** @type {import('next').NextConfig} */
module.exports = {
  output: process.env.STANDALONE && 'standalone',
  experimental: { instrumentationHook: true },
  images: { remotePatterns: [{ hostname: 'source.unsplash.com' }] },
  rewrites: () => [{ source: '/api/wing/:path*', destination: `${process.env.WING_API_URL}/:path*` }],
  reactStrictMode: false
}
