import { useQuery } from '@tanstack/react-query';
import { formatEther, parseEther } from 'viem';
import { usePublicClient } from 'wagmi';
import {
  LCAI_COLLATERAL_ROUTER,
  LCAI_POOL_FEE,
  LCAI_TOKEN,
  LIGHTCHAIN_DOMAIN,
  UNISWAP_QUOTER_V2,
  WETH,
  ZAP_CHAIN_ID,
  ZAP_SLIPPAGE_BPS,
} from '../../consts/zap';
import { hypCollateralAbi, quoterV2Abi } from './abi';

export interface ZapQuote {
  ethIn: bigint; // total value the user sends
  gasPayment: bigint; // Hyperlane interchain gas, taken off the top
  ethSwapped: bigint; // ethIn - gasPayment
  lcaiOut: bigint; // quoted LCAI from the swap
  minLcaiOut: bigint; // lcaiOut after slippage
  spotLcaiPerEth: number; // pool price from a tiny reference swap (fee included)
  priceImpactBps: number; // how much worse this swap's rate is than spot
}

// Small enough to barely move the pool, so its rate stands in for the spot price.
const SPOT_REFERENCE_WEI = parseEther('0.0001');

function parseEthInput(value: string): bigint | null {
  if (!value || Number.isNaN(Number(value)) || Number(value) <= 0) return null;
  try {
    return parseEther(value);
  } catch {
    return null;
  }
}

export function useZapQuote(ethInput: string) {
  const client = usePublicClient({ chainId: ZAP_CHAIN_ID });
  const ethIn = parseEthInput(ethInput);

  return useQuery({
    // bigint cannot be serialized into the key; uid and the decimal string are stable stand-ins
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['zapQuote', client?.uid, ethIn?.toString()],
    enabled: !!client && ethIn !== null,
    refetchInterval: 15_000,
    queryFn: async (): Promise<ZapQuote> => {
      if (!client || ethIn === null) throw new Error('Zap quote called without input');

      const gasPayment = await client.readContract({
        address: LCAI_COLLATERAL_ROUTER,
        abi: hypCollateralAbi,
        functionName: 'quoteGasPayment',
        args: [LIGHTCHAIN_DOMAIN],
      });
      if (ethIn <= gasPayment) throw new Error('Amount does not cover the bridge gas fee');
      const ethSwapped = ethIn - gasPayment;

      // QuoterV2 is non-view (reverts internally), so simulate rather than read.
      const quoteOut = async (amountIn: bigint) => {
        const { result } = await client.simulateContract({
          address: UNISWAP_QUOTER_V2,
          abi: quoterV2Abi,
          functionName: 'quoteExactInputSingle',
          args: [
            {
              tokenIn: WETH,
              tokenOut: LCAI_TOKEN,
              amountIn,
              fee: LCAI_POOL_FEE,
              sqrtPriceLimitX96: 0n,
            },
          ],
        });
        return result[0];
      };
      const [lcaiOut, spotOut] = await Promise.all([
        quoteOut(ethSwapped),
        quoteOut(SPOT_REFERENCE_WEI),
      ]);
      if (lcaiOut === 0n || spotOut === 0n) throw new Error('Not enough pool liquidity');
      const minLcaiOut = (lcaiOut * BigInt(10_000 - ZAP_SLIPPAGE_BPS)) / 10_000n;

      const spotLcaiPerEth = Number(formatEther(spotOut)) / Number(formatEther(SPOT_REFERENCE_WEI));
      const rate = Number(formatEther(lcaiOut)) / Number(formatEther(ethSwapped));
      const priceImpactBps = Math.max(0, Math.round((1 - rate / spotLcaiPerEth) * 10_000));

      return {
        ethIn,
        gasPayment,
        ethSwapped,
        lcaiOut,
        minLcaiOut,
        spotLcaiPerEth,
        priceImpactBps,
      };
    },
  });
}
