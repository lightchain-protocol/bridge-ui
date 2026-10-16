import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuSettings } from 'react-icons/lu';
import { APP_NETWORK, AppNetwork, switchAppNetwork } from '../../consts/network';
import {
  ZAP_MAX_SLIPPAGE_BPS,
  ZAP_MIN_SLIPPAGE_BPS,
  ZAP_SLIPPAGE_PRESETS_BPS,
} from '../../consts/zap';
import { useStore } from '../store';

const OPTIONS: Array<{ id: AppNetwork; label: string; hint: string }> = [
  { id: 'mainnet', label: 'Mainnet', hint: 'Ethereum ↔ Lightchain' },
  { id: 'testnet', label: 'Testnet', hint: 'Sepolia ↔ Lightchain Testnet' },
];

/** Gear button + settings popover: network (mainnet/testnet, reloads the app) and Buy & Bridge slippage. */
export function NetworkMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Settings"
        className={clsx(
          'flex size-9 items-center justify-center rounded-full border border-[rgba(112,100,233,0.2)] bg-darker2 text-content-gray transition-colors hover:text-contentBody',
          open && 'text-contentBody',
        )}
      >
        <LuSettings
          className={clsx('size-4 transition-transform duration-300', open && 'rotate-90')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-30 w-64 rounded-2xl border border-[rgba(112,100,233,0.22)] bg-dark/95 p-2 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <div className="px-2 pb-1.5 pt-1 text-xs font-medium uppercase tracking-wide text-content-gray">
            Network
          </div>
          {OPTIONS.map((o) => {
            const active = o.id === APP_NETWORK;
            return (
              <button
                key={o.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setOpen(false);
                  switchAppNetwork(o.id);
                }}
                className={clsx(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors',
                  active ? 'bg-dark2' : 'hover:bg-dark2/60',
                )}
              >
                <span>
                  <span className="block text-sm font-medium text-contentBody">{o.label}</span>
                  <span className="block text-xs text-content-gray">{o.hint}</span>
                </span>
                {active && <LuCheck className="size-4 text-accent-300" />}
              </button>
            );
          })}
          <SlippageSetting />
        </div>
      )}
    </div>
  );
}

function SlippageSetting() {
  const bps = useStore((s) => s.zapSlippageBps);
  const setBps = useStore((s) => s.setZapSlippageBps);
  const isPreset = ZAP_SLIPPAGE_PRESETS_BPS.includes(bps);
  const [custom, setCustom] = useState(isPreset ? '' : String(bps / 100));
  const customBps = Math.round(Number(custom) * 100);
  const customValid =
    custom !== '' &&
    Number.isFinite(customBps) &&
    customBps >= ZAP_MIN_SLIPPAGE_BPS &&
    customBps <= ZAP_MAX_SLIPPAGE_BPS;

  const applyCustom = () => {
    if (customValid) setBps(customBps);
  };

  return (
    <div className="mt-2 border-t border-[rgba(112,100,233,0.16)] px-2 pb-1 pt-3">
      <div className="pb-2 text-xs font-medium uppercase tracking-wide text-content-gray">
        Buy &amp; Bridge slippage
      </div>
      <div className="flex gap-1.5">
        {ZAP_SLIPPAGE_PRESETS_BPS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setBps(p);
              setCustom('');
            }}
            className={clsx(
              'flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
              bps === p
                ? 'bg-accent-500/25 text-contentBody ring-1 ring-accent-400/60'
                : 'bg-dark2 text-content-gray hover:text-contentBody',
            )}
          >
            {p / 100}%
          </button>
        ))}
        <label
          className={clsx(
            'flex flex-[1.6] items-center rounded-lg bg-dark2 px-2 text-xs',
            !isPreset && 'ring-1 ring-accent-400/60',
            custom !== '' && !customValid && 'ring-1 ring-red-400/70',
          )}
        >
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, ''))}
            onBlur={applyCustom}
            onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
            inputMode="decimal"
            placeholder="Custom"
            aria-label="Custom slippage percent"
            className="w-full min-w-0 bg-transparent py-1.5 text-contentBody outline-none placeholder:text-content-gray"
          />
          <span className="text-content-gray">%</span>
        </label>
      </div>
      <p className="mb-0 mt-2 text-[11px] leading-snug text-content-gray">
        {bps > 200
          ? 'High slippage: the swap can execute at a worse price and invites front-running.'
          : `The swap reverts if the price moves more than ${bps / 100}%. Max ${ZAP_MAX_SLIPPAGE_BPS / 100}%.`}
      </p>
    </div>
  );
}
