/** @type {import('next').NextConfig} */

// const nextConfig = {
// };
// UPDATE THE BELOW AFTER DEV TESTING
const nextConfig = {
  allowedDevOrigins: ['0baf-2401-4900-1c5c-696c-d1dc-5ee5-4d0c-cfeb.ngrok-free.app'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
