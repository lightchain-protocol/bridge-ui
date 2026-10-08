export const quoterV2Abi = [
  {
    type: 'function',
    name: 'quoteExactInputSingle',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'fee', type: 'uint24' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
      },
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' },
    ],
  },
] as const;

export const hypCollateralAbi = [
  {
    type: 'function',
    name: 'quoteGasPayment',
    stateMutability: 'view',
    inputs: [{ name: 'destinationDomain', type: 'uint32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export const lcaiZapAbi = [
  {
    type: 'function',
    name: 'zapToLightchain',
    stateMutability: 'payable',
    inputs: [
      { name: 'minLcaiOut', type: 'uint256' },
      { name: 'recipient', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [
      { name: 'messageId', type: 'bytes32' },
      { name: 'lcaiAmount', type: 'uint256' },
    ],
  },
] as const;
