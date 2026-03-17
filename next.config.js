/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'zimg.paragon.ice.com',
      },
      {
        protocol: 'https',
        hostname: 'njmls.mlsmatrix.com',
      },
    ],
  },
};

module.exports = nextConfig;
