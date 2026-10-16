import type { GetStaticProps, NextPage } from 'next';
import { TransferTokenCard } from '../features/transfer/TransferTokenCard';
import { fetchNavConfig } from '../lib/nav/fetchNavConfig';
import type { RawNavConfig } from '../lib/nav/types';

export interface SiteChromeProps {
  navConfig: RawNavConfig[] | null;
}

const Home: NextPage<SiteChromeProps> = () => {
  return (
    <div className="relative z-10 flex w-full items-center justify-center">
      <TransferTokenCard />
    </div>
  );
};

// Nav content comes from docs.lightchain.ai. Fetch it when the page is built (and hourly after
// that via ISR) instead of from every visitor's browser; AppLayout reads it from pageProps. If
// the docs site is unreachable at build time, ship without it and retry sooner.
export const getStaticProps: GetStaticProps<SiteChromeProps> = async () => {
  try {
    return { props: { navConfig: await fetchNavConfig() }, revalidate: 3600 };
  } catch {
    return { props: { navConfig: null }, revalidate: 300 };
  }
};

export default Home;
