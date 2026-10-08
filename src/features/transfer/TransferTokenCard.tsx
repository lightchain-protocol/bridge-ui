import clsx from 'clsx';
import { useState } from 'react';
import { ZapForm } from '../zap/ZapForm';
import { TransferTokenForm } from './TransferTokenForm';

type Tab = 'buy' | 'bridge';

const TABS: Array<{ id: Tab; label: string; hint: string }> = [
  { id: 'buy', label: 'Buy & Bridge', hint: 'ETH → LCAI on Lightchain, one transaction' },
  { id: 'bridge', label: 'Bridge', hint: 'Move LCAI you already hold' },
];

export function TransferTokenCard() {
  const [tab, setTab] = useState<Tab>('buy');

  return (
    <div className="relative w-full min-w-0 max-w-full sm:w-[520px]">
      {/* Glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(221,0,172,0.18),transparent_70%)] blur-2xl"
      />
      <div className="min-w-0 rounded-3xl border border-[rgba(112,100,233,0.22)] bg-dark/80 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 px-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h1 className="text-lg font-semibold tracking-tight text-contentBody">LCAI Bridge</h1>
          <div
            role="tablist"
            className="flex self-start rounded-full border border-[rgba(112,100,233,0.2)] bg-darker2 p-1"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                title={t.hint}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  tab === t.id
                    ? 'bg-dark2 text-contentBody shadow-[inset_0_0_0_1px_rgba(112,100,233,0.35)]'
                    : 'text-content-gray hover:text-contentBody',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <p className="px-4 pt-1 text-xs text-content-gray sm:px-6">
          {TABS.find((t) => t.id === tab)?.hint}
        </p>
        <div className="p-4 sm:p-6">{tab === 'buy' ? <ZapForm /> : <TransferTokenForm />}</div>
      </div>
    </div>
  );
}
