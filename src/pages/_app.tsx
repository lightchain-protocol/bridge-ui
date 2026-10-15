import { useIsSsr } from '@hyperlane-xyz/widgets';
import '@hyperlane-xyz/widgets/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../sentry.client.config';
import { ErrorBoundary } from '../components/errors/ErrorBoundary';
import { AppLayout } from '../components/layout/AppLayout';
import { MAIN_FONT } from '../consts/app';
import { WarpContextInitGate } from '../features/WarpContextInitGate';
import { EvmWalletContext } from '../features/wallet/context/EvmWalletContext';
import '../styles/globals.css';
import '../styles/globals.scss';
import '../vendor/inpage-metamask';
import '../vendor/polyfill';

const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  // Disable app SSR for now as it's not needed and
  // complicates wallet and graphql integrations
  const isSsr = useIsSsr();
  if (isSsr) {
    return <div></div>;
  }

  return (
    <div className={`${MAIN_FONT.variable} bg-mainBg font-sans text-black`}>
      <ErrorBoundary>
        <QueryClientProvider client={reactQueryClient}>
          <WarpContextInitGate>
            {/* EVM only: the non-EVM wallet providers were removed (see next.config.js). */}
            <EvmWalletContext>
              <AppLayout navConfig={pageProps.navConfig} footerConfig={pageProps.footerConfig}>
                <Component {...pageProps} />
                <Analytics />
              </AppLayout>
            </EvmWalletContext>
          </WarpContextInitGate>
        </QueryClientProvider>
        <ToastContainer transition={Zoom} position="bottom-right" limit={2} />
      </ErrorBoundary>
    </div>
  );
}
