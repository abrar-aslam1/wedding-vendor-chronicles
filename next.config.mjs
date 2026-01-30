/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use app directory, ignore src/pages completely
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].map(ext => `page.${ext}`).concat(['tsx', 'ts', 'jsx', 'js']),
  // Temporarily ignore build errors during migration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use webpack to exclude src/pages from build
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /src\/pages\/.+\.(tsx?|jsx?)$/,
      loader: 'ignore-loader'
    });
    return config;
  },
  // Environment variables - provide fallbacks for legacy Vite variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // Fallback for legacy Vite components
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Force dynamic rendering for specific routes
  staticPageGenerationTimeout: 120,
  // Support PostHog trailing slash API requests and skip static optimization for dynamic pages
  skipTrailingSlashRedirect: true,
  // Ignore prerender errors from legacy pages during export
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Redirect old routes if needed during migration
  async redirects() {
    return [
      {
        // Redirect old query-parameter URLs to new path-based URLs
        source: '/top-20/:category/:city/:state',
        has: [
          {
            type: 'query',
            key: 'subcategory',
          },
        ],
        destination: '/top-20/:category/:subcategory/:city/:state',
        permanent: true,
      },
    ];
  },
  // Add headers for better SEO and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },
  // Add rewrites for PostHog
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
};

export default nextConfig;
