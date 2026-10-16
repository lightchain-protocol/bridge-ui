import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { TransfersDetailsModal } from './TransfersDetailsModal';

/** Opens the progress modal when a Bridge-tab transfer starts, and follows its status. */
export function TransferStatusModal() {
  // Index of the transfer being shown. Open only when a new transfer is appended while a
  // transfer is in progress; status updates replace the entry, so the selector re-renders.
  const [index, setIndex] = useState<number | null>(null);
  const transfer = useStore((s) => (index === null ? undefined : s.transfers[index]));

  useEffect(
    () =>
      useStore.subscribe((s, prev) => {
        if (s.transferLoading && s.transfers.length > prev.transfers.length) {
          setIndex(s.transfers.length - 1);
        }
      }),
    [],
  );

  if (!transfer) return null;
  return <TransfersDetailsModal isOpen onClose={() => setIndex(null)} transfer={transfer} />;
}
