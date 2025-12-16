const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable in development
});

const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    buildActivity: false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      {
        protocol: 'https',
        hostname: 'i.gr-assets.com', // Goodreads
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Allow unoptimized images for local uploads
    unoptimized: false,
  },
  webpack: (config, { isServer }) => {
    // Fix for pdfjs-dist canvas requirement
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      };
    }

    // Ignore canvas on server side
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }

    return config;
  },
};

module.exports = withPWA(nextConfig);
