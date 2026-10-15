import type { GetStaticProps, NextPage } from 'next';
import type { RawFooterConfig } from '../components/footer/types/types';
import { TransferTokenCard } from '../features/transfer/TransferTokenCard';
import { fetchNavConfig } from '../lib/nav/fetchNavConfig';
import type { RawNavConfig } from '../lib/nav/types';
import { fetchFooterConfig } from '../utils/fetchFooterConfig';

export interface SiteChromeProps {
  navConfig: RawNavConfig[] | null;
  footerConfig: RawFooterConfig | null;
}

const Home: NextPage<SiteChromeProps> = () => {
  return (
    <div className="relative z-10 flex w-full items-center justify-center">
      <TransferTokenCard />
    </div>
  );
};

// Nav and footer content comes from docs.lightchain.ai. Fetch it when the page is built (and
// hourly after that via ISR) instead of from every visitor's browser; AppLayout reads it from
// pageProps. If the docs site is unreachable at build time, ship without it and retry sooner.
export const getStaticProps: GetStaticProps<SiteChromeProps> = async () => {
  const [nav, footer] = await Promise.allSettled([fetchNavConfig(), fetchFooterConfig()]);
  const ok = nav.status === 'fulfilled' && footer.status === 'fulfilled';
  return {
    props: {
      navConfig: nav.status === 'fulfilled' ? nav.value : null,
      footerConfig: footer.status === 'fulfilled' ? footer.value : null,
    },
    revalidate: ok ? 3600 : 300,
  };
};

export default Home;
