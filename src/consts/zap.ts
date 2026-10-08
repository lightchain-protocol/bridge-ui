import type { Address } from 'viem';

// One-transaction ETH -> native LCAI on Lightchain. All addresses are Ethereum mainnet.
export const ZAP_CHAIN_ID = 1;
export const LIGHTCHAIN_DOMAIN = 9200;
export const LIGHTCHAIN_CHAIN_NAME = 'lcai';

export const LCAI_TOKEN: Address = '0x9cA8530CA349c966Fe9ef903Df17a75B8A778927';
export const WETH: Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const UNISWAP_QUOTER_V2: Address = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e';
export const UNISWAP_SWAP_ROUTER_02: Address = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
export const LCAI_POOL_FEE = 3000; // 0.3% tier, pool 0x0d047a370611437a1b8e6c2a95ea36f69fdda3be

// Hyperlane LCAI warp route (lightchain-protocol/hyperlane-bridge, lcai/configs/ethereum-lcai-config.yaml)
export const LCAI_COLLATERAL_ROUTER: Address = '0x01f80bb8e78e79881E8Ec7832fB6C2c59f64e353';

// LcaiZap contract (lcai-smart-contract/contracts/LcaiZap.sol). Unset until deployed.
export const LCAI_ZAP_ADDRESS = (process?.env?.NEXT_PUBLIC_LCAI_ZAP_ADDRESS || '') as Address | '';

export const ZAP_SLIPPAGE_BPS = 100; // 1%
export const ZAP_DEADLINE_SECONDS = 20 * 60;
export const ZAP_SOFT_CAP_ETH = 5; // pool is ~150 WETH deep; above this the price impact passes ~3%
