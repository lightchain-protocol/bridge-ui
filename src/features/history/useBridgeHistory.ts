import { useQuery } from '@tanstack/react-query';
import { formatEther, padHex, toEventSelector, type Address, type Hex } from 'viem';
import { ZAP } from '../../consts/zap';
import { logger } from '../../utils/logger';
import { TransferContext, TransferStatus } from '../transfer/types';

/**
 * Rebuilds a wallet's LCAI bridge history straight from the Hyperlane warp-route events,
 * using Etherscan-compatible log APIs (Etherscan for Ethereum/Sepolia, Lightscan for Lightchain).
 * Hyperlane's hosted explorer does not index Lightchain, so this is the only cross-device source.
 *
 * Covers transfers where the connected wallet is the recipient (the default for Buy & Bridge and
 * for self-bridges). Sends to a different recipient are still shown from local history.
 */

const SENT_TOPIC = toEventSelector('SentTransferRemote(uint32,bytes32,uint256)');
const RECEIVED_TOPIC = toEventSelector('ReceivedTransferRemote(uint32,bytes32,uint256)');
const MAX_ITEMS = 50;

interface RawLog {
  transactionHash: Hex;
  timeStamp: Hex;
  data: Hex;
  topics: Hex[];
}

interface RouterEvent {
  txHash: Hex;
  timestamp: number; // seconds
  amountWei: bigint;
}

async function fetchLogs(api: string, router: Address, topic0: Hex, recipientTopic: Hex): Promise<RouterEvent[]> {
  const sep = api.includes('?') ? '&' : '?';
  const url = `${api}${sep}module=logs&action=getLogs&address=${router}&topic0=${topic0}&topic0_2_opr=and&topic2=${recipientTopic}&fromBlock=0&toBlock=latest`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`logs api ${res.status}`);
  const json = (await res.json()) as { status: string; message: string; result: RawLog[] | string };
  // Etherscan returns status "0" / "No records found" for an empty set; that's not an error.
  if (!Array.isArray(json.result)) {
    if (/no records/i.test(json.message)) return [];
    throw new Error(`logs api: ${json.message} ${json.result}`);
  }
  return json.result.map((l) => ({
    txHash: l.transactionHash,
    timestamp: Number(BigInt(l.timeStamp)),
    amountWei: BigInt(l.data),
  }));
}

function pairUp(
  sent: RouterEvent[],
  received: RouterEvent[],
  origin: string,
  destination: string,
  wallet: Address,
): TransferContext[] {
  // Oldest first so the n-th send of a given amount pairs with the n-th matching receipt.
  const sentSorted = [...sent].sort((a, b) => a.timestamp - b.timestamp);
  const pool = [...received].sort((a, b) => a.timestamp - b.timestamp);
  return sentSorted.map((s) => {
    const idx = pool.findIndex((r) => r.amountWei === s.amountWei && r.timestamp >= s.timestamp - 60);
    const match = idx >= 0 ? pool.splice(idx, 1)[0] : undefined;
    return {
      status: match ? TransferStatus.Delivered : TransferStatus.ConfirmedTransfer,
      origin,
      destination,
      amount: formatEther(s.amountWei),
      sender: wallet,
      recipient: wallet,
      originTxHash: s.txHash,
      destinationTxHash: match?.txHash,
      timestamp: s.timestamp * 1000,
    };
  });
}

export function useBridgeHistory(wallet: Address | undefined) {
  return useQuery({
    queryKey: ['bridgeHistory', ZAP.chainId, wallet],
    enabled: !!wallet,
    refetchInterval: 30_000,
    staleTime: 20_000,
    queryFn: async (): Promise<TransferContext[]> => {
      if (!wallet) return [];
      const me = padHex(wallet.toLowerCase() as Hex, { size: 32 });
      const [toLcSent, toLcRecv, fromLcSent, fromLcRecv] = await Promise.all([
        fetchLogs(ZAP.sourceLogsApi, ZAP.collateralRouter, SENT_TOPIC, me),
        fetchLogs(ZAP.destinationLogsApi, ZAP.nativeRouter, RECEIVED_TOPIC, me),
        fetchLogs(ZAP.destinationLogsApi, ZAP.nativeRouter, SENT_TOPIC, me),
        fetchLogs(ZAP.sourceLogsApi, ZAP.collateralRouter, RECEIVED_TOPIC, me),
      ]).catch((err) => {
        logger.warn('Bridge history fetch failed', err);
        throw err;
      });
      const items = [
        ...pairUp(toLcSent, toLcRecv, ZAP.sourceChainName, ZAP.destinationChainName, wallet),
        ...pairUp(fromLcSent, fromLcRecv, ZAP.destinationChainName, ZAP.sourceChainName, wallet),
      ];
      return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_ITEMS);
    },
  });
}

/** Local (this browser) + on-chain history, de-duplicated by origin tx hash. On-chain wins. */
export function mergeHistory(local: TransferContext[], onchain: TransferContext[]): TransferContext[] {
  const seen = new Set(onchain.map((t) => t.originTxHash?.toLowerCase()).filter(Boolean));
  const extra = local.filter((t) => !t.originTxHash || !seen.has(t.originTxHash.toLowerCase()));
  return [...onchain, ...extra].sort((a, b) => b.timestamp - a.timestamp);
}
