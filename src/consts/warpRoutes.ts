import { TokenStandard, WarpCoreConfig } from '@hyperlane-xyz/sdk';

// A list of Warp Route token configs
// These configs will be merged with the warp routes in the configured registry
// The input here is typically the output of the Hyperlane CLI warp deploy command
export const warpRouteConfigs: WarpCoreConfig = {
  tokens: [
    {
      addressOrDenom: '0x00f6BC302C22067Bae909FC3adFc3cbB375eC867',
      chainName: 'lcaitestnet',
      connections: [
        {
          token: 'ethereum|sepolia|0xaEF7a8Fbf8cFb6ee752E66bC20DBB18020C8F8c0',
        },
      ],
      decimals: 18,
      name: 'LightchainAI',
      standard: TokenStandard.EvmHypNative,
      symbol: 'LCAI',
      logoURI: '/logos/lcai.png',
    },
    {
      addressOrDenom: '0xaEF7a8Fbf8cFb6ee752E66bC20DBB18020C8F8c0',
      chainName: 'sepolia',
      collateralAddressOrDenom: '0xCAb9A0d25d7F673E6cc05B35cd28D3e888d5D4A3',
      connections: [
        {
          token: 'ethereum|lcaitestnet|0x00f6BC302C22067Bae909FC3adFc3cbB375eC867',
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
