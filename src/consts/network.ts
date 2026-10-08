// Which deployment the app targets.
// Testnet (Sepolia <-> Lightchain testnet) is the default while the one-tx bridge is being
// validated. Set NEXT_PUBLIC_NETWORK=mainnet for the production deployment.
export type AppNetwork = 'mainnet' | 'testnet';

export const APP_NETWORK: AppNetwork =
  process?.env?.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';

export const IS_TESTNET = APP_NETWORK === 'testnet';
