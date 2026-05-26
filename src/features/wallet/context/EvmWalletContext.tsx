import { PropsWithChildren, useMemo } from 'react';
import { WagmiProvider } from 'wagmi';
import { useMultiProvider } from '../../chains/hooks';
import { createEvmWagmiConfig } from '../appkit/initAppKit';

export function EvmWalletContext({ children }: PropsWithChildren<unknown>) {
  const multiProvider = useMultiProvider();
  const wagmiConfig = useMemo(() => createEvmWagmiConfig(multiProvider), [multiProvider]);

  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
