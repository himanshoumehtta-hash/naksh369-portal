/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib'],
  },
  webpack: (config, { dev }) => {
    if (!dev) { config.cache = false; }
    return config;
  },
};
module.exports = nextConfig;
