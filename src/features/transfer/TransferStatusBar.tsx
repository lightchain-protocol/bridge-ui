import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { LuCheck, LuCopy, LuExternalLink, LuX } from 'react-icons/lu';
import { toast } from 'react-toastify';
import type { Hex } from 'viem';
import { ChainLogo } from '../../components/icons/ChainLogo';
import { chains } from '../../consts/chains';
import { ZAP } from '../../consts/zap';
import { useMultiProvider } from '../chains/hooks';
import { getChainDisplayName } from '../chains/utils';
import { useStore } from '../store';
import { tryFindToken, useWarpCore } from '../tokens/hooks';
import { useDelivery } from '../zap/useDelivery';
import { TransferStatus } from './types';

type Phase = 'sign' | 'confirm' | 'deliver' | 'delivered' | 'failed';

const SIGN_STATUSES = [
  TransferStatus.Preparing,
  TransferStatus.CreatingTxs,
  TransferStatus.SigningApprove,
  TransferStatus.ConfirmingApprove,
  TransferStatus.SigningRevoke,
  TransferStatus.ConfirmingRevoke,
  TransferStatus.SigningTransfer,
];

/**
 * Bridge-tab progress, docked above the card (replaces the old details modal that covered it).
 * Opens when a transfer starts, follows its status, then tracks delivery on the destination
 * mailbox. Sign -> Confirm -> Deliver.
 */
