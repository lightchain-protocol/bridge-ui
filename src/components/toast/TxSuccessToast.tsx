import { LuExternalLink } from 'react-icons/lu';
import { toast } from 'react-toastify';
import { useMultiProvider } from '../../features/chains/hooks';

export function toastTxSuccess(msg: string, txHash: string, chain: ChainName) {
  toast.success(<TxSuccessToast msg={msg} txHash={txHash} chain={chain} />, {
    autoClose: 12000,
  });
}

export function TxSuccessToast({
  msg,
  txHash,
  chain,
}: {
  msg: string;
  txHash: string;
  chain: ChainName;
}) {
  const multiProvider = useMultiProvider();
  const url = multiProvider.tryGetExplorerTxUrl(chain, { hash: txHash });

  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold text-contentBody">{msg}</span>
      {url && (
        <a
          className="inline-flex w-fit items-center gap-1 text-xs font-medium text-accent-300 transition-colors hover:text-accent-200"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on explorer
          <LuExternalLink className="size-3" />
        </a>
      )}
    </div>
  );
}
