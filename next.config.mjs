/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Required for Electron
  images: {
    unoptimized: true,
  },
}

export default nextConfig 