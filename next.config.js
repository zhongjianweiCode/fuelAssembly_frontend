/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mui/x-data-grid'],
  images: {
    domains: ['avatars.githubusercontent.com'],
  }
}

module.exports = nextConfig 