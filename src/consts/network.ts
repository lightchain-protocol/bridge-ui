// Which deployment the app targets: Ethereum <-> Lightchain (mainnet) or Sepolia <-> Lightchain testnet.
//
// Resolution order (first match wins):
//   1. `?network=mainnet|testnet` in the URL (also saved, so shared links stick)
//   2. the user's choice from the network menu, saved in localStorage
//   3. NEXT_PUBLIC_NETWORK at build time (defaults to testnet)
//
// Everything that depends on the network (chains, warp routes, zap addresses) is resolved once at
// module load, so switching network reloads the page. The app body only renders client-side
// (WarpContextInitGate), so the server's env-based value never reaches the rendered card.
export type AppNetwork = 'mainnet' | 'testnet';

export const NETWORK_STORAGE_KEY = 'lcai-bridge-network';

const ENV_NETWORK: AppNetwork =
  process?.env?.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';

function isNetwork(v: unknown): v is AppNetwork {
  return v === 'mainnet' || v === 'testnet';
}

function readUserNetwork(): AppNetwork | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('network');
    if (isNetwork(fromUrl)) {
      window.localStorage.setItem(NETWORK_STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    const saved = window.localStorage.getItem(NETWORK_STORAGE_KEY);
    return isNetwork(saved) ? saved : null;
  } catch {
    // Storage blocked (private mode etc.): fall back to the build default.
    return null;
  }
}

export const APP_NETWORK: AppNetwork = readUserNetwork() ?? ENV_NETWORK;

export const IS_TESTNET = APP_NETWORK === 'testnet';

/**
 * AppKit and wagmi remember the last active chain. After a switch that chain is no longer in the
 * configured list, so AppKit would open "This app doesn't support your current network" on load,
 * even with no wallet connected. Drop only the remembered chain; keep wallet connections.
 */
function clearRememberedChain() {
  window.localStorage.removeItem('@appkit/active_caip_network_id');
  const raw = window.localStorage.getItem('wagmi.store');
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.state && 'chainId' in parsed.state) {
      delete parsed.state.chainId;
      window.localStorage.setItem('wagmi.store', JSON.stringify(parsed));
    }
  } catch {
    // Unreadable store: leave it; wagmi rebuilds it.
  }
}

/** Persist the choice and reload on a clean URL (token query params belong to the old network). */
export function switchAppNetwork(network: AppNetwork) {
  if (network === APP_NETWORK) return;
  try {
    window.localStorage.setItem(NETWORK_STORAGE_KEY, network);
    clearRememberedChain();
  } catch {
    // Without storage the choice can't persist; carry it in the URL instead.
    window.location.assign(`${window.location.pathname}?network=${network}`);
    return;
  }
  window.location.assign(window.location.pathname);
}
