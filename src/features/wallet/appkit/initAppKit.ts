import { MultiProtocolProvider } from '@hyperlane-xyz/sdk';
import { getWagmiChainConfigs } from '@hyperlane-xyz/widgets';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { fallback, http, type Chain, type Transport } from 'viem';
import type { Config } from 'wagmi';
import { getAppKitMetadata, getAppKitProjectId } from './metadata';

let appKitInitialized = false;

function buildTransports(chains: readonly Chain[]): Record<number, Transport> {
  return Object.fromEntries(
    chains.map((chain) => [
      chain.id,
      fallback(chain.rpcUrls.default.http.map((rpcUrl) => http(rpcUrl))),
    ]),
  );
}

export function createEvmWagmiConfig(multiProvider: MultiProtocolProvider): Config {
  const chains = getWagmiChainConfigs(multiProvider);
  if (chains.length === 0) {
    throw new Error('No EVM chains found in multiProvider');
  }

  const wagmiChains = [chains[0], ...chains.slice(1)] as [Chain, ...Chain[]];
  const networks = wagmiChains as unknown as [AppKitNetwork, ...AppKitNetwork[]];
  const projectId = getAppKitProjectId();

  if (!projectId) {
    throw new Error(
      'NEXT_PUBLIC_WALLET_CONNECT_ID is required for wallet connection. Get a project ID at https://dashboard.reown.com',
    );
  }

  const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    transports: buildTransports(wagmiChains),
  });

  if (!appKitInitialized) {
    createAppKit({
      adapters: [wagmiAdapter],
      networks,
      projectId,
      metadata: getAppKitMetadata(),
      themeMode: 'dark',
      enableCoinbase: false,
    });
    appKitInitialized = true;
  }

  return wagmiAdapter.wagmiConfig;
}
