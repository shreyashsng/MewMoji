/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.openart.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ghnwnjjupgstmsvuddck.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
    domains: ['localhost', 'mewmoji.vercel.app'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    })
    return config
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors during build
  },
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
}

module.exports = nextConfig 