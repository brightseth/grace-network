/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
      { source: '/v1/:path*', destination: `${backendUrl}/v1/:path*` },
      { source: '/health', destination: `${backendUrl}/health` },
      { source: '/models', destination: `${backendUrl}/models` },
      { source: '/stats', destination: `${backendUrl}/stats` },
    ];
  },
};

module.exports = nextConfig;
