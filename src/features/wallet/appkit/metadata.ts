import { APP_DESCRIPTION, APP_NAME, APP_URL } from '../../../consts/app';
import { config } from '../../../consts/config';

export function getAppKitMetadata() {
  const origin = typeof window !== 'undefined' ? window.location.origin : `https://${APP_URL}`;

  return {
    name: APP_NAME,
    description: APP_DESCRIPTION,
    url: origin,
    icons: [`${origin}/logo.svg`],
  };
}

export function getAppKitProjectId() {
  if (config.walletConnectProjectId) return config.walletConnectProjectId;

  // Lightchain AI project (dashboard.reown.com) — dev fallback only; prod must set the env var
  if (config.isDevMode) return '675ab88c974b1d13ffc2fe0bc470bf1a';

  return '';
}
