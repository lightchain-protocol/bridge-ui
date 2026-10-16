import { describe, expect, test } from 'vitest';
import { useStore } from './store';
import { TransferContext, TransferStatus } from './transfer/types';

const transfer = (): TransferContext => ({
  status: TransferStatus.Preparing,
  origin: 'sepolia',
  destination: 'lcaitestnet',
  amount: '1',
  sender: '0x0000000000000000000000000000000000000001',
  recipient: '0x0000000000000000000000000000000000000001',
  timestamp: Date.now(),
});

describe('updateTransferStatus', () => {
  test('replaces the entry so holders of the old object see a new reference', () => {
    useStore.getState().resetTransfers();
    useStore.getState().addTransfer(transfer());
    const before = useStore.getState().transfers[0];

    useStore.getState().updateTransferStatus(0, TransferStatus.SigningTransfer, {
      originTxHash: '0xabc',
    });
    const after = useStore.getState().transfers[0];

    expect(after).not.toBe(before);
    expect(after.status).toBe(TransferStatus.SigningTransfer);
    expect(after.originTxHash).toBe('0xabc');
    expect(before.status).toBe(TransferStatus.Preparing);
  });

  test('keeps an existing msgId / originTxHash', () => {
    useStore.getState().resetTransfers();
    useStore.getState().addTransfer({ ...transfer(), originTxHash: '0x1', msgId: '0x2' });
    useStore.getState().updateTransferStatus(0, TransferStatus.Delivered, {
      originTxHash: '0x9',
      msgId: '0x9',
    });
    const t = useStore.getState().transfers[0];
    expect(t.originTxHash).toBe('0x1');
    expect(t.msgId).toBe('0x2');
  });
});
