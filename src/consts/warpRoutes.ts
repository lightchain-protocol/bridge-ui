import { TokenStandard, WarpCoreConfig } from '@hyperlane-xyz/sdk';

// A list of Warp Route token configs
// These configs will be merged with the warp routes in the configured registry
// The input here is typically the output of the Hyperlane CLI warp deploy command
export const warpRouteConfigs: WarpCoreConfig = {
  tokens: [
    {
      addressOrDenom: '0xcD5485a26F238d7327153dde10780c294f23a5B2',
      chainName: 'lcai',
      connections: [
        {
          token: 'ethereum|sepolia|0xE3c768c1dadd0ad20C5e59c5773D240eF2DB301a',
        },
      ],
      decimals: 18,
      name: 'LightchainAI',
      standard: TokenStandard.EvmHypNative,
      symbol: 'LCAI',
      logoURI: '/logos/lcai.png',
    },
    {
      addressOrDenom: '0xE3c768c1dadd0ad20C5e59c5773D240eF2DB301a',
      chainName: 'sepolia',
      collateralAddressOrDenom: '0x6381e597e08f736bA2a57DC5B917E4f9c26dA3dA',
      connections: [
        {
          token: 'ethereum|lcai|0xcD5485a26F238d7327153dde10780c294f23a5B2',
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
