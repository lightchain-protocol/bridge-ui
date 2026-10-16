import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { toast } from 'react-toastify';
import { useConfig, useWalletClient } from 'wagmi';
import { ZAP } from '../../consts/zap';
import { logger } from '../../utils/logger';

/** One click to add Lightchain to the connected wallet, so arriving LCAI shows up there. */
export function AddLightchainButton({ className = '' }: { className?: string }) {
  const { chains } = useConfig();
  const { data: walletClient } = useWalletClient();
  const [busy, setBusy] = useState(false);
  const chain = chains.find((c) => c.id === ZAP.destinationChainId);
  if (!walletClient || !chain) return null;

  const onClick = async () => {
    setBusy(true);
    try {
      await walletClient.addChain({ chain });
      toast.success(`${ZAP.destinationLabel} added to your wallet`, { autoClose: 3000 });
    } catch (error) {
      // User rejection or a wallet without wallet_addEthereumChain: expected, just say so.
      logger.warn('wallet_addEthereumChain failed', error);
      toast.error(`Could not add ${ZAP.destinationLabel} to this wallet`, { autoClose: 4000 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`flex items-center gap-1 rounded-full text-accent-300 transition-colors hover:text-accent-200 disabled:opacity-50 ${className}`}
    >
      <LuPlus className="size-3" />
      Add {ZAP.destinationLabel} to wallet
    </button>
  );
}
