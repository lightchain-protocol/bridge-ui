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
      className="hpl-btn-gd btn-header rounded-lg !py-2 font-medium capitalize [&_*]:text-white [&_path]:fill-white [&_.htw-flex-col]:flex-row [&_.htw-flex-col]:items-center [&_.htw-flex-col]:gap-2 [&_.htw-text-gray-500]:opacity-70"
      countClassName="bg-white/20"
      chainName={originChainName}
    />
  );
}
