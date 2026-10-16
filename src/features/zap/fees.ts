import { parseGwei, type PublicClient } from 'viem';
import { logger } from '../../utils/logger';

// Browser wallets pick their own fee when the dApp sends none, and some pick a stale "low" one.
// With base fees near 0.1 gwei, a small spike doubles the base fee and such a transaction can sit
// in the mempool for hours until the zap's deadline has passed (seen on mainnet 2026-10-15).
// Suggest a cap of 2x the current base fee, and at least 1 gwei above it: at ~0.06 gwei base
// fees, 2x alone is only ~0.06 gwei of headroom, which one short spike can outrun. The user
// still only pays the actual base fee plus the tip; the cap is a ceiling.
const BASE_FEE_MULTIPLIER = 2n;
const MIN_HEADROOM = parseGwei('1');
// RPCs can estimate a 0 tip when blocks are not full, and builders may skip zero-tip
// transactions. 0.01 gwei is ~$0.01 on a 300k-gas zap and enough to be picked up.
const MIN_PRIORITY_FEE = parseGwei('0.01');

export interface FeeSuggestion {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

export function computeFeeSuggestion(baseFee: bigint, estimatedTip: bigint): FeeSuggestion {
  const tip = estimatedTip > MIN_PRIORITY_FEE ? estimatedTip : MIN_PRIORITY_FEE;
  const doubled = baseFee * BASE_FEE_MULTIPLIER;
  const padded = baseFee + MIN_HEADROOM;
  return {
    maxFeePerGas: (doubled > padded ? doubled : padded) + tip,
    maxPriorityFeePerGas: tip,
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
