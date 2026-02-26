import { RawFooterConfig } from '../components/footer/types/types';

const FOOTER_CONFIG_URL = 'https://docs.lightchain.ai/footer-config.json';

export async function fetchFooterConfig(): Promise<RawFooterConfig> {
  const res = await fetch(FOOTER_CONFIG_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch footer config: ${res.status}`);
  return res.json();
}
