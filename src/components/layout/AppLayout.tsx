'use client';

import { MultiProtocolWalletModal } from '@hyperlane-xyz/widgets';
import Head from 'next/head';
import { PropsWithChildren, useEffect, useState } from 'react';
import { APP_NAME, BACKGROUND_COLOR, BACKGROUND_IMAGE } from '../../consts/app';
import { config } from '../../consts/config';
import { useStore } from '../../features/store';
import { SideBarMenu } from '../../features/wallet/SideBarMenu';
import { fetchNavConfig } from '../../lib/nav/fetchNavConfig';
import { RawNavConfig } from '../../lib/nav/types';
import { fetchFooterConfig } from '../../utils/fetchFooterConfig';
import Footer from '../footer/Footer';
import { RawFooterConfig } from '../footer/types/types';
import { Header } from '../nav/Header';

export function AppLayout({ children }: PropsWithChildren) {
  const { showEnvSelectModal, setShowEnvSelectModal, isSideBarOpen, setIsSideBarOpen } = useStore(
    (s) => ({
      showEnvSelectModal: s.showEnvSelectModal,
      setShowEnvSelectModal: s.setShowEnvSelectModal,
      isSideBarOpen: s.isSideBarOpen,
      setIsSideBarOpen: s.setIsSideBarOpen,
    }),
  );

  const [footerConfig, setFooterConfig] = useState<RawFooterConfig | null>(null);
  const [navConfig, setNavConfig] = useState<RawNavConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchFooterConfig(), fetchNavConfig()]).then(([footer, nav]) => {
      setFooterConfig(footer);
      setNavConfig(nav);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <Head>
        {/* https://nextjs.org/docs/messages/no-document-viewport-meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{APP_NAME}</title>
      </Head>
      <div
        style={styles.container}
        id="app-content"
        className="min-w-screen relative flex h-full min-h-screen w-full flex-col justify-between"
      >
        <Header rawMenus={navConfig} />
        <div className="mx-auto flex max-w-screen-xl grow items-center sm:px-4">
          <main className="main-wrapper flex w-full flex-1 items-center justify-center py-10 sm:py-24 lg:py-[120px] px-3">{children}</main>
        </div>
        {!isLoading && footerConfig && <Footer rawFooter={footerConfig} />}
      </div>

      <MultiProtocolWalletModal
        isOpen={showEnvSelectModal}
        close={() => setShowEnvSelectModal(false)}
        protocols={config.walletProtocols}
      />
      <SideBarMenu
        onClose={() => setIsSideBarOpen(false)}
        isOpen={isSideBarOpen}
        onClickConnectWallet={() => setShowEnvSelectModal(true)}
      />
    </>
  );
}

const styles = {
  container: {
    backgroundColor: BACKGROUND_COLOR,
    backgroundImage: BACKGROUND_IMAGE,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
};
