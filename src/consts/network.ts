// Which deployment the app targets. Set NEXT_PUBLIC_NETWORK=testnet for Sepolia <-> Lightchain testnet.
export type AppNetwork = 'mainnet' | 'testnet';

export const APP_NETWORK: AppNetwork =
  process?.env?.NEXT_PUBLIC_NETWORK === 'testnet' ? 'testnet' : 'mainnet';

export const IS_TESTNET = APP_NETWORK === 'testnet';
