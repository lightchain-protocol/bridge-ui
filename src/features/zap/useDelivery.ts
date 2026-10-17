import { useQuery } from '@tanstack/react-query';
import { parseAbi, parseEventLogs, type Address, type Hex, type TransactionReceipt } from 'viem';
import { usePublicClient } from 'wagmi';
import { ZAP } from '../../consts/zap';
import { lcaiZapAbi } from './abi';

const mailboxAbi = parseAbi([
  'function delivered(bytes32 messageId) view returns (bool)',
  'event ProcessId(bytes32 indexed messageId)',
]);

// The Hyperlane message for a zap is usually delivered in 1-3 minutes.
const POLL_MS = 5_000;
// How far back to search Lightchain for the delivery tx once `delivered` flips (~1 day of blocks).
const LOOKBACK_BLOCKS = 20_000n;

export interface ZappedEvent {
  messageId: Hex;
  lcaiBridged: bigint;
}

/** The zap's `Zapped` event (message ID, LCAI bridged), if the receipt has one. */
export function zapEvent(receipt: TransactionReceipt | undefined): ZappedEvent | undefined {
  if (!receipt) return undefined;
  const [zapped] = parseEventLogs({ abi: lcaiZapAbi, eventName: 'Zapped', logs: receipt.logs });
  // viem's generic inference collapses against the receipt's Log type; the event shape is fixed.
  return (zapped as unknown as { args: ZappedEvent } | undefined)?.args;
}

export interface Delivery {
  delivered: boolean;
  deliveryTxHash?: Hex;
}

export interface DeliveryTarget {
  chainId: number; // EVM chain id of the destination
  mailbox: Address; // Hyperlane Mailbox on the destination
}

const ZAP_TARGET: DeliveryTarget = {
  chainId: ZAP.destinationChainId,
  mailbox: ZAP.destinationMailbox,
};

/**
 * Watches the destination mailbox until a Hyperlane message is processed, then looks up the
 * delivery transaction for the explorer link. Exact: keyed by message ID, not by amount.
 * Defaults to the zap's destination (Lightchain); the Bridge tab passes either direction.
 */
export function useDelivery(messageId: Hex | undefined, target: DeliveryTarget = ZAP_TARGET) {
  const { chainId, mailbox } = target;
  const client = usePublicClient({ chainId });
  return useQuery({
    // The client is not serializable; its uid is a stable stand-in (same as useZapQuote).
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['delivery', client?.uid, mailbox, messageId],
    enabled: !!client && !!messageId,
    refetchInterval: (query) => (query.state.data?.delivered ? false : POLL_MS),
    queryFn: async (): Promise<Delivery> => {
      if (!client || !messageId) throw new Error('useDelivery called without a message');
      const delivered = await client.readContract({
        address: mailbox,
        abi: mailboxAbi,
        functionName: 'delivered',
        args: [messageId],
      });
      if (!delivered) return { delivered: false };
      try {
        const latest = await client.getBlockNumber();
        const [log] = await client.getLogs({
          address: mailbox,
          event: mailboxAbi[1],
          args: { messageId },
          fromBlock: latest > LOOKBACK_BLOCKS ? latest - LOOKBACK_BLOCKS : 0n,
          toBlock: latest,
        });
        return { delivered: true, deliveryTxHash: log?.transactionHash ?? undefined };
      } catch {
        // Delivered either way; the link just falls back to the recipient's address page.
        return { delivered: true };
      }
    },
  });
}
