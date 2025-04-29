// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // suppress all ESLint errors during `next build`
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/dashboard-data",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metrics`,
      },
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
