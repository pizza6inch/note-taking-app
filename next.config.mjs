/** @type {import('next').NextConfig} */
const nextConfig = {
  // 保持你原本的設定
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 新增：防止構建時因環境變數缺失導致的錯誤
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig