import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // NOTE: scrollRestoration conflicts with manual scroll restoration in events page
    // (sessionStorage-based cache restoration). Disabled to use manual implementation.
    // scrollRestoration: true,
  },

  // Optimize for development performance
  // Disable source maps in development to reduce memory usage
  productionBrowserSourceMaps: false,

  // Turbopack is enabled by default in Next.js 16
  // It's already optimized for performance and memory usage
};

export default nextConfig;
