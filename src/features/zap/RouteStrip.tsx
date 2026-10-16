import { LuArrowLeftRight, LuRepeat } from 'react-icons/lu';
import { ChainLogo } from '../../components/icons/ChainLogo';
import { ZAP } from '../../consts/zap';

/**
 * What happens to the user's ETH, as a single-row stepper:
 * Ethereum -> Uniswap swap -> Hyperlane bridge -> Lightchain. Never wraps; labels sit under icons.
 */
export function RouteStrip() {
  return (
    <div className="relative w-full min-w-0" aria-label="Route">
      {/* Connector behind the nodes, from the first node's centre to the last one's. */}
      <div
        aria-hidden
        className="route-flow absolute left-[12.5%] right-[12.5%] top-[13px] h-px bg-gradient-to-r from-[#627eea]/60 via-[#dd00ac]/70 to-[#7064e9]/70"
      />
      <ol className="relative grid grid-cols-4">
        <Node label={ZAP.sourceLabel}>
          <ChainLogo chainName={ZAP.sourceChainName} size={18} />
        </Node>
        <Node label="Swap" sub="Uniswap">
          <LuRepeat className="size-3.5 text-[#ff4fa8]" />
        </Node>
        <Node label="Bridge" sub="Hyperlane">
          <LuArrowLeftRight className="size-3.5 text-[#a59cff]" />
        </Node>
        <Node label={shortLabel(ZAP.destinationLabel)}>
          <ChainLogo chainName={ZAP.destinationChainName} size={18} />
        </Node>
      </ol>
    </div>
  );
}

function Node({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex min-w-0 flex-col items-center gap-1 text-center">
      <span className="flex size-7 items-center justify-center overflow-hidden rounded-full border border-[rgba(112,100,233,0.3)] bg-dark2 shadow-[0_0_12px_rgba(112,100,233,0.18)] [&_img]:size-[18px] [&_svg]:shrink-0">
        {children}
      </span>
      <span className="max-w-full truncate text-[11px] font-medium leading-tight text-contentBody">
        {label}
      </span>
      {sub && (
        <span className="-mt-1 max-w-full truncate text-[10px] leading-tight text-content-gray">
          {sub}
        </span>
      )}
    </li>
  );
}

// "Lightchain Testnet" is too long for a quarter-width column on phones.
function shortLabel(label: string): string {
  return label.replace(' Testnet', '');
}
