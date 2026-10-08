'use client';

/**
 * @hyperlane-xyz/widgets uses RainbowKit's useConnectModal for EVM wallet connect.
 * This shim routes that API to Reown AppKit until widgets supports AppKit natively.
 */
import { useAppKit } from '@reown/appkit/react';
import { useCallback } from 'react';

export function useConnectModal() {
  const { open } = useAppKit();

  const openConnectModal = useCallback(() => {
    open();
  }, [open]);

  return {
    connectModalOpen: false,
    openConnectModal,
  };
}
