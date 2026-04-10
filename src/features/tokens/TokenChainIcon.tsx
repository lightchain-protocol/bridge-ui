import { IToken } from '@hyperlane-xyz/sdk';
import { ChainLogo } from '../../components/icons/ChainLogo';

interface Props {
  token: IToken;
  size?: number;
}

export function TokenChainIcon({ token }: Props) {
  return (
    <ChainLogo chainName={token.chainName} size={50} />
  );
}
