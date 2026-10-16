import { RawFooterConfig } from '../components/footer/types/types';

const FOOTER_CONFIG_URL = 'https://docs.lightchain.ai/footer-config.json';

// Timeout: runs in getStaticProps, and a hung docs site must not stall the build.
export async function fetchFooterConfig(): Promise<RawFooterConfig> {
  const res = await fetch(FOOTER_CONFIG_URL, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Failed to fetch footer config: ${res.status}`);
  return res.json();
}
