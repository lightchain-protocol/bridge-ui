import { ProtocolType } from '@hyperlane-xyz/utils';
import {
  CopyButton,
  MessageStatus,
  MessageTimeline,
  Modal,
  SpinnerIcon,
  useAccountForChain,
  useMessageTimeline,
  useTimeout,
  useWalletDetails,
  WideChevronIcon,
  XIcon,
} from '@hyperlane-xyz/widgets';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChainLogo } from '../../components/icons/ChainLogo';
import { TokenIcon } from '../../components/icons/TokenIcon';
import LinkIcon from '../../images/icons/external-link-icon.svg';
import { Color } from '../../styles/Color';
import { formatTimestamp } from '../../utils/date';
import { getHypExplorerLink } from '../../utils/links';
import { logger } from '../../utils/logger';
import { useMultiProvider } from '../chains/hooks';
import { getChainDisplayName, hasPermissionlessChain } from '../chains/utils';
import { tryFindToken, useWarpCore } from '../tokens/hooks';
import { TransferContext, TransferStatus } from './types';
import {
  getIconByTransferStatus,
  getTransferStatusLabel,
  isTransferFailed,
  isTransferSent,
} from './utils';

export function TransfersDetailsModal({
  isOpen,
  onClose,
  transfer,
}: {
  isOpen: boolean;
  onClose: () => void;
  transfer: TransferContext;
}) {
  const [fromUrl, setFromUrl] = useState<string>('');
  const [toUrl, setToUrl] = useState<string>('');
  const [originTxUrl, setOriginTxUrl] = useState<string>('');

  const {
    status,
    origin,
    destination,
    amount,
    sender,
    recipient,
    originTokenAddressOrDenom,
    originTxHash,
    msgId,
    timestamp,
  } = transfer || {};

  const multiProvider = useMultiProvider();
  const warpCore = useWarpCore();

  const isChainKnown = multiProvider.hasChain(origin);
  const account = useAccountForChain(multiProvider, isChainKnown ? origin : undefined);
  const walletDetails = useWalletDetails()[account?.protocol || ProtocolType.Ethereum];

  useEffect(() => {
    if (!transfer) return;
    let cancelled = false;

    const fetchUrls = async () => {
      try {
        setFromUrl('');
        setToUrl('');
        setOriginTxUrl('');
        if (originTxHash) {
          const txUrl = multiProvider.tryGetExplorerTxUrl(origin, { hash: originTxHash });
          if (txUrl && !cancelled) setOriginTxUrl(fixDoubleSlash(txUrl));
        }
        const [fetchedFromUrl, fetchedToUrl] = await Promise.all([
          multiProvider.tryGetExplorerAddressUrl(origin, sender),
          multiProvider.tryGetExplorerAddressUrl(destination, recipient),
        ]);
        if (cancelled) return;
        if (fetchedFromUrl) setFromUrl(fixDoubleSlash(fetchedFromUrl));
        if (fetchedToUrl) setToUrl(fixDoubleSlash(fetchedToUrl));
      } catch (error) {
        logger.error('Error fetching URLs:', error);
      }
    };

    fetchUrls();
    return () => {
      cancelled = true;
    };
  }, [transfer, multiProvider, origin, destination, originTxHash, sender, recipient]);

  const isAccountReady = !!account?.isReady;
  const connectorName = walletDetails.name || 'wallet';
  const token = tryFindToken(warpCore, origin, originTokenAddressOrDenom);
  const isPermissionlessRoute = hasPermissionlessChain(multiProvider, [destination, origin]);
  const isSent = isTransferSent(status);
  const isFailed = isTransferFailed(status);
  const isFinal = isSent || isFailed;
  const statusDescription = getTransferStatusLabel(
    status,
    connectorName,
    isPermissionlessRoute,
    isAccountReady,
  );
  const showSignWarning = useSignIssueWarning(status);

  const date = useMemo(
    () => (timestamp ? formatTimestamp(timestamp) : formatTimestamp(new Date().getTime())),
    [timestamp],
  );

  const explorerLink = getHypExplorerLink(multiProvider, origin, msgId);

  return (
    <Modal
      isOpen={isOpen}
      close={onClose}
      dialogClassname="hpl-transfer-details-modal"
      panelClassname="max-w-sm overflow-hidden rounded-2xl border border-[rgba(112,100,233,0.20)] bg-dark p-0 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center justify-between border-b border-[rgba(112,100,233,0.18)] bg-darker2 px-6 py-4">
        <div className="flex flex-col">
          <h3 className="font-secondary text-base font-medium tracking-wide text-contentBody">
            Transfer Details
          </h3>
          {isFinal && <span className="mt-0.5 text-xs text-content-gray">{date}</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close transfer details"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(112,100,233,0.18)] bg-dark text-content-gray transition-colors hover:bg-primary-800 hover:text-contentBody"
        >
          <XIcon width={12} height={12} color={Color.gray['300']} />
        </button>
      </div>
      <div className="bg-dark p-6 text-contentBody">
        {isFinal && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center text-xs font-normal">
              {isSent ? (
                <h3 className="text-green-50">Sent</h3>
              ) : (
                <h3 className="text-red-500">Failed</h3>
              )}
              <Image
                src={getIconByTransferStatus(status)}
                width={16}
                height={16}
                alt=""
                className="ml-2"
              />
            </div>
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div className="flex w-full items-center justify-center rounded-xl border border-[rgba(112,100,233,0.20)] bg-dark2 px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <TokenIcon token={token} size={24} />
            <div className="ml-2 flex items-baseline font-secondary text-sm font-normal">
              <span>{amount}</span>
              <span className="ml-1 text-content-gray">{token?.symbol}</span>
            </div>
          </div>

          <div className="flex items-center justify-around rounded-xl border border-[rgba(112,100,233,0.20)] bg-darker2 px-4 py-4 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col items-center">
              <ChainLogo chainName={origin} size={36} />
              <span className="mt-1 text-xs font-normal tracking-wider text-contentBody">
                {getChainDisplayName(multiProvider, origin, true)}
              </span>
            </div>
            <div className="mx-4 flex items-center gap-1 sm:gap-1.5">
              <WideChevron />
              <WideChevron />
            </div>
            <div className="flex flex-col items-center">
              <ChainLogo chainName={destination} size={36} />
              <span className="mt-1 text-xs font-normal tracking-wider text-contentBody">
                {getChainDisplayName(multiProvider, destination, true)}
              </span>
            </div>
          </div>
        </div>

        {isFinal ? (
          <div className="mt-5 flex flex-col space-y-4">
            <TransferProperty name="Sender Address" value={sender} url={fromUrl} />
            <TransferProperty name="Recipient Address" value={recipient} url={toUrl} />
            {/* {token?.addressOrDenom && (
              <TransferProperty name="Token Address or Denom" value={token.addressOrDenom} />
            )} */}
            {originTxHash && (
              <TransferProperty
                name="Origin Transaction Hash"
                value={originTxHash}
                url={originTxUrl}
              />
            )}
            {msgId && <TransferProperty name="Message ID" value={msgId} />}
            {explorerLink && (
              <div className="flex justify-center">
                <span className="text-xxs leading-normal tracking-wider text-primary-500">
                  <a
                    className="text-xs leading-normal tracking-wider text-primary-500 underline-offset-2 hover:opacity-80 active:opacity-70"
                    href={explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View in Explorer
                  </a>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <SpinnerIcon width={60} height={60} color={Color.white} className="mt-3" />
            <div className="mt-5 text-center text-sm text-content-gray">{statusDescription}</div>
            {showSignWarning && (
              <div className="mt-3 text-center text-sm text-content-gray">
                If your wallet does not show a transaction request or never confirms, please try the
                transfer again.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

// TODO consider re-enabling timeline
export function Timeline({
  transferStatus,
  originTxHash,
}: {
  transferStatus: TransferStatus;
  originTxHash?: string;
}) {
  const isFailed = transferStatus === TransferStatus.Failed;
  const multiProtocolProvider = useMultiProvider();
  const { stage, timings, message } = useMessageTimeline({
    originTxHash: isFailed ? undefined : originTxHash,
    multiProvider: multiProtocolProvider.toMultiProvider(),
  });
  const messageStatus = isFailed ? MessageStatus.Failing : message?.status || MessageStatus.Pending;

  return (
    <div className="timeline-container mb-2 mt-6 flex w-full flex-col items-center justify-center">
      <MessageTimeline
        status={messageStatus}
        stage={stage}
        timings={timings}
        timestampSent={message?.origin?.timestamp}
        hideDescriptions={true}
      />
    </div>
  );
}

function TransferProperty({ name, value, url }: { name: string; value: string; url?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs leading-normal tracking-wider text-content-gray">{name}</label>
        <div className="flex items-center space-x-2">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Image src={LinkIcon} width={14} height={14} alt="" className="opacity-70 invert" />
            </a>
          )}
          <CopyButton
            copyValue={value}
            width={14}
            height={14}
            className="opacity-40 invert transition-opacity hover:opacity-100"
          />
        </div>
      </div>
      <div className="mt-1 truncate text-xs leading-normal tracking-wider text-contentBody">
        {value}
      </div>
    </div>
  );
}

function WideChevron() {
  return (
    <WideChevronIcon
      width="16"
      height="100%"
      direction="e"
      color={Color.gray['300']}
      rounded={true}
    />
  );
}

// https://github.com/wagmi-dev/wagmi/discussions/2928
function useSignIssueWarning(status: TransferStatus) {
  const [showWarning, setShowWarning] = useState(false);
  const warningCallback = useCallback(() => {
    if (status === TransferStatus.SigningTransfer || status === TransferStatus.ConfirmingTransfer)
      setShowWarning(true);
  }, [status, setShowWarning]);
  useTimeout(warningCallback, 20_000);
  return showWarning;
}

// TODO cosmos fix double slash problem in ChainMetadataManager
// Occurs when baseUrl has not other path (e.g. for manta explorer)
function fixDoubleSlash(url: string) {
  return url.replace(/([^:]\/)\/+/g, '$1');
}
