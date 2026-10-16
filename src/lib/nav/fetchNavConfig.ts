import type { RawNavConfig } from './types';

const NAV_CONFIG_URL = 'https://docs.lightchain.ai/nav-config.json';

// Timeout: runs in getStaticProps, and a hung docs site must not stall the build.
export async function fetchNavConfig(): Promise<RawNavConfig[]> {
  const res = await fetch(NAV_CONFIG_URL, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Failed to fetch nav config: ${res.status}`);
  return res.json() as Promise<RawNavConfig[]>;
}
