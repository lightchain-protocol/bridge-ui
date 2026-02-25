import { RawFooterConfig } from '../components/footer/types/types';

const FOOTER_CONFIG_URL =
  'https://gist.githubusercontent.com/marcuslcai/cbf1b8f7c8e63b7cf76987bd17a6dc20/raw/f0740def97e439f2effbe12e554871f531d8e9bc/lcai-footer.json';

export async function fetchFooterConfig(): Promise<RawFooterConfig> {
  const res = await fetch(FOOTER_CONFIG_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch footer config: ${res.status}`);
  return res.json();
}
