/** @type {import('next').NextConfig} */
// Trigger deploy fix
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/messages/:id',
        destination: '/messages?startWith=:id',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      {
        protocol: 'https',
        hostname: 'img.kitapyurdu.com',
      },
    ],
  },
  webpack: (config) => {
    config.externals.push('canvas');
    return config;
  },
}

module.exports = nextConfig
