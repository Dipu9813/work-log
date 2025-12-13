/** @type {import('next').NextConfig} */
const nextConfig = {
    "devIndicators": false,
  // Enable PWA features
  experimental: {
    // App directory is now stable in Next.js 13+
  },
  // Turbopack config (empty to silence migration warning)
  turbopack: {},
  // Disable x-powered-by header
  poweredByHeader: false,
  // Enable service worker
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Headers for PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;