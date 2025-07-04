/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
           {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
           {
             key: 'Content-Security-Policy',
             // This policy allows:
             // - self for all content
             // - inline styles and scripts (needed for some libraries)
             // - fonts from Google
             // - images from self, data URIs, and placehold.co
             value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://placehold.co; frame-src 'self';",
           }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
