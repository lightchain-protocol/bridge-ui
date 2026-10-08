import type { Address } from 'viem';
import { IS_TESTNET } from './network';

// One-transaction ETH -> native LCAI on Lightchain. Addresses are per network.
interface ZapNetworkConfig {
  chainId: number; // EVM chain the zap runs on (Ethereum or Sepolia)
  sourceChainName: string; // Hyperlane chain name of the source chain, for logos
  sourceLabel: string; // Network label shown on the pay side
  destinationDomain: number; // Hyperlane domain of Lightchain
  destinationChainName: string; // Hyperlane chain name of Lightchain, for logos
  destinationLabel: string; // Network label shown on the receive side
  lcaiToken: Address;
  weth: Address;
  quoterV2: Address;
  swapRouter02: Address;
  poolFee: number;
  collateralRouter: Address; // Hyperlane HypERC20Collateral for LCAI (source chain)
  nativeRouter: Address; // Hyperlane HypNative for LCAI (Lightchain)
  explorerTxUrl: (hash: string) => string; // source-chain tx
  destinationTxUrl: (hash: string) => string; // Lightscan tx
  destinationAddressUrl: (address: string) => string; // Lightscan page where the LCAI lands
  // Etherscan-compatible `module=logs&action=getLogs` endpoints, used to rebuild bridge history
  // without an indexer (Hyperlane's explorer does not cover Lightchain).
  sourceLogsApi: string;
  destinationLogsApi: string;
}

// Public Etherscan key already shipped in chains.ts; Lightscan (Blockscout) needs none.
const ETHERSCAN_API_KEY = 'GP69JEAP2W7YFJT9ZJTEPGQT6Y6KMW44ZN';

// Mainnet pool: 0x0d047a370611437a1b8e6c2a95ea36f69fdda3be. Route: hyperlane-bridge/lcai/configs.
const mainnet: ZapNetworkConfig = {
  chainId: 1,
  sourceChainName: 'ethereum',
  sourceLabel: 'Ethereum',
  destinationDomain: 9200,
  destinationChainName: 'lcai',
  destinationLabel: 'Lightchain',
  lcaiToken: '0x9cA8530CA349c966Fe9ef903Df17a75B8A778927',
  weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  quoterV2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
  swapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  poolFee: 3000,
  collateralRouter: '0x01f80bb8e78e79881E8Ec7832fB6C2c59f64e353',
  nativeRouter: '0xEc7096A3116EE769457C939617375Ec1785AA6f1',
  explorerTxUrl: (hash) => `https://etherscan.io/tx/${hash}`,
  destinationTxUrl: (hash) => `https://mainnet.lightscan.app/tx/${hash}`,
  destinationAddressUrl: (address) => `https://mainnet.lightscan.app/address/${address}`,
  sourceLogsApi: `https://api.etherscan.io/v2/api?chainid=1&apikey=${ETHERSCAN_API_KEY}`,
  destinationLogsApi: 'https://mainnet.lightscan.app/api',
};

// Sepolia pool: 0x46E84fE79693235f98898341e237200e11282e61 (demo liquidity only). Route: hyperlane-bridge/testnet/configs.
const testnet: ZapNetworkConfig = {
  chainId: 11155111,
  sourceChainName: 'sepolia',
  sourceLabel: 'Sepolia',
  destinationDomain: 8200,
  destinationChainName: 'lcaitestnet',
  destinationLabel: 'Lightchain Testnet',
  lcaiToken: '0xCAb9A0d25d7F673E6cc05B35cd28D3e888d5D4A3',
  weth: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  quoterV2: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3',
  swapRouter02: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
  poolFee: 3000,
  collateralRouter: '0xa4d14290Cc01ec798a7852cB1b3b314ea8F992AF',
  nativeRouter: '0x5Ff6b59Bf2eB5fD64176650011b0d74E8A55300b',
  explorerTxUrl: (hash) => `https://sepolia.etherscan.io/tx/${hash}`,
  destinationTxUrl: (hash) => `https://testnet.lightscan.app/tx/${hash}`,
  destinationAddressUrl: (address) => `https://testnet.lightscan.app/address/${address}`,
  sourceLogsApi: `https://api.etherscan.io/v2/api?chainid=11155111&apikey=${ETHERSCAN_API_KEY}`,
  destinationLogsApi: 'https://testnet.lightscan.app/api',
};

export const ZAP = IS_TESTNET ? testnet : mainnet;

export const ZAP_CHAIN_ID = ZAP.chainId;
export const LIGHTCHAIN_DOMAIN = ZAP.destinationDomain;
export const LIGHTCHAIN_CHAIN_NAME = ZAP.destinationChainName;
export const LCAI_TOKEN = ZAP.lcaiToken;
export const WETH = ZAP.weth;
export const UNISWAP_QUOTER_V2 = ZAP.quoterV2;
export const UNISWAP_SWAP_ROUTER_02 = ZAP.swapRouter02;
export const LCAI_POOL_FEE = ZAP.poolFee;
export const LCAI_COLLATERAL_ROUTER = ZAP.collateralRouter;

// LcaiZap contract (lcai-smart-contract/contracts/LcaiZap.sol).
// Deployed via Ignition (lcai-smart-contract, ignition/deployments/lcai-zap-*). Env var overrides either.
const TESTNET_ZAP_ADDRESS: Address = '0xEdeCE82309F12a1cb17eEe9DdDF095e845aEC49e'; // Sepolia
const MAINNET_ZAP_ADDRESS: Address = '0x91961D28700c6524C74C4C660A3EA236550d0b27'; // Ethereum
export const LCAI_ZAP_ADDRESS = (process?.env?.NEXT_PUBLIC_LCAI_ZAP_ADDRESS ||
  (IS_TESTNET ? TESTNET_ZAP_ADDRESS : MAINNET_ZAP_ADDRESS)) as Address;

export const ZAP_SLIPPAGE_BPS = 100; // 1%
export const ZAP_DEADLINE_SECONDS = 20 * 60;
export const ZAP_SOFT_CAP_ETH = IS_TESTNET ? 0.002 : 5; // mainnet pool ~150 WETH deep; testnet pool is tiny
