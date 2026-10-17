'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { initIntercom } from '../../features/analytics/intercom';
import { initRefiner } from '../../features/analytics/refiner';
import { EVENT_NAME } from '../../features/analytics/types';
import { useWalletConnectionTracking } from '../../features/analytics/useWalletConnectionTracking';
import { trackEvent } from '../../features/analytics/utils';
import { useStore } from '../../features/store';
import { fetchNavConfig } from '../../lib/nav/fetchNavConfig';
import type { RawNavConfig } from '../../lib/nav/types';
import { Header } from '../nav/Header';
import Starfield from '../ui/Starfield';

type Props = PropsWithChildren<{
  // Provided by pages with getStaticProps (index); other pages fall back to a client fetch.
  navConfig?: RawNavConfig[] | null;
}>;

export function AppLayout({ children, navConfig: navProp }: Props) {
  const [navConfig, setNavConfig] = useState<RawNavConfig[]>(navProp ?? []);
  const warpPulse = useStore((s) => s.warpPulse);

  useWalletConnectionTracking();

  useEffect(() => {
    initIntercom();
    initRefiner();
    trackEvent(EVENT_NAME.PAGE_VIEWED, {});
  }, []);

  // Fallback for pages without build-time config; a failed fetch just leaves the nav empty.
  useEffect(() => {
    if (navProp) return;
    let cancelled = false;
    fetchNavConfig()
      .then((nav) => {
        if (!cancelled) setNavConfig(nav);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [navProp]);

  return (
    <>
      {/* Background: a faint brand glow under a warp-speed starfield (plain 2D canvas), fixed to
          the viewport so it fills the screen at any page height. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_50%_45%,rgba(112,100,233,0.16),transparent_70%)]"
      >
        <Starfield warpPulse={warpPulse} />
      </div>
      {/* Header on top, the bridge card centred in the remaining height. No footer. */}
      <div id="app-content" className="relative z-[1] flex min-h-dvh w-full flex-col">
        <Header rawMenus={navConfig} />
        <main className="main-wrapper container relative z-10 mx-auto flex w-full flex-1 items-center justify-center overflow-hidden px-3 py-8 sm:py-12">
          {children}
        </main>
      </div>
    </>
  );
}
