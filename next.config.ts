import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(www\\.)?gospelation\\.ch',
          },
        ],
        destination: 'https://gospelproject.ch/gospelation',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(www\\.)?gospelverein\\.ch',
          },
        ],
        destination: 'https://gospelproject.ch/gospelverein',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(www\\.)?zusammenklang\\.ch',
          },
        ],
        destination: 'https://gospelproject.ch/zusammenklang',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
};

export default nextConfig;
