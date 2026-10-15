import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { TransfersDetailsModal } from './TransfersDetailsModal';
import { TransferContext } from './types';

/** Opens the progress modal when a Bridge-tab transfer starts. */
export function TransferStatusModal() {
  const [transfer, setTransfer] = useState<TransferContext | null>(null);

  // The transfer is added after loading starts, so follow the list while loading.
  useEffect(
    () =>
      useStore.subscribe((s, prev) => {
        if (!s.transferLoading) return;
        if (s.transfers === prev.transfers && prev.transferLoading) return;
        setTransfer(s.transfers[s.transfers.length - 1] ?? null);
      }),
    [],
  );

  if (!transfer) return null;
  return <TransfersDetailsModal isOpen onClose={() => setTransfer(null)} transfer={transfer} />;
}
