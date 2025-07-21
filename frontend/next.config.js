/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'images.unsplash.com', 'plus.unsplash.com', 'placehold.co'],
  },
};

module.exports = nextConfig;