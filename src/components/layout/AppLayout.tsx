'use client';

import Head from 'next/head';
import { PropsWithChildren, useEffect, useState } from 'react';
import { APP_NAME } from '../../consts/app';
import { initIntercom } from '../../features/analytics/intercom';
import { initRefiner } from '../../features/analytics/refiner';
import { EVENT_NAME } from '../../features/analytics/types';
import { useWalletConnectionTracking } from '../../features/analytics/useWalletConnectionTracking';
import { trackEvent } from '../../features/analytics/utils';
import { TransferStatusModal } from '../../features/transfer/TransferStatusModal';
import { fetchNavConfig } from '../../lib/nav/fetchNavConfig';
import type { RawNavConfig } from '../../lib/nav/types';
import { fetchFooterConfig } from '../../utils/fetchFooterConfig';
import Footer from '../footer/Footer';
import type { RawFooterConfig } from '../footer/types/types';
import { Header } from '../nav/Header';
import DottedLineBackground from '../ui/DottedLineBackground';
import Starfield from '../ui/Starfield';

type Props = PropsWithChildren<{
  // Provided by pages with getStaticProps (index); other pages fall back to a client fetch.
  navConfig?: RawNavConfig[] | null;
  footerConfig?: RawFooterConfig | null;
}>;

export function AppLayout({ children, navConfig: navProp, footerConfig: footerProp }: Props) {
  const [footerConfig, setFooterConfig] = useState<RawFooterConfig | null>(footerProp ?? null);
  const [navConfig, setNavConfig] = useState<RawNavConfig[]>(navProp ?? []);

  useWalletConnectionTracking();

  useEffect(() => {
    initIntercom();
    initRefiner();
    trackEvent(EVENT_NAME.PAGE_VIEWED, {});
  }, []);

  // Fallback for pages without build-time config. Each request fails independently; a failed
  // fetch leaves that part of the chrome empty instead of hiding the whole footer forever.
  useEffect(() => {
    if (navProp && footerProp) return;
    let cancelled = false;
    Promise.allSettled([
      navProp ? Promise.resolve(navProp) : fetchNavConfig(),
      footerProp ? Promise.resolve(footerProp) : fetchFooterConfig(),
    ]).then(([nav, footer]) => {
      if (cancelled) return;
      if (nav.status === 'fulfilled') setNavConfig(nav.value);
      if (footer.status === 'fulfilled') setFooterConfig(footer.value);
    });
    return () => {
      cancelled = true;
    };
  }, [navProp, footerProp]);

  return (
    <>
      <Head>
        {/* https://nextjs.org/docs/messages/no-document-viewport-meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{APP_NAME}</title>
      </Head>
      <div id="app-content" className="min-w-screen relative w-full bg-[#000000]">
        <Header rawMenus={navConfig} />
        <div className="relative mx-auto overflow-hidden">
          <main className="main-wrapper container relative z-10 mx-auto flex w-full flex-1 items-center justify-center overflow-hidden px-3 py-10 sm:py-24 lg:py-[120px]">
            {children}
            <DottedLineBackground lineCount={5} />
          </main>
          {/* Background: a faint brand glow under a warp-speed starfield (plain 2D canvas). */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-full bg-[radial-gradient(55%_45%_at_50%_40%,rgba(112,100,233,0.16),transparent_70%)]"
          >
            <Starfield />
          </div>
        </div>
        {footerConfig && <Footer rawFooter={footerConfig} />}
      </div>

      <TransferStatusModal />
    </>
  );
}
