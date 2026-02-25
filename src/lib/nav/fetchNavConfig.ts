import type { RawNavConfig } from "./types";

const NAV_CONFIG_URL = "https://gist.githubusercontent.com/marcuslcai/149543e2f4b156b6a63b74b3f7e99f55/raw/3642b7c43db620e638a8c029112af5bcee651ba4/lcai-nav.json";

export async function fetchNavConfig(): Promise<RawNavConfig[]> {
  const res = await fetch(NAV_CONFIG_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch nav config: ${res.status}`);
  return res.json() as Promise<RawNavConfig[]>;
}
