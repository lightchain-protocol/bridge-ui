import { APP_DESCRIPTION, APP_NAME, APP_URL } from '../../../consts/app';
import { config } from '../../../consts/config';

export function getAppKitMetadata() {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : `https://${APP_URL}`;

  return {
    name: APP_NAME,
    description: APP_DESCRIPTION,
    url: origin,
    icons: [`${origin}/logo.svg`],
  };
}

export function getAppKitProjectId() {
  if (config.walletConnectProjectId) return config.walletConnectProjectId;

  // Public project ID for localhost testing only — create your own at dashboard.reown.com
  if (config.isDevMode) return 'b56e18d47c72ab683b10814fe9495694';

  return '';
}
