import { AccountList, SpinnerIcon, useAccounts } from '@hyperlane-xyz/widgets';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LuExternalLink, LuHistory, LuRefreshCw, LuWallet, LuX } from 'react-icons/lu';
import { toast } from 'react-toastify';
import type { Address } from 'viem';
import { ChainLogo } from '../../components/icons/ChainLogo';
import { config } from '../../consts/config';
import { ZAP } from '../../consts/zap';
import ArrowRightIcon from '../../images/icons/arrow-right.svg';
import { useMultiProvider } from '../chains/hooks';
import { getChainDisplayName } from '../chains/utils';
import { mergeHistory, useBridgeHistory } from '../history/useBridgeHistory';
import { useStore } from '../store';
import { tryFindToken, useWarpCore } from '../tokens/hooks';
import { TransfersDetailsModal } from '../transfer/TransfersDetailsModal';
import { TransferContext } from '../transfer/types';
import { getIconByTransferStatus, STATUSES_WITH_ICON } from '../transfer/utils';

export function SideBarMenu({
  onClickConnectWallet,
  isOpen,
  onClose,
}: {
  onClickConnectWallet: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const didMountRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferContext | null>(null);

  const multiProvider = useMultiProvider();
  const warpCore = useWarpCore();

  const { transfers, transferLoading, originChainName } = useStore((s) => ({
    transfers: s.transfers,
    transferLoading: s.transferLoading,
    originChainName: s.originChainName,
  }));

  // Connected EVM wallet (the bridge is EVM-only on both ends)
  const { accounts } = useAccounts(multiProvider, config.addressBlacklist);
  const wallet = useMemo(() => {
    for (const accountInfo of Object.values(accounts)) {
      const addr = accountInfo.addresses?.[0]?.address;
      if (addr) return addr as Address;
    }
    return undefined;
  }, [accounts]);

  // LCAI bridge history straight from the warp-route events, merged with this browser's local list
  const history = useBridgeHistory(wallet);
  const isLoading = history.isLoading;
  const isRefreshing = history.isFetching && !history.isLoading;
  const refresh = () => void history.refetch();
  const mergedTransfers = useMemo(
    () => mergeHistory(transfers, history.data ?? []),
    [transfers, history.data],
  );

  const onCopySuccess = () => {
    toast.success('Address copied to clipboard', { autoClose: 2000 });
  };

  const handleItemClick = (item: TransferContext) => {
    setSelectedTransfer(item);
    setIsModalOpen(true);
  };

  // Open modal for new transfer
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
    } else if (transferLoading) {
      setSelectedTransfer(transfers[transfers.length - 1]);
      setIsModalOpen(true);
    }
  }, [transfers, transferLoading]);

  useEffect(() => {
    setIsMenuOpen(isOpen);
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => onClose()}
        className={`fixed inset-0 z-[98] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 ${
          isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-label="Wallet and transfer history"
        className={`hpl-sidebar fixed right-0 top-0 z-[99] flex h-full w-full max-w-[400px] flex-col border-l border-[rgba(112,100,233,0.22)] bg-dark/90 shadow-[-24px_0_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-transform duration-200 ease-out sm:my-3 sm:h-[calc(100%-1.5rem)] sm:rounded-l-3xl sm:border ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-contentBody">Wallet</h2>
            <p className="text-xs text-content-gray">Connected accounts and transfer history</p>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            title="Close"
            className="flex size-9 items-center justify-center rounded-full border border-[rgba(112,100,233,0.24)] bg-dark2 text-content-gray transition-colors hover:text-contentBody"
          >
            <LuX className="size-4" />
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-5"
        >
          {/* Accounts */}
          <section className="rounded-2xl border border-[rgba(112,100,233,0.16)] bg-darker2/80 p-3">
            <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-content-gray">
              <LuWallet className="size-3.5" />
              Connected wallets
            </div>
            <AccountList
              multiProvider={multiProvider}
              onClickConnectWallet={onClickConnectWallet}
              onCopySuccess={onCopySuccess}
              className="hpl-sidebar-list space-y-2"
              chainName={originChainName}
            />
          </section>

          {/* History */}
          <div className="mb-2 mt-5 flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-content-gray">
              <LuHistory className="size-3.5" />
              Transfer history
            </div>
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="flex size-7 items-center justify-center rounded-full text-content-gray transition-colors hover:bg-dark2 hover:text-contentBody disabled:opacity-50"
              title="Refresh"
            >
              <LuRefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex grow flex-col">
            {isRefreshing ? (
              <div className="flex justify-center py-6">
                <SpinnerIcon className="h-5 w-5" />
              </div>
            ) : (
              <>
                <div className="flex w-full grow flex-col gap-2">
                  {mergedTransfers.length === 0 && !isLoading && (
                    <div className="rounded-2xl border border-dashed border-[rgba(112,100,233,0.2)] py-8 text-center text-sm text-content-gray">
                      No transfers yet
                    </div>
                  )}
                  {mergedTransfers.map((item) => (
                    <LocalTransferSummary
                      key={`${item.timestamp}-${item.originTxHash || item.msgId || ''}`}
                      transfer={item}
                      onClick={() => handleItemClick(item)}
                      multiProvider={multiProvider}
                      warpCore={warpCore}
                    />
                  ))}
                </div>
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <SpinnerIcon className="h-5 w-5" />
                  </div>
                )}
                {history.isError && (
                  <div className="py-3 text-center text-xs text-red-300">
                    Could not load on-chain history. Showing this device only.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
      {selectedTransfer && (
        <TransfersDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTransfer(null);
          }}
          transfer={selectedTransfer}
        />
      )}
    </>
  );
}

function LocalTransferSummary({
  transfer,
  onClick,
  multiProvider,
  warpCore,
}: {
  transfer: TransferContext;
  onClick: () => void;
  multiProvider: ReturnType<typeof useMultiProvider>;
  warpCore: ReturnType<typeof useWarpCore>;
}) {
  const {
    amount,
    origin,
    destination,
    status,
    timestamp,
    originTokenAddressOrDenom,
    originTxHash,
    destinationTxHash,
  } = transfer;
  const token = tryFindToken(warpCore, origin, originTokenAddressOrDenom);
  const symbol = token?.symbol || 'LCAI';

  // Prefer the Lightchain side on Lightscan; fall back to the origin tx on the other explorer.
  const isToLightchain = destination === ZAP.destinationChainName;
  const scanUrl = destinationTxHash
    ? isToLightchain
      ? ZAP.destinationTxUrl(destinationTxHash)
      : ZAP.explorerTxUrl(destinationTxHash)
    : originTxHash
      ? isToLightchain
        ? ZAP.explorerTxUrl(originTxHash)
        : ZAP.destinationTxUrl(originTxHash)
      : undefined;
  const amountDisplay = Number(amount).toLocaleString('en-US', { maximumFractionDigits: 4 });

  return (
    <button key={timestamp} onClick={onClick} className={`${styles.btn} justify-between py-3`}>
      <div className="flex gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dark [&_img]:size-full">
          <ChainLogo chainName={origin} size={36} />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-contentBody">{amountDisplay}</span>
            <span className="text-sm text-contentBody">{symbol}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xxs tracking-wide text-content-gray">
            <span>{getChainDisplayName(multiProvider, origin, true)}</span>
            <Image src={ArrowRightIcon} width={10} height={10} alt="" />
            <span>{getChainDisplayName(multiProvider, destination, true)}</span>
            <span className="mx-1 opacity-40">·</span>
            <span>{new Date(timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {scanUrl && (
          <a
            href={scanUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={destinationTxHash ? 'View delivery on Lightscan' : 'View transaction'}
            className="flex size-7 items-center justify-center rounded-full text-content-gray transition-colors hover:bg-dark2 hover:text-contentBody"
          >
            <LuExternalLink className="size-3.5" />
          </a>
        )}
        <div className="flex h-5 w-5 items-center justify-center">
          {STATUSES_WITH_ICON.includes(status) ? (
            <Image src={getIconByTransferStatus(status)} width={22} height={22} alt="" />
          ) : (
            <SpinnerIcon className="h-5 w-5" />
          )}
        </div>
      </div>
    </button>
  );
}

const styles = {
  btn: 'w-full flex cursor-pointer items-center rounded-2xl border border-[rgba(112,100,233,0.16)] bg-darker2/80 px-3 py-2 text-sm transition-all duration-200 hover:border-[rgba(112,100,233,0.4)] hover:bg-dark2 active:scale-[0.99]',
};
