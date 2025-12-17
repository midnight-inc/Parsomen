/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  webpack: (config) => {
    config.externals.push('canvas');
    return config;
  },
}

module.exports = nextConfig
