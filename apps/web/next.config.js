/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@myapp/shared'],
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        canvas: false,
      }
    }
    return config
  },
  // 모든 네트워크 인터페이스에서 접근 가능하도록 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          // 🔧 웹뷰 관련 헤더 추가
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // 🔧 보안 헤더 수정 - 웹뷰에서 스크립트 실행 허용
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://t1.daumcdn.net http://t1.daumcdn.net https://cdnjs.cloudflare.com http://cdnjs.cloudflare.com; worker-src 'self' blob:; object-src 'none'; connect-src 'self' * https://dapi.kakao.com https://t1.daumcdn.net http://t1.daumcdn.net;",
          },
          // 🔧 웹뷰에서 쿠키 사용 허용
          {
            key: 'Set-Cookie',
            value: 'SameSite=None; Secure',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig