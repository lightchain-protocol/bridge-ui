import type { PublicClient } from 'viem';
import { logger } from '../../utils/logger';

// Browser wallets pick their own fee when the dApp sends none, and some pick a stale "low" one.
// With base fees near 0.1 gwei, a small spike doubles the base fee and such a transaction can sit
// in the mempool for hours until the zap's deadline has passed (seen on mainnet 2026-10-15).
// Suggest a cap of 2x the current base fee: it survives a few full blocks of base-fee growth,
// and the user still only pays the actual base fee plus the tip.
const BASE_FEE_MULTIPLIER = 2n;

export interface FeeSuggestion {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

export function computeFeeSuggestion(baseFee: bigint, priorityFee: bigint): FeeSuggestion {
  return {
    maxFeePerGas: baseFee * BASE_FEE_MULTIPLIER + priorityFee,
    maxPriorityFeePerGas: priorityFee,
  };
}

/**
 * Fee fields to pass to the wallet, or undefined to let the wallet decide if the RPC is
 * unreachable (the wallet's own estimate is still better than blocking the transaction).
 */
export async function suggestFees(client: PublicClient): Promise<FeeSuggestion | undefined> {
  try {
    const [block, priorityFee] = await Promise.all([
      client.getBlock({ blockTag: 'latest' }),
      client.estimateMaxPriorityFeePerGas(),
    ]);
    if (block.baseFeePerGas === null) return undefined;
    return computeFeeSuggestion(block.baseFeePerGas, priorityFee);
  } catch (error) {
    logger.warn('Could not fetch fee data; leaving gas price to the wallet', error);
    return undefined;
  }
}
