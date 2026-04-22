import { TokenStandard, WarpCoreConfig } from '@hyperlane-xyz/sdk';

// A list of Warp Route token configs
// These configs will be merged with the warp routes in the configured registry
// The input here is typically the output of the Hyperlane CLI warp deploy command
export const warpRouteConfigs: WarpCoreConfig = {
  tokens: [
    {
      addressOrDenom: '0x5Ff6b59Bf2eB5fD64176650011b0d74E8A55300b',
      chainName: 'lcaitestnet',
      connections: [
        {
          token: 'ethereum|sepolia|0xa4d14290Cc01ec798a7852cB1b3b314ea8F992AF',
        },
      ],
      decimals: 18,
      name: 'LightchainAI',
      standard: TokenStandard.EvmHypNative,
      symbol: 'LCAI',
      logoURI: '/logos/lcai.png',
    },
    {
      addressOrDenom: '0xa4d14290Cc01ec798a7852cB1b3b314ea8F992AF',
      chainName: 'sepolia',
      collateralAddressOrDenom: '0xCAb9A0d25d7F673E6cc05B35cd28D3e888d5D4A3',
      connections: [
        {
          token: 'ethereum|lcaitestnet|0x5Ff6b59Bf2eB5fD64176650011b0d74E8A55300b',
        },
      ],
      decimals: 18,
      name: 'LightchainAI',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LCAI',
      logoURI: '/logos/lcai.png',
    },
  ],
  options: {},
};
