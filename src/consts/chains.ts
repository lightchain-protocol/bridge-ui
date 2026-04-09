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
  // },
  // eclipsemainnet: {
  //   ...eclipsemainnet,
  //   mailbox: eclipsemainnetAddresses.mailbox,
  // },
  // soon: {
  //   ...soon,
  //   mailbox: soonAddresses.mailbox,
  // },
  // sonicsvm: {
  //   ...sonicsvm,
  //   mailbox: sonicsvmAddresses.mailbox,
  // },
  // solaxy: {
  //   ...solaxy,
  //   mailbox: solaxyAddresses.mailbox,
  // },
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
    logoURI: '/logos/eth.png',
    mailbox: '0x3746b02CDfE03e6Fd4Bd1EE864f2ea79a1DE1DE2'
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
    mailbox: '0xc631131599FAc2bFc2Bb7B707E17DBaBf066046C',
  },
  lcaidevnet: {
    protocol: ProtocolType.Ethereum,
    chainId: 31337,
    domainId: 7331337,
    name: 'lcaidevnet',
    displayName: 'LightchainAI',
    nativeToken: { name: 'LightchainAI', symbol: 'LCAI', decimals: 18 },
    rpcUrls: [{ http: 'https://rpc.devnet.lightchain.ai' }],
    blocks: {
      confirmations: 1,
      reorgPeriod: 1,
      estimateBlockTime: 10,
    },
    logoURI: '/logos/lcai.png',
    mailbox: '0xceCE1D7B73a34e1073AB21ceBf626189bE6AAb77'
  },
};

// rent account payment for (mostly for) SVM chains added on top of IGP,
// not exact but should be pretty close to actual payment
export const chainsRentEstimate: ChainMap<bigint> = {
  eclipsemainnet: BigInt(Math.round(0.00004019 * 10 ** 9)),
  solanamainnet: BigInt(Math.round(0.00411336 * 10 ** 9)),
  sonicsvm: BigInt(Math.round(0.00411336 * 10 ** 9)),
  soon: BigInt(Math.round(0.00000355 * 10 ** 9)),
};
