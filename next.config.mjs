/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Disable Next.js 15 devtools overlay (causes segment-explorer RSC manifest bug in dev)
  devIndicators: false,
};

export default nextConfig;
