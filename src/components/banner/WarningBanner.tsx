import { WarningIcon } from '@hyperlane-xyz/widgets';
import { PropsWithChildren, ReactNode } from 'react';

export function WarningBanner({
  isVisible,
  cta,
  onClick,
  className,
  children,
}: PropsWithChildren<{
  isVisible: boolean;
  cta?: ReactNode;
  onClick?: () => void;
  className?: string;
}>) {
  // Hidden banners render nothing, so they take no space in flex/gap layouts.
  if (!isVisible) return null;
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-xs text-yellow-200 [&_path]:fill-yellow-300 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2">
        <WarningIcon width={20} height={20} />
        {children}
      </div>
      {cta && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="shrink-0 rounded-full bg-yellow-500/20 px-2.5 py-1 text-center font-semibold hover:bg-yellow-500/30 active:bg-yellow-500/40"
        >
          {cta}
        </button>
      )}
    </div>
  );
}
