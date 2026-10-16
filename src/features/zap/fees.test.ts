import { parseGwei } from 'viem';
import { describe, expect, test } from 'vitest';
import { computeFeeSuggestion } from './fees';

describe('computeFeeSuggestion', () => {
  test('caps at twice the base fee plus the tip', () => {
    const fees = computeFeeSuggestion(parseGwei('0.23'), parseGwei('0.05'));
    expect(fees.maxFeePerGas).toBe(parseGwei('0.51'));
    expect(fees.maxPriorityFeePerGas).toBe(parseGwei('0.05'));
  });

  test('raises a zero or tiny tip to the minimum', () => {
    expect(computeFeeSuggestion(parseGwei('0.06'), 0n).maxPriorityFeePerGas).toBe(
      parseGwei('0.01'),
    );
    expect(computeFeeSuggestion(parseGwei('0.06'), parseGwei('0.002')).maxFeePerGas).toBe(
      parseGwei('0.13'),
    );
  });

  test('would have covered the stuck mainnet zap of 2026-10-15', () => {
    // Base fee at submission 0.2318 gwei; the wallet capped at 0.1516 gwei and the tx waited 7.5 h.
    const fees = computeFeeSuggestion(parseGwei('0.231752891'), parseGwei('0.002440145'));
    expect(fees.maxFeePerGas > parseGwei('0.231752891')).toBe(true);
  });
});
