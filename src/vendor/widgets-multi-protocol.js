// EVM-only replacement for @hyperlane-xyz/widgets' walletIntegrations/multiProtocol.js
// (wired in next.config.js). The original calls the Solana, Cosmos, Starknet, Radix and Aleo
// wallet hooks unconditionally, which drags every one of those wallet stacks into the bundle
// and requires their providers to be mounted. This bridge is Ethereum <-> Lightchain only.
//
// Same exports and shapes as the original; every protocol slot that is not Ethereum holds an
// inert value, so callers that index by ProtocolType keep working.
//
// Plain JS (no TS/JSX): webpack matches loaders against the module being replaced, which lives
// in node_modules. `hyperlane-widgets-ethereum` is a resolve alias to the widgets' ethereum.js.
// Bare specifiers only: this module is resolved from the widgets' directory, not from src/.
import { ProtocolType, rootLogger } from '@hyperlane-xyz/utils';
import {
  useEthereumAccount,
  useEthereumActiveChain,
  useEthereumConnectFn,
  useEthereumDisconnectFn,
  useEthereumTransactionFns,
  useEthereumWalletDetails,
  useEthereumWatchAsset,
} from 'hyperlane-widgets-ethereum';
import { useMemo } from 'react';

const OTHER_PROTOCOLS = [
  ProtocolType.Sealevel,
  ProtocolType.Cosmos,
  ProtocolType.CosmosNative,
  ProtocolType.Starknet,
  ProtocolType.Radix,
  ProtocolType.Aleo,
];

function byProtocol(evmValue, otherValue) {
  const out = { [ProtocolType.Ethereum]: evmValue };
  for (const p of OTHER_PROTOCOLS) out[p] = otherValue;
  return out;
}

const unsupported = (what) => async () => {
  throw new Error(`${what} is not supported: this bridge is EVM-only.`);
};

export function useAccounts(multiProvider, blacklistedAddresses = []) {
  const evmAccountInfo = useEthereumAccount(multiProvider);
  const readyAccounts = useMemo(() => [evmAccountInfo].filter((a) => a.isReady), [evmAccountInfo]);

  const readyAddresses = readyAccounts
    .map((a) => a.addresses)
    .flat()
    .map((a) => a.address.toLowerCase());
  if (readyAddresses.some((a) => blacklistedAddresses.includes(a))) {
    throw new Error('Wallet address is blacklisted');
  }

  return useMemo(
    () => ({
      accounts: byProtocol(evmAccountInfo, { protocol: undefined, addresses: [], isReady: false }),
      readyAccounts,
    }),
    [evmAccountInfo, readyAccounts],
  );
}

export function useAccountForChain(multiProvider, chainName) {
  const { accounts } = useAccounts(multiProvider);
  const protocol = chainName ? multiProvider.getProtocol(chainName) : undefined;
  if (!chainName || !protocol) return undefined;
  return accounts?.[protocol];
}

export function useAccountAddressForChain(multiProvider, chainName) {
  const { accounts } = useAccounts(multiProvider);
  return getAccountAddressForChain(multiProvider, chainName, accounts);
}

export function getAccountAddressForChain(multiProvider, chainName, accounts) {
  if (!chainName || !accounts) return undefined;
  const protocol = multiProvider.getProtocol(chainName);
  return accounts[protocol]?.addresses[0]?.address;
}

export function getAddressFromAccountAndChain(account, _chainName) {
  if (!account) return 'Unknown';
  return account.addresses[0]?.address ?? 'Unknown';
}

export function getAccountAddressAndPubKey(multiProvider, chainName, accounts) {
  const address = getAccountAddressForChain(multiProvider, chainName, accounts);
  if (!accounts || !chainName || !address) return {};
  const protocol = multiProvider.getProtocol(chainName);
  const publicKey = accounts[protocol]?.publicKey;
  return { address, publicKey };
}

export function useWalletDetails() {
  const evmWallet = useEthereumWalletDetails();
  return useMemo(() => byProtocol(evmWallet, {}), [evmWallet]);
}

export function useConnectFns() {
  const onConnectEthereum = useEthereumConnectFn();
  return useMemo(() => byProtocol(onConnectEthereum, () => {}), [onConnectEthereum]);
}

export function useDisconnectFns() {
  const disconnectEvm = useEthereumDisconnectFn();
  return useMemo(() => {
    const onClickDisconnect = async () => {
      try {
        if (!disconnectEvm) throw new Error('Disconnect function is null');
        await disconnectEvm();
      } catch (error) {
        rootLogger.error('Error disconnecting from Ethereum wallet', error);
      }
    };
    return byProtocol(onClickDisconnect, async () => {});
  }, [disconnectEvm]);
}

export function useActiveChains(multiProvider) {
  const evmChain = useEthereumActiveChain(multiProvider);
  const readyChains = useMemo(() => [evmChain].filter((c) => !!c.chainDisplayName), [evmChain]);
  return useMemo(
    () => ({ chains: byProtocol(evmChain, {}), readyChains }),
    [evmChain, readyChains],
  );
}

export function useTransactionFns(multiProvider) {
  const evm = useEthereumTransactionFns(multiProvider);
  return useMemo(
    () =>
      byProtocol(
        {
          sendTransaction: evm.sendTransaction,
          sendMultiTransaction: evm.sendMultiTransaction,
          switchNetwork: evm.switchNetwork,
        },
        {
          sendTransaction: unsupported('sendTransaction'),
          sendMultiTransaction: unsupported('sendMultiTransaction'),
          switchNetwork: unsupported('switchNetwork'),
        },
      ),
    [evm.sendTransaction, evm.sendMultiTransaction, evm.switchNetwork],
  );
}

export function useWatchAsset(multiProvider) {
  const { addAsset } = useEthereumWatchAsset(multiProvider);
  return useMemo(() => byProtocol({ addAsset }, { addAsset: unsupported('addAsset') }), [addAsset]);
}