export function TransferStatusBar() {
  // Open only when a transfer is appended while one is in progress; status updates replace the
  // store entry, so the selector re-renders.
  const [index, setIndex] = useState<number | null>(null);
  const transfer = useStore((s) => (index === null ? undefined : s.transfers[index]));
  const setBeamState = useStore((s) => s.setBeamState);
  useEffect(
    () =>
      useStore.subscribe((s, prev) => {
        if (s.transferLoading && s.transfers.length > prev.transfers.length) {
          setIndex(s.transfers.length - 1);
        }
      }),
    [],
  );

  const multiProvider = useMultiProvider();
  const warpCore = useWarpCore();
  const destination = transfer?.destination;
  const destChain = destination ? chains[destination] : undefined;
  const msgId = transfer?.msgId as Hex | undefined;
  const isConfirmed = transfer?.status === TransferStatus.ConfirmedTransfer;
  const delivery = useDelivery(
    isConfirmed && destChain?.mailbox ? msgId : undefined,
    destChain?.mailbox
      ? { chainId: Number(destChain.chainId), mailbox: destChain.mailbox as Hex }
      : undefined,
  );
  const delivered = transfer?.status === TransferStatus.Delivered || !!delivery.data?.delivered;

  useEffect(() => {
    if (delivered) setBeamState('success');
  }, [delivered, setBeamState]);

  const elapsed = useElapsed(transfer?.timestamp, !delivered && transfer?.status !== 'failed');

  if (!transfer || !destination) return null;
  const { origin, amount, originTxHash, originTokenAddressOrDenom } = transfer;

  const phase: Phase =
    transfer.status === TransferStatus.Failed
      ? 'failed'
      : delivered
        ? 'delivered'
        : isConfirmed
          ? 'deliver'
          : transfer.status === TransferStatus.ConfirmingTransfer
            ? 'confirm'
            : SIGN_STATUSES.includes(transfer.status)
              ? 'sign'
              : 'confirm';

  const token = tryFindToken(warpCore, origin, originTokenAddressOrDenom);
  const symbol = token?.symbol || 'LCAI';
  const originName = getChainDisplayName(multiProvider, origin, true);
  const destName = getChainDisplayName(multiProvider, destination, true);
  const originTxUrl = originTxHash
    ? multiProvider
        .tryGetExplorerTxUrl(origin, { hash: originTxHash })
        ?.replace(/([^:])\/\//g, '$1/')
    : undefined;
  const deliveryTxHash = delivery.data?.deliveryTxHash ?? transfer.destinationTxHash;
  const deliveryUrl = deliveryTxHash
    ? destination === ZAP.destinationChainName
      ? ZAP.destinationTxUrl(deliveryTxHash)
      : ZAP.explorerTxUrl(deliveryTxHash)
    : undefined;

  const title = {
    sign: `Sending ${amount} ${symbol}`,
    confirm: `Sending ${amount} ${symbol}`,
    deliver: `${amount} ${symbol} on its way`,
    delivered: `${amount} ${symbol} arrived`,
    failed: 'Transfer failed',
  }[phase];
  const detail = {
    sign:
      transfer.status === TransferStatus.SigningApprove ||
      transfer.status === TransferStatus.ConfirmingApprove
        ? 'Approve the token in your wallet'
        : 'Confirm in your wallet',
    confirm: `Waiting for ${originName} to confirm`,
    deliver: `Relaying to ${destName} · ${formatElapsed(elapsed)}`,
    delivered: `Delivered on ${destName}`,
    failed: 'It did not go through, so your tokens stay in your wallet. Please try again.',
  }[phase];

  const steps: Array<{ id: Phase; label: string }> = [
    { id: 'sign', label: 'Sign' },
    { id: 'confirm', label: 'Confirm' },
    { id: 'deliver', label: 'Deliver' },
  ];
  const order: Phase[] = ['sign', 'confirm', 'deliver', 'delivered'];
  const at = phase === 'failed' ? -1 : order.indexOf(phase);

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'mb-3 animate-[status-in_0.35s_ease-out] overflow-hidden rounded-2xl border bg-dark/90 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl',
        phase === 'failed'
          ? 'border-red-500/40'
          : phase === 'delivered'
            ? 'border-emerald-400/50'
            : 'border-[rgba(112,100,233,0.35)]',
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <StatusIcon phase={phase} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-contentBody">{title}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-[rgba(112,100,233,0.2)] bg-dark2 px-1.5 py-0.5">
              <Logo chainName={origin} />
              <span className="text-[10px] text-content-gray">→</span>
              <Logo chainName={destination} />
            </span>
          </div>
          <div className="truncate text-xs text-content-gray">{detail}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {originTxUrl && <IconLink href={originTxUrl} title={`View on ${originName} explorer`} />}
          {deliveryUrl && (
            <IconLink href={deliveryUrl} title={`View delivery on ${destName}`} highlight />
          )}
          {msgId && (
            <IconButton
              title="Copy message ID"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(msgId)
                  .then(() => toast.success('Message ID copied', { autoClose: 2000 }))
                  .catch(() => undefined);
              }}
            >
              <LuCopy className="size-3.5" />
            </IconButton>
          )}
          <IconButton title="Dismiss" onClick={() => setIndex(null)}>
            <LuX className="size-3.5" />
          </IconButton>
        </div>
      </div>
      {/* Sign -> Confirm -> Deliver */}
      <div className="grid grid-cols-3 gap-1 px-4 pb-3">
        {steps.map((s, i) => {
          const done = at > i || phase === 'delivered';
          const active = at === i;
          return (
            <div key={s.id} className="flex flex-col gap-1">
              <span className="relative h-1 overflow-hidden rounded-full bg-[rgba(112,100,233,0.15)]">
                <span
                  className={clsx(
                    'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                    phase === 'failed'
                      ? 'w-full bg-red-500/50'
                      : done
                        ? phase === 'delivered'
                          ? 'w-full bg-emerald-400'
                          : 'w-full bg-gradient-to-r from-[#7064e9] to-[#dd00ac]'
                        : active
                          ? 'status-progress w-full'
                          : 'w-0',
                  )}
                />
              </span>
              <span
                className={clsx(
                  'text-[10px] font-medium uppercase tracking-wide',
                  done || active ? 'text-contentBody' : 'text-content-gray/70',
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusIcon({ phase }: { phase: Phase }) {
  if (phase === 'delivered')
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/50">
        <LuCheck className="size-4" />
      </span>
    );
  if (phase === 'failed')
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300 ring-1 ring-red-500/50">
        <LuX className="size-4" />
      </span>
    );
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center">
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-[rgba(112,100,233,0.2)] border-t-[#dd00ac]" />
      <span className="size-2 rounded-full bg-[#a59cff]" />
    </span>
  );
}

function Logo({ chainName }: { chainName: string }) {
  return (
    <span className="flex size-3.5 overflow-hidden rounded-full [&_img]:size-full [&_svg]:size-full">
      <ChainLogo chainName={chainName} size={14} />
    </span>
  );
}

function IconLink({
  href,
  title,
  highlight,
}: {
  href: string;
  title: string;
  highlight?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      aria-label={title}
      className={clsx(
        'flex size-7 items-center justify-center rounded-full transition-colors hover:bg-dark2',
        highlight ? 'text-emerald-300' : 'text-content-gray hover:text-contentBody',
      )}
    >
      <LuExternalLink className="size-3.5" />
    </a>
  );
}

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex size-7 items-center justify-center rounded-full text-content-gray transition-colors hover:bg-dark2 hover:text-contentBody"
    >
      {children}
    </button>
  );
}

function useElapsed(since: number | undefined, running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);
  return since ? Math.max(0, Math.floor((now - since) / 1000)) : 0;
}

function formatElapsed(s: number): string {
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}
