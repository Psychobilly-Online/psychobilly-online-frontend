import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // NOTE: scrollRestoration conflicts with manual scroll restoration in events page
    // (sessionStorage-based cache restoration). Disabled to use manual implementation.
    // scrollRestoration: true,
  },
};

export default nextConfig;
