import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    // Allow images from these domains
    remotePatterns: [
      // CDN and cloud storage
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
      { protocol: 'https', hostname: '**.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Video thumbnails
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
      // Hospital and doctor image sources
      { protocol: 'https', hostname: '**.practo.com' },
      { protocol: 'https', hostname: 'practo.com' },
      { protocol: 'https', hostname: '**.justdial.com' },
      { protocol: 'https', hostname: '**.apollohospitals.com' },
      { protocol: 'https', hostname: '**.maxhealthcare.in' },
      { protocol: 'https', hostname: '**.fortishealthcare.com' },
      { protocol: 'https', hostname: '**.medanta.org' },
      { protocol: 'https', hostname: '**.manipalhospitals.com' },
      { protocol: 'https', hostname: '**.narayanahealth.org' },
      { protocol: 'https', hostname: '**.aiims.edu' },
      // Generic patterns for any medical site
      { protocol: 'https', hostname: '**.hospital.com' },
      { protocol: 'https', hostname: '**.healthcare.com' },
      // Wikipedia and other reference sites
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      // Placeholder services
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
      // Vercel blob storage
      { protocol: 'https', hostname: '**.vercel-storage.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      // Cloudflare
      { protocol: 'https', hostname: '**.cloudflare.com' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      // Medical image APIs
      { protocol: 'https', hostname: 'pollinations.ai' },
      { protocol: 'https', hostname: 'image.pollinations.ai' },
      // Google Places (New) photo media URLs — populated by admin/populate-real-data
      { protocol: 'https', hostname: 'places.googleapis.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
    ],
    // Image formats to generate
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL for optimized images (in seconds)
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    // Disable static image imports if not needed
    disableStaticImages: false,
  },

  // Enable strict mode for better debugging
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Per-symbol tree-shaking for libs with large barrel exports.
    // Cuts client JS where only a handful of icons/charts/components are used.
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'recharts',
      'react-markdown',
      'remark-gfm',
      'date-fns',
    ],
  },

  // Headers for security and caching.
  //
  // Mirrored from deploy/nginx.conf so we're protected even when running
  // outside that nginx (local prod test, future host swap, vercel preview).
  // CSP is intentionally permissive for inline scripts because Next emits
  // inline JSON islands and we ship gtag.js + GTM. Tighten with nonces if
  // we ever drop GTM.
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://maps.googleapis.com https://js.stripe.com https://challenges.cloudflare.com https://app.wacrs.com https://*.wacrs.com",
      // next/font self-hosts Geist + Geist Mono — no Google Fonts CDN at runtime.
      "style-src 'self' 'unsafe-inline' https://*.wacrs.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://*.wacrs.com",
      "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://places.googleapis.com https://maps.googleapis.com https://api.stripe.com https://api.openrouter.ai https://api.anthropic.com https://*.wacrs.com wss://*.wacrs.com",
      "frame-src 'self' https://www.google.com https://www.youtube.com https://player.vimeo.com https://js.stripe.com https://hooks.stripe.com https://*.wacrs.com",
      "media-src 'self' blob: https://*.wacrs.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
          },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      {
        // Cache static assets
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        // Edge cache for public, ISR-friendly content pages.
        // - max-age=0           → browser revalidates on each navigation
        // - s-maxage=3600       → Nginx/Cloudflare caches for 1h
        // - stale-while-revalidate=86400 → serve stale for up to 24h while regenerating
        // Negative match keeps admin/api/auth/personalized paths off this rule.
        source:
          '/:path((?!admin|api|provider|vault|auth|login|register|chat|analyze|book|search|_next).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Never edge-cache personalized or per-user surfaces
        source: '/:path(admin|api|provider|vault|auth|login|register|chat|analyze|book|search)(/.*)?',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.aihealz.com' }],
        destination: 'https://aihealz.com/:path*',
        permanent: true,
      },
    ];
  },

  // Turbopack configuration (Next.js 15+ default bundler)
  //
  // SECURITY / CORRECTNESS RISK:
  // The `fs`/`net`/`tls` aliases below silently replace those Node-only
  // modules with an empty stub when bundled for the browser. That hides
  // real bugs: any server-only module that accidentally gets pulled into
  // a Client Component will *appear* to compile and ship to the browser
  // as a no-op, instead of failing the build. It can also mask data
  // leaks (a server util that reads from disk becomes a silent noop on
  // the client rather than an obvious error).
  //
  // TODO: Remove these aliases once every server-only module declares
  // `import 'server-only'` at the top, so accidental client imports fail
  // loudly at build time.
  turbopack: {
    resolveAlias: {
      // Polyfill Node.js modules for client-side
      fs: { browser: './src/lib/empty-module.js' },
      net: { browser: './src/lib/empty-module.js' },
      tls: { browser: './src/lib/empty-module.js' },
    },
  },
};

export default nextConfig;
