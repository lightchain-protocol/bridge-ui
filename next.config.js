/** @type {import('next').NextConfig} */

const path = require('path');
const { version } = require('./package.json');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const isDev = process.env.NODE_ENV !== 'production';

// Sometimes useful to disable this during development
const ENABLE_CSP_HEADER = true;
const FRAME_SRC_HOSTS = [
  'https://*.walletconnect.com',
  'https://*.walletconnect.org',
  'https://*.reown.com',
  'https://secure.walletconnect.org',
  'https://cdn.solflare.com',
  'https://js.refiner.io',
  'https://intercom-sheets.com',
  'https://intercom-reporting.com',
];
const STYLE_SRC_HOSTS = [
  'https://js.refiner.io',
  'https://storage.refiner.io',
  'https://fonts.googleapis.com',
  'https://fonts.reown.com',
];
const FONT_SRC_HOSTS = [
  'https://js.intercomcdn.com',
  'https://fonts.intercomcdn.com',
  'https://res.cloudinary.com',
  'https://fonts.gstatic.com',
  'https://fonts.reown.com',
  'https://fonts.googleapis.com',
];
const IMG_SRC_HOSTS = [
  'https://*.walletconnect.com',
  'https://*.reown.com',
  'https://*.githubusercontent.com',
  'https://cdn.jsdelivr.net/gh/hyperlane-xyz/hyperlane-registry@main/',
  'https://js.refiner.io',
  'https://storage.refiner.io',
  'https://js.intercomcdn.com',
  'https://static.intercomassets.com',
  'https://downloads.intercomcdn.com',
  'https://uploads.intercomusercontent.com',
  'https://gifs.intercomcdn.com',
];
const SCRIPT_SRC_HOSTS = [
  'https://snaps.consensys.io',
  'https://js.refiner.io',
  'https://app.intercom.io',
  'https://widget.intercom.io',
  'https://js.intercomcdn.com',
];
const MEDIA_SRC_HOSTS = [
  'https://js.refiner.io',
  'https://storage.refiner.io',
  'https://js.intercomcdn.com',
  'https://downloads.intercomcdn.com',
];
const cspHeader = `
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${SCRIPT_SRC_HOSTS.join(' ')};
  style-src 'self' 'unsafe-inline' ${STYLE_SRC_HOSTS.join(' ')};
  connect-src *;
  img-src 'self' blob: data: ${IMG_SRC_HOSTS.join(' ')};
  font-src 'self' data: ${FONT_SRC_HOSTS.join(' ')};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-src 'self' ${FRAME_SRC_HOSTS.join(' ')};
  frame-ancestors 'none';
  media-src 'self' ${MEDIA_SRC_HOSTS.join(' ')};
  ${!isDev ? 'block-all-mixed-content;' : ''}
  ${!isDev ? 'upgrade-insecure-requests;' : ''}
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
  // Wallet flows need none of these. WebHID/USB (Ledger) and passkeys stay allowed.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Required for AppKit wallet popups (WalletConnect, OAuth)
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups',
  },
  // Note, causes a problem for firefox: https://github.com/MetaMask/metamask-extension/issues/3133
  ...(ENABLE_CSP_HEADER
    ? [
        {
          key: 'Content-Security-Policy',
          value: cspHeader,
        },
      ]
    : []),
];

const nextConfig = {
  webpack(config, { isServer, webpack }) {
    // require.resolve of the entry (dist/index.js); the package's exports map hides package.json.
    const widgetsDist = path.dirname(require.resolve('@hyperlane-xyz/widgets'));
    config.resolve.alias = {
      ...config.resolve.alias,
      '@rainbow-me/rainbowkit': path.resolve(__dirname, 'src/vendor/rainbowkit-shim.ts'),
      // Deep path the widgets' `exports` map hides; used by src/vendor/widgets-multi-protocol.js.
      'hyperlane-widgets-ethereum': path.join(widgetsDist, 'walletIntegrations/ethereum.js'),
    };

    // EVM-only build. The bridge connects Ethereum/Sepolia and Lightchain, but the Hyperlane SDK
    // and widgets statically import every chain family's SDK and wallet stack (Solana, Cosmos,
    // Starknet, Radix, Aleo, Tron, zkSync; ~15 MB minified, incl. a 7 MB Radix WASM blob) and
    // mount their hooks unconditionally. Resolve those packages to a throwing stub and swap the
    // widgets' multi-protocol wallet hooks for an Ethereum-only version.
    const protocolStub = path.resolve(__dirname, 'src/vendor/protocol-stub.js');
    const NON_EVM_PACKAGES =
      /^(@hyperlane-xyz\/(radix-sdk|aleo-sdk|cosmos-sdk|cosmos-types|tron-sdk|starknet-core)|starknet|starknetkit|zksync-ethers|tronweb|cosmjs-types|@solana\/.+|@cosmjs\/.+|@cosmos-kit\/.+|@interchain-ui\/.+|@chakra-ui\/.+|@radixdlt\/.+|@provablehq\/.+|@starknet-react\/.+|@keplr-wallet\/.+|@drift-labs\/.+|@turnkey\/solana)(\/.*)?$/;
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(NON_EVM_PACKAGES, protocolStub),
      new webpack.NormalModuleReplacementPlugin(
        /[\\/]@hyperlane-xyz[\\/]widgets[\\/]dist[\\/]walletIntegrations[\\/](aleo|cosmos|radix|solana|starknet)(\.js|[\\/].+\.js)$/,
        protocolStub,
      ),
      new webpack.NormalModuleReplacementPlugin(
        /[\\/]@hyperlane-xyz[\\/]widgets[\\/]dist[\\/]walletIntegrations[\\/]multiProtocol\.js$/,
        path.resolve(__dirname, 'src/vendor/widgets-multi-protocol.js'),
      ),
    );

    if (!isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
    }

    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    });

    // @hyperlane-xyz/core ships deploy-time material the UI never uses, and the SDK keeps it
    // reachable through lookup maps, so tree-shaking cannot remove it (~18 MB minified):
    //  - zkSync compiler artifacts and solc build-info blobs -> empty stubs
    //  - deploy bytecode inside every typechain factory -> blanked, ABI kept
    const core = /[\\/]@hyperlane-xyz[\\/]core[\\/]/;
    config.module.rules.push({ test: core, sideEffects: false });
    config.module.rules.push({
      test: (p) => core.test(p) && /__factory\.js$/.test(p),
      use: path.resolve(__dirname, 'src/vendor/hyperlane-core/strip-bytecode-loader.js'),
    });
    const stub = (file) => path.resolve(__dirname, 'src/vendor/hyperlane-core', file);
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /[\\/]@hyperlane-xyz[\\/]core[\\/]dist[\\/]zksync[\\/]artifacts\.js$/,
        stub('artifacts-stub.js'),
      ),
      new webpack.NormalModuleReplacementPlugin(
        /[\\/]@hyperlane-xyz[\\/]core[\\/]dist[\\/](zksync[\\/])?buildArtifact\.js$/,
        stub('build-artifact-stub.js'),
      ),
    );

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@provablehq/wasm': false,
        '@provablehq/sdk': false,
      };
    }

    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_VERSION: version,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  },

  reactStrictMode: true,

  serverExternalPackages: ['@sentry/nextjs'],

  // Exclude heavy client-only chain SDKs from serverless function file tracing.
  // These packages are only used client-side and not needed in serverless functions.
  // Note: @sentry and @opentelemetry are kept for server-side instrumentation (see instrumentation.ts).
  outputFileTracingExcludes: {
    '*': [
      './node_modules/@provablehq/**',
      './node_modules/@radixdlt/**',
      './node_modules/@solana/**',
      './node_modules/@cosmjs/**',
      './node_modules/@starknet-io/**',
      './node_modules/ethers/**',
    ],
  },

  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    optimizePackageImports: [
      '@hyperlane-xyz/registry',
      '@hyperlane-xyz/sdk',
      '@hyperlane-xyz/utils',
      '@hyperlane-xyz/widgets',
    ],
  },

  // Skip linting and type checking during builds — CI runs these separately
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = withBundleAnalyzer(nextConfig);
