import type { NextConfig } from 'next';
const pages = process.env.GITHUB_PAGES === 'true';
const basePath = pages ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'mosso_preview'}` : '';
const config: NextConfig = {
  output: pages ? 'export' : 'standalone',
  basePath,
  trailingSlash: pages,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
  async headers() {
    if (pages) return [];
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};
export default config;
