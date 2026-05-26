import { ConnectWalletButton as ConnectWalletButtonInner } from '@hyperlane-xyz/widgets';
import { useAppKit } from '@reown/appkit/react';
import { useMultiProvider } from '../chains/hooks';
import { useStore } from '../store';

export function ConnectWalletButton() {
  const { open } = useAppKit();
  const multiProvider = useMultiProvider();
  const { originChainName } = useStore((s) => ({
    originChainName: s.originChainName,
  }));

  const { setIsSideBarOpen } = useStore((s) => ({
    setShowEnvSelectModal: s.setShowEnvSelectModal,
    setIsSideBarOpen: s.setIsSideBarOpen,
  }));

  return (
    <ConnectWalletButtonInner
      multiProvider={multiProvider}
      onClickWhenUnconnected={() => open()}
      onClickWhenConnected={() => setIsSideBarOpen(true)}
      className="hpl-btn-gd btn-header rounded-lg py-2.5 font-medium uppercase [&_*]:text-white [&_path]:fill-white"
      countClassName="bg-white/20"
      chainName={originChainName}
    />
  );
}
