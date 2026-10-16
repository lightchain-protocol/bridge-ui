import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { LuCheck, LuExternalLink } from 'react-icons/lu';
import type { Address, Hex } from 'viem';
import { ZAP } from '../../consts/zap';
import { AddLightchainButton } from './AddLightchainButton';
import type { Delivery } from './useDelivery';

const SLOW_AFTER_S = 8 * 60;

type StepState = 'done' | 'active' | 'todo';

/** Swapped -> Bridging -> Arrived, driven by the zap receipt and the Lightchain mailbox. */
export function DeliveryTracker({
  sourceTxHash,
  recipient,
  delivery,
  lcaiAmount,
}: {
  sourceTxHash: Hex;
  recipient?: Address;
  delivery?: Delivery;
  lcaiAmount?: string;
}) {
  const arrived = !!delivery?.delivered;
  const elapsed = useElapsedSeconds(!arrived);

  const steps: Array<{ label: string; detail: string; state: StepState; href?: string }> = [
    {
      label: 'Swapped on Uniswap',
      detail: `ETH → LCAI on ${ZAP.sourceLabel}`,
      state: 'done',
      href: ZAP.explorerTxUrl(sourceTxHash),
    },
    {
      label: 'Bridging via Hyperlane',
      detail: arrived ? 'Message relayed' : `Waiting for delivery · ${formatElapsed(elapsed)}`,
      state: arrived ? 'done' : 'active',
    },
    {
      label: `Arrived on ${ZAP.destinationLabel}`,
      detail: arrived
        ? `${lcaiAmount ? `${lcaiAmount} LCAI ` : ''}in your wallet`
        : 'Usually 1–3 min',
      state: arrived ? 'done' : 'todo',
      href: arrived
        ? delivery?.deliveryTxHash
          ? ZAP.destinationTxUrl(delivery.deliveryTxHash)
          : recipient && ZAP.destinationAddressUrl(recipient)
        : undefined,
    },
  ];

  return (
    <div className="w-full text-left">
      <ol className="flex flex-col gap-0">
        {steps.map((s, i) => (
          <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={clsx(
                  'absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-px',
                  steps[i + 1].state === 'todo' ? 'bg-[rgba(112,100,233,0.2)]' : 'bg-accent-400/60',
                )}
              />
            )}
            <StepIcon state={s.state} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-contentBody">
                {s.label}
                {s.href && (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-content-gray transition-colors hover:text-contentBody"
                    title="View transaction"
                  >
                    <LuExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <div className="text-xs text-content-gray">{s.detail}</div>
            </div>
          </li>
        ))}
      </ol>
      {!arrived && elapsed > SLOW_AFTER_S && (
        <p className="mb-0 mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
          Taking longer than usual. Your LCAI is safe in the bridge and will arrive once the relayer
          delivers the message; you can close this page.
        </p>
      )}
      {arrived && <AddLightchainButton className="mt-4 text-xs" />}
    </div>
  );
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done')
    return (
      <span className="relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-accent-300 ring-1 ring-accent-400/60">
        <LuCheck className="size-3.5" />
      </span>
    );
  if (state === 'active')
    return (
      <span className="relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ring-[#7064e9]">
        <span className="size-2.5 animate-ping rounded-full bg-[#7064e9]" />
        <span className="absolute size-2 rounded-full bg-[#a59cff]" />
      </span>
    );
  return (
    <span className="relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ring-[rgba(112,100,233,0.3)]">
      <span className="size-1.5 rounded-full bg-content-gray/50" />
    </span>
  );
}

function useElapsedSeconds(running: boolean): number {
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(start);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);
  return Math.floor((now - start) / 1000);
}

function formatElapsed(s: number): string {
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}
