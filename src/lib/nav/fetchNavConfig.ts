import type { RawNavConfig } from './types';

const NAV_CONFIG_URL = 'https://docs.lightchain.ai/nav-config.json';

export async function fetchNavConfig(): Promise<RawNavConfig[]> {
  const res = await fetch(NAV_CONFIG_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch nav config: ${res.status}`);
  return res.json() as Promise<RawNavConfig[]>;
}
