import { IToken } from '@hyperlane-xyz/sdk';
import { isHttpsUrl } from '@hyperlane-xyz/utils';
import { Circle } from '@hyperlane-xyz/widgets';
import { useMemo, useState } from 'react';
import { links } from '../../consts/links';
import { useChainMetadata } from '../../features/chains/hooks';

interface Props {
  token?: IToken | null;
  size?: number;
}

export function TokenIcon({ token, size = 32 }: Props) {
  const chainMetadata = useChainMetadata(token?.chainName);
  const chainId = typeof chainMetadata?.chainId === 'number' ? chainMetadata.chainId : undefined;

  const candidates = useMemo(
    () => buildCandidates(token, chainId, size),
    [token, chainId, size],
  );

  const tokenKey = token ? `${token.chainName}::${token.addressOrDenom}` : '';
  const [attempt, setAttempt] = useState(0);
  const [activeKey, setActiveKey] = useState(tokenKey);
  if (activeKey !== tokenKey) {
    setActiveKey(tokenKey);
    setAttempt(0);
  }

  const src = candidates[attempt];
  const title = token?.symbol || '';
  const character = title ? title.charAt(0).toUpperCase() : '';
  const fontSize = Math.floor(size / 2);
  const bgColorSeed =
    token && !src ? (Buffer.from(token.addressOrDenom).at(0) || 0) % 5 : undefined;

  return (
    <Circle size={size} bgColorSeed={bgColorSeed} title={title}>
      {src ? (
        <img
          key={src}
          src={src}
          className="h-full w-full p-0.5"
          onError={() => setAttempt((i) => i + 1)}
          loading="lazy"
        />
      ) : (
        <div className={`text-[${fontSize}px]`}>{character}</div>
      )}
    </Circle>
  );
}

function buildCandidates(
  token: IToken | null | undefined,
  chainId: number | undefined,
  size: number,
): string[] {
  if (!token) return [];
  const out: string[] = [];
  const logo = token.logoURI;

  if (logo) {
    if (isHttpsUrl(logo)) {
      out.push(logo);
    } else if (logo.startsWith('/')) {
      out.push(logo);
    } else {
      out.push(`${links.imgPath}/${logo.replace(/^\.?\/?/, '')}`);
    }
  }

  const addr = token.addressOrDenom;
  if (chainId && addr && /^0x[0-9a-fA-F]{40}$/.test(addr)) {
    const px = Math.max(48, Math.round(size * 2));
    out.push(
      `https://token-icons.llamao.fi/icons/tokens/${chainId}/${addr.toLowerCase()}?h=${px}&w=${px}`,
    );
  }

  return out;
}
