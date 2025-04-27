import { ChainMap, ChainMetadata, ExplorerFamily } from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';

// A map of chain names to ChainMetadata
// Chains can be defined here, in chains.json, or in chains.yaml
// Chains already in the SDK need not be included here unless you want to override some fields
// Schema here: https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/main/typescript/sdk/src/metadata/chainMetadataTypes.ts
export const chains: ChainMap<ChainMetadata & { mailbox?: Address }> = {
  // solanamainnet: {
  //   ...solanamainnet,
  //   // SVM chains require mailbox addresses for the token adapters
  //   mailbox: solanamainnetAddresses.mailbox,
  //   // Including a convenient rpc override because the Solana public RPC does not allow browser requests from localhost
  // },
  // eclipsemainnet: {
  //   ...eclipsemainnet,
  //   mailbox: eclipsemainnetAddresses.mailbox,
  // },
  // sepolia,
  sepolia: {
    blockExplorers: [
      {
        apiUrl: 'https://api-sepolia.etherscan.io/api',
        family: ExplorerFamily.Etherscan,
        name: 'Etherscan',
        url: 'https://sepolia.etherscan.io',
      },
    ],
    blocks: {
      confirmations: 1,
      estimateBlockTime: 13,
      reorgPeriod: 2,
    },
    chainId: 11155111,
    deployer: {
      name: 'Abacus Works',
      url: 'https://www.hyperlane.xyz',
    },
    displayName: 'Sepolia',
    domainId: 11155111,
    gasCurrencyCoinGeckoId: 'ethereum',
    gnosisSafeTransactionServiceUrl: 'https://safe-transaction-sepolia.safe.global',
    isTestnet: true,
    name: 'sepolia',
    nativeToken: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://ethereum-sepolia.publicnode.com',
      },
      {
        http: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
      },
      {
        http: 'https://rpc.sepolia.org',
      },
    ],
    logoURI: '/logos/eth.svg',
  },
  lcai: {
    protocol: ProtocolType.Ethereum,
    chainId: 504,
    domainId: 504,
    name: 'lcai',
    displayName: 'LightchainAI',
    nativeToken: { name: 'LightchainAI', symbol: 'LCAI', decimals: 18 },
    rpcUrls: [{ http: 'https://light-testnet-rpc.lightchain.ai' }],
    blockExplorers: [
      {
        name: 'LightchainAI Explorer',
        url: 'https://testnet.lightscan.app',
        apiUrl: 'https://testnet.lightscan.app/api',
        family: ExplorerFamily.Blockscout,
      },
    ],
    blocks: {
      confirmations: 1,
      reorgPeriod: 1,
      estimateBlockTime: 10,
    },
    logoURI: '/logos/lcai.png',
  },
};
