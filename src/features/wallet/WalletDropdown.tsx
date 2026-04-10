import { ProtocolType, shortenAddress } from '@hyperlane-xyz/utils';
import {
  ChevronIcon,
  DropdownMenu,
  useAccountAddressForChain,
  useAccountForChain,
  useConnectFns,
  useDisconnectFns,
  useModal
} from '@hyperlane-xyz/widgets';
import React, { useCallback, useMemo } from 'react';
import { Color } from '../../styles/Color';
import { logger } from '../../utils/logger';
import { useChainProtocol, useMultiProvider } from '../chains/hooks';
import { RecipientAddressModal } from './RecipientAddressModal';

interface WalletDropdownProps {
  chainName: string | undefined;
  selectionMode: 'origin' | 'destination';
  recipient?: string;
  onRecipientChange?: (address: string) => void;
  disabled?: boolean;
}

export function WalletDropdown({
  chainName,
  selectionMode,
  recipient,
  onRecipientChange,
  disabled,
}: WalletDropdownProps) {
  const multiProvider = useMultiProvider();
  const protocol = useChainProtocol(chainName || '') || ProtocolType.Ethereum;

  const account = useAccountForChain(multiProvider, chainName);
  const isConnected = account?.isReady;
  const connectedAddress = useAccountAddressForChain(multiProvider, chainName);

  const disconnectFns = useDisconnectFns();
  const disconnectFn = disconnectFns[protocol];

  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModal();

  const onDisconnect = useCallback(async () => {
    try {
      await disconnectFn?.();
    } catch (err) {
      logger.error('Failed to disconnect wallet', err);
    }
  }, [disconnectFn]);

  const onSaveRecipient = useCallback(
    (address: string) => {
      onRecipientChange?.(address);
    },
    [onRecipientChange],
  );

  const onUseConnectedWallet = useCallback(() => {
    onRecipientChange?.('');
  }, [onRecipientChange]);

  const isDestination = selectionMode === 'destination';
  const hasCustomRecipient = isDestination && !!recipient && recipient !== connectedAddress;
  const displayAddress = hasCustomRecipient ? recipient : connectedAddress;
  const truncatedAddress = displayAddress ? shortenAddress(displayAddress) : '';

  // Build menu items based on state
  const menuItems = useMemo(() => {
    const items: React.ReactNode[] = [];

    // when there is not a wallet connected, show the current chain wallet connect modal
    if (!isConnected) {
      items.push(<ConnectMenuItem key="connect" protocol={protocol} />);
    }

    if (isDestination) {
      items.push(
        <MenuItemButton key="paste" onClick={openModal}>
          Paste wallet address
        </MenuItemButton>,
      );
    }

    if (hasCustomRecipient && isConnected) {
      items.push(<MenuSeparator key="sep-2" />);
      items.push(
        <MenuItemButton key="use-connected" onClick={onUseConnectedWallet}>
          Use connected wallet
        </MenuItemButton>,
      );
    }

    // Only show disconnect if actually connected
    if (isConnected) {
      if (items.length > 0) items.push(<MenuSeparator key="sep-3" />);
      items.push(
        <MenuItemButton key="disconnect" onClick={onDisconnect}>
          Disconnect wallet
        </MenuItemButton>,
      );
    }

    return items;
  }, [
    isDestination,
    hasCustomRecipient,
    isConnected,
    protocol,
    onDisconnect,
    onUseConnectedWallet,
    openModal,
  ]);

  // Origin mode, not connected - simple button without dropdown
  if (!isConnected && !isDestination) {
    return <ConnectWalletButton chainName={chainName} />;
  }

  // All other cases - use dropdown
  return (
    <>
      <DropdownMenu
        button={<DropdownWalletButton address={truncatedAddress} />}
        buttonClassname="flex items-center border-0 bg-transparent outline-none ring-0 shadow-none focus:outline-none focus:ring-0"
        menuClassname="mt-2 flex min-w-[200px] flex-col gap-1.5 rounded-md border border-transparent bg-dark p-2 shadow-md outline-none ring-0"
        menuItems={menuItems}
        buttonProps={{ disabled }}
      />
      <RecipientAddressModal
        isOpen={isModalOpen}
        close={closeModal}
        onSave={onSaveRecipient}
        initialValue={recipient}
        protocol={protocol}
      />
    </>
  );
}

// Self-contained connect button with its own hooks
function ConnectWalletButton({ chainName }: { chainName?: string }) {
  const protocol = useChainProtocol(chainName || '') || ProtocolType.Ethereum;
  const connectFns = useConnectFns();
  const connectFn = connectFns[protocol];

  const onConnect = useCallback(() => {
    connectFn?.();
  }, [connectFn]);

  return (
    <button
      type="button"
      onClick={onConnect}
      className="flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-600"
    >
      <span>Connect Wallet</span>
      <ChevronIcon width={10} height={8} direction="s" color={Color.primary[500]} />
    </button>
  );
}

// Self-contained connect menu item with its own hooks
function ConnectMenuItem({ protocol }: { protocol: ProtocolType }) {
  const connectFns = useConnectFns();
  const connectFn = connectFns[protocol];

  const onConnect = useCallback(() => {
    connectFn?.();
  }, [connectFn]);

  return (
    <button
      type="button"
      onClick={onConnect}
      className="w-full rounded-lg px-4 py-2 text-left text-sm text-contentBody transition-colors bg-dark2 hover:bg-darker2"
    >
      Connect wallet
    </button>
  );
}

function DropdownWalletButton({ address }: { address: string }) {
  return (
    <div className="flex items-center gap-2 border-0 bg-transparent text-sm text-content-gray outline-none ring-0 transition-colors duration-150 hover:text-contentBody [&_path]:fill-content-gray [&_path]:hover:fill-contentBody">
      <span>{address || 'Connect Wallet'}</span>
      <ChevronIcon width={10} height={6} direction="s" />
    </div>
  );
}

function MenuItemButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg px-4 py-2 text-left text-sm text-contentBody transition-colors bg-dark2 hover:bg-darker2"
    >
      {children}
    </button>
  );
}

function MenuSeparator() {
  return <div className="mx-2 my-1 h-px bg-[rgba(112,100,233,0.16)]" />;
}
