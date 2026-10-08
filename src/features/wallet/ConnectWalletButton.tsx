import { ConnectWalletButton as ConnectWalletButtonInner } from '@hyperlane-xyz/widgets';
import { useAppKit } from '@reown/appkit/react';
import { useMultiProvider } from '../chains/hooks';
import { useStore } from '../store';

export function ConnectWalletButton() {
  const { open } = useAppKit();
  const multiProvider = useMultiProvider();
  const { originChainName, setIsSideBarOpen } = useStore((s) => ({
    originChainName: s.originChainName,
    setIsSideBarOpen: s.setIsSideBarOpen,
  }));

  return (
    <ConnectWalletButtonInner
      multiProvider={multiProvider}
      onClickWhenUnconnected={() => open()}
      onClickWhenConnected={() => setIsSideBarOpen(true)}
      className="hpl-btn-gd btn-header rounded-lg py-2.5 font-medium capitalize [&_*]:text-white [&_path]:fill-white"
      countClassName="bg-white/20"
      chainName={originChainName}
    />
  );
}
