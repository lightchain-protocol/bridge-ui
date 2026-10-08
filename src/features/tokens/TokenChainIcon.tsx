import { IToken } from '@hyperlane-xyz/sdk';
import { ChainLogo } from '../../components/icons/ChainLogo';
import { TokenIcon } from '../../components/icons/TokenIcon';

interface Props {
  token: IToken;
  size?: number;
}

export function TokenChainIcon({ token, size = 36 }: Props) {
  const badgeSize = Math.max(14, Math.round(size * 0.45));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <TokenIcon token={token} size={size} />
      <div
        className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center overflow-hidden rounded-full bg-dark2 ring-2 ring-dark2"
        style={{ width: badgeSize, height: badgeSize }}
      >
        <ChainLogo chainName={token.chainName} size={badgeSize} />
      </div>
    </div>
  );
}
