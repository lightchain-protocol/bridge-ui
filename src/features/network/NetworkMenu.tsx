import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuSettings } from 'react-icons/lu';
import { APP_NETWORK, AppNetwork, switchAppNetwork } from '../../consts/network';

const OPTIONS: Array<{ id: AppNetwork; label: string; hint: string }> = [
  { id: 'mainnet', label: 'Mainnet', hint: 'Ethereum ↔ Lightchain' },
  { id: 'testnet', label: 'Testnet', hint: 'Sepolia ↔ Lightchain Testnet' },
];

/** Gear button + popover to switch between mainnet and testnet. Switching reloads the app. */
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
        title="Network settings"
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
        </div>
      )}
    </div>
  );
}
