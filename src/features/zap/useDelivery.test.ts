import { encodeAbiParameters, encodeEventTopics, type Hex, type TransactionReceipt } from 'viem';
import { describe, expect, test } from 'vitest';
import { lcaiZapAbi } from './abi';
import { zapEvent } from './useDelivery';

const ZAP = '0x91961D28700c6524C74C4C660A3EA236550d0b27';
const MESSAGE_ID: Hex = `0x${'9a'.repeat(32)}`;

function receiptWith(logs: TransactionReceipt['logs']): TransactionReceipt {
  return { logs } as unknown as TransactionReceipt;
}

function zappedLog() {
  const topics = encodeEventTopics({
    abi: lcaiZapAbi,
    eventName: 'Zapped',
    args: {
      sender: '0x0000000000000000000000000000000000000001',
      recipient: '0x0000000000000000000000000000000000000002',
    },
  });
  const data = encodeAbiParameters(
    [{ type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'bytes32' }],
    [10n ** 16n, 0n, 25_000n * 10n ** 18n, MESSAGE_ID],
  );
  return { address: ZAP, topics, data } as unknown as TransactionReceipt['logs'][number];
}

describe('zapEvent', () => {
  test('reads the Hyperlane message ID and LCAI amount from the Zapped log', () => {
    const ev = zapEvent(receiptWith([zappedLog()]));
    expect(ev?.messageId).toBe(MESSAGE_ID);
    expect(ev?.lcaiBridged).toBe(25_000n * 10n ** 18n);
  });

  test('undefined when the receipt has no Zapped log (e.g. a cancelled tx)', () => {
    expect(zapEvent(receiptWith([]))).toBeUndefined();
    expect(zapEvent(undefined)).toBeUndefined();
  });
});
