import { Inter as SpaceGrotesk } from 'next/font/google';
import { Color } from '../styles/Color';

export const MAIN_FONT = SpaceGrotesk({
  subsets: ['latin'],
  variable: '--font-main',
  preload: true,
  fallback: ['sans-serif'],
});
export const APP_NAME = 'Lightchain';
export const APP_DESCRIPTION = 'Lightchain Protocol AI merges blockchain with AI via its innovative Proof of Intelligence (PoI) and AI Virtual Machine (AIVM), fostering decentralized, scalable, and privacy-focused solutions for AI tasks and governance.';
export const APP_URL = 'hyperlane-warp-template.vercel.app';
export const BRAND_COLOR = Color.primary['500'];
export const BACKGROUND_COLOR = Color.primary;
export const BACKGROUND_IMAGE = 'url(/backgrounds/main.webp)';
