import { TokenStandard, WarpCoreConfig } from '@hyperlane-xyz/sdk';

// A list of Warp Route token configs
// These configs will be merged with the warp routes in the configured registry
// The input here is typically the output of the Hyperlane CLI warp deploy command
export const warpRouteConfigs: WarpCoreConfig = {
  tokens: [
    {
      addressOrDenom: '0xEB48deF5d9d6F753697E71e10432306DDe7a7cF6',
      chainName: 'lcai',
      connections: [
        {
          token: 'ethereum|sepolia|0x9bFe5645F9A2C9c74Df6A31AFA65a632EDfB7681',
        },
      ],
      decimals: 18,
      name: 'LightchainAI',
      standard: TokenStandard.EvmHypNative,
      symbol: 'LCAI',
      logoURI: '/logos/lcai.png',
    },
    {
      addressOrDenom: '0x9bFe5645F9A2C9c74Df6A31AFA65a632EDfB7681',
      chainName: 'sepolia',
      collateralAddressOrDenom: '0x6381e597e08f736bA2a57DC5B917E4f9c26dA3dA',
      connections: [
        {
          token: 'ethereum|lcai|0xEB48deF5d9d6F753697E71e10432306DDe7a7cF6',
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
