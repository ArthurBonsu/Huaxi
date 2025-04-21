/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Build optimization
  swcMinify: true,
  optimizeFonts: true,
  productionBrowserSourceMaps: false,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Optimize source mapping
    config.devtool = isServer ? false : 'cheap-source-map';

    // Fallback configurations for browser compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        zlib: require.resolve('browserify-zlib'),
      };
    }

    // Code splitting and optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    };

    // Reduce build noise
    config.stats = 'minimal';

    // Bundle analyzer configuration
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

 

  // Performance monitoring
  onDemandEntries: {
    maxInactiveAge: 30 * 1000,
    pagesBufferLength: 2,
  },

  // Image optimization
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // Compiler options for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

   // Add environment variables
   env: {
    ETHEREUM_PROVIDER_URL: process.env.ETHEREUM_PROVIDER_URL,
    POLKADOT_PROVIDER_URL: process.env.POLKADOT_PROVIDER_URL,
    NEXT_PUBLIC_TATUM_API_KEY: process.env.NEXT_PUBLIC_TATUM_API_KEY,
    METADATA_PARSER_ADDRESS: process.env.METADATA_PARSER_ADDRESS,
    PACECHAIN_CHANNEL_ADDRESS: process.env.PACECHAIN_CHANNEL_ADDRESS,
    RELAY_CHAIN_ADDRESS: process.env.RELAY_CHAIN_ADDRESS
  },
};

module.exports = nextConfig;