import { Inter as SpaceGrotesk } from 'next/font/google';
import { Color } from '../styles/Color';

export const MAIN_FONT = SpaceGrotesk({
  subsets: ['latin'],
  variable: '--font-main',
  preload: true,
  fallback: ['sans-serif'],
});
export const APP_NAME = 'LCAI Bridge';
// Page metadata (src/components/layout/SiteHead.tsx). Title ~55 chars and description ~155 chars
// so search results show them uncut.
export const APP_TITLE = 'LCAI Bridge | Buy & Bridge ETH to Lightchain AI';
export const APP_DESCRIPTION =
  'Bridge to Lightchain AI in one transaction: swap ETH for native LCAI and bridge it from Ethereum, or move LCAI you already hold between Ethereum and Lightchain.';
export const APP_KEYWORDS = [
  'LCAI bridge',
  'Lightchain bridge',
  'Lightchain AI',
  'LCAI',
  'LCAI token',
  'buy LCAI',
  'ETH to LCAI',
  'Ethereum to Lightchain',
  'bridge ETH to Lightchain',
  'Lightchain mainnet',
  'cross-chain bridge',
  'Hyperlane bridge',
  'Hyperlane warp route',
].join(', ');
export const APP_URL = 'bridge.lightchain.ai'; // hostname; APP_ORIGIN for absolute URLs
export const APP_ORIGIN = `https://${APP_URL}`;
export const APP_OG_IMAGE = `${APP_ORIGIN}/og-image.png`; // 1200x630
export const APP_TWITTER = '@LightchainAI';
export const BRAND_COLOR = Color.primary['500'];
export const BACKGROUND_COLOR = Color.primary;
export const BACKGROUND_IMAGE = 'url(/backgrounds/main.webp)';
