import { TokenStandard, WarpCoreConfig } from '@hyperlane-xyz/sdk';

// A list of Warp Route token configs
// These configs will be merged with the warp routes in the configured registry
// The input here is typically the output of the Hyperlane CLI warp deploy command
export const warpRouteConfigs: WarpCoreConfig = {
   tokens: [
    {
      addressOrDenom: '0xB9ee19d813D8c5c5Ce03A6cfE3C88aAD382239AA',
      chainName: 'lcaidevnet',
      connections: [
        {
          token: 'ethereum|sepolia|0x18462a7cf57637754631BAF5316ABed4e7e34A41',
        },
      ],
      decimals: 18,
      name: 'LightchainAI',
      standard: TokenStandard.EvmHypNative,
      symbol: 'LCAI',
      logoURI: '/logos/lcai.png',
    },
    {
      addressOrDenom: '0x18462a7cf57637754631BAF5316ABed4e7e34A41',
      chainName: 'sepolia',
      collateralAddressOrDenom: '0xCAb9A0d25d7F673E6cc05B35cd28D3e888d5D4A3',
      connections: [
        {
          token: 'ethereum|lcaidevnet|0xB9ee19d813D8c5c5Ce03A6cfE3C88aAD382239AA',
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
