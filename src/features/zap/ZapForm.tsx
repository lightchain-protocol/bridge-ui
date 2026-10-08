import { useAppKit } from '@reown/appkit/react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { LuArrowDown, LuChevronDown, LuExternalLink, LuPencil } from 'react-icons/lu';
import { formatEther, isAddress, type Address } from 'viem';
import {
  useAccount,
  useBalance,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { ChainLogo } from '../../components/icons/ChainLogo';
import { TextInput } from '../../components/input/TextField';
import {
  LCAI_ZAP_ADDRESS,
  ZAP,
  ZAP_CHAIN_ID,
  ZAP_DEADLINE_SECONDS,
  ZAP_SLIPPAGE_BPS,
  ZAP_SOFT_CAP_ETH,
} from '../../consts/zap';
import { fetchPrices } from '../tokens/useTokenPrice';
import { lcaiZapAbi } from './abi';
import { useZapQuote } from './useZapQuote';

const MAX_GAS_RESERVE_WEI = 5_000_000_000_000_000n; // 0.005 ETH kept back for the tx itself

function fmt(value: bigint, maxFraction = 4): string {
  return Number(formatEther(value)).toLocaleString('en-US', { maximumFractionDigits: maxFraction });
}

function fmtUsd(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
}

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function ZapForm() {
  const { open } = useAppKit();
  const { address, chainId, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: balance } = useBalance({ address, chainId: ZAP_CHAIN_ID });
  const { data: prices } = useQuery({
    queryKey: ['zapEthPrice'],
    queryFn: () => fetchPrices(['ethereum']),
    staleTime: 300_000,
  });
  const ethUsd = prices?.ethereum;

  const [ethInput, setEthInput] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [editingRecipient, setEditingRecipient] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const quote = useZapQuote(ethInput);

  const recipient: Address | undefined = customRecipient
    ? isAddress(customRecipient)
      ? customRecipient
      : undefined
    : address;

  const {
    writeContract,
    data: txHash,
    isPending: isSending,
    error: sendError,
    reset,
  } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: txHash, chainId: ZAP_CHAIN_ID });

  const isWrongChain = isConnected && chainId !== ZAP_CHAIN_ID;
  const isDeployed = !!LCAI_ZAP_ADDRESS;
  const ethNumber = Number(ethInput) || 0;
  const exceedsBalance = !!balance && !!quote.data && quote.data.ethIn > balance.value;
  const aboveSoftCap = ethNumber > ZAP_SOFT_CAP_ETH;
  const ethInUsd = ethUsd && ethNumber > 0 ? fmtUsd(ethNumber * ethUsd) : null;
  const lcaiUsdValue =
    quote.data && ethUsd ? Number(formatEther(quote.data.ethSwapped)) * ethUsd : null;
  const rate =
    quote.data && quote.data.ethSwapped > 0n
      ? Number(formatEther(quote.data.lcaiOut)) / Number(formatEther(quote.data.ethSwapped))
      : null;

  const onMax = () => {
    if (!balance) return;
    const max = balance.value > MAX_GAS_RESERVE_WEI ? balance.value - MAX_GAS_RESERVE_WEI : 0n;
    setEthInput(formatEther(max));
  };

  const onSubmit = () => {
    if (!isDeployed || !quote.data || !recipient) return;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + ZAP_DEADLINE_SECONDS);
    writeContract({
      address: LCAI_ZAP_ADDRESS as Address,
      abi: lcaiZapAbi,
      functionName: 'zapToLightchain',
      args: [quote.data.minLcaiOut, recipient, deadline],
      value: quote.data.ethIn,
      chainId: ZAP_CHAIN_ID,
    });
  };

  const button = useMemo(() => {
    if (!isConnected) return { label: 'Connect Wallet', onClick: () => open(), disabled: false };
    if (isWrongChain)
      return {
        label: isSwitching ? 'Switching…' : 'Switch to Ethereum',
        onClick: () => switchChain({ chainId: ZAP_CHAIN_ID }),
        disabled: isSwitching,
      };
    if (!isDeployed) return { label: 'Coming soon', onClick: () => undefined, disabled: true };
    if (!ethInput) return { label: 'Enter an amount', onClick: () => undefined, disabled: true };
    if (quote.isError)
      return { label: quote.error.message, onClick: () => undefined, disabled: true };
    if (!quote.data) return { label: 'Fetching quote…', onClick: () => undefined, disabled: true };
    if (exceedsBalance)
      return { label: 'Insufficient ETH', onClick: () => undefined, disabled: true };
    if (!recipient)
      return { label: 'Enter a valid recipient', onClick: () => undefined, disabled: true };
    if (isSending) return { label: 'Confirm in wallet…', onClick: () => undefined, disabled: true };
    if (receipt.isLoading) return { label: 'Bridging…', onClick: () => undefined, disabled: true };
    return { label: 'Buy & Bridge', onClick: onSubmit, disabled: false };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConnected,
    isWrongChain,
    isSwitching,
    isDeployed,
    ethInput,
    quote.isError,
    quote.data,
    exceedsBalance,
    recipient,
    isSending,
    receipt.isLoading,
  ]);

  if (receipt.isSuccess && txHash) {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent-500/15 ring-1 ring-accent-500/40">
          <LuArrowDown className="size-7 text-accent-300" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-contentBody">Bridge started</h2>
          <p className="mt-1 text-sm text-content-gray">
            Your LCAI arrives on Lightchain in a few minutes.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <ExternalLinkButton href={ZAP.explorerTxUrl(txHash)}>
            Etherscan
          </ExternalLinkButton>
          {recipient && (
            <ExternalLinkButton href={ZAP.destinationAddressUrl(recipient)}>
              Lightscan
            </ExternalLinkButton>
          )}
        </div>
        <PrimaryButton
          onClick={() => {
            reset();
            setEthInput('');
          }}
        >
          Bridge more
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative flex flex-col gap-1.5">
        {/* Pay */}
        <AmountPanel label="You pay">
          <div className="flex items-center gap-3">
            <TextInput
              value={ethInput}
              onChange={setEthInput}
              placeholder="0"
              inputMode="decimal"
              className="min-w-0 flex-1 border-none bg-transparent p-0 font-secondary text-3xl font-medium tracking-tight text-contentBody outline-none placeholder:text-content-gray/60 sm:text-4xl"
            />
            <TokenChip chainName={ZAP.sourceChainName} symbol="ETH" network={ZAP.sourceLabel} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-content-gray">
            <span>{ethInUsd ?? ' '}</span>
            <span className="flex items-center gap-2">
              Balance {balance ? fmt(balance.value) : '0'}
              <button
                type="button"
                onClick={onMax}
                disabled={!balance}
                className="rounded-full bg-accent-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-300 transition-colors hover:bg-accent-500/25 disabled:opacity-40"
              >
                Max
              </button>
            </span>
          </div>
        </AmountPanel>

        {/* Direction */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="flex size-10 items-center justify-center rounded-xl border-4 border-dark bg-dark2 text-contentBody shadow-lg">
            <LuArrowDown className="size-4" />
          </div>
        </div>

        {/* Receive */}
        <AmountPanel label="You receive">
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                'min-w-0 flex-1 truncate font-secondary text-3xl font-medium tracking-tight sm:text-4xl',
                quote.data ? 'text-contentBody' : 'text-content-gray/60',
                quote.isFetching && !quote.data && 'animate-pulse',
              )}
            >
              {quote.data ? fmt(quote.data.lcaiOut, 2) : '0'}
            </span>
            <TokenChip
              chainName={ZAP.destinationChainName}
              symbol="LCAI"
              network={ZAP.destinationLabel}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-content-gray">
            <span>{lcaiUsdValue ? `≈ ${fmtUsd(lcaiUsdValue)}` : ' '}</span>
            <span className="flex items-center gap-1.5">
              To {recipient ? short(recipient) : customRecipient ? 'invalid address' : '—'}
              <button
                type="button"
                onClick={() => setEditingRecipient((v) => !v)}
                className="rounded p-0.5 text-content-gray transition-colors hover:text-contentBody"
                title="Change recipient"
              >
                <LuPencil className="size-3" />
              </button>
            </span>
          </div>
          {editingRecipient && (
            <TextInput
              value={customRecipient}
              onChange={setCustomRecipient}
              placeholder="Lightchain address (0x…), leave empty to use your wallet"
              className="mt-3 w-full rounded-lg border-[rgba(112,100,233,0.3)] bg-dark px-3 py-2 text-sm text-contentBody placeholder:text-content-gray/60"
            />
          )}
        </AmountPanel>
      </div>

      {/* Quote details */}
      <div className="rounded-xl border border-[rgba(112,100,233,0.16)] bg-[rgba(204,206,239,0.02)]">
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs text-content-gray"
        >
          <span>
            {rate
              ? `1 ETH ≈ ${rate.toLocaleString('en-US', { maximumFractionDigits: 0 })} LCAI`
              : 'Swap on Uniswap, bridge via Hyperlane. One transaction.'}
          </span>
          <LuChevronDown
            className={clsx('size-4 transition-transform', detailsOpen && 'rotate-180')}
          />
        </button>
        {detailsOpen && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-[rgba(112,100,233,0.12)] px-4 py-3 text-xs">
            <Row k="Bridge fee" v={quote.data ? `${fmt(quote.data.gasPayment, 5)} ETH` : '—'} />
            <Row k="Swap fee" v="0.3% (Uniswap pool)" />
            <Row k="Max slippage" v={`${ZAP_SLIPPAGE_BPS / 100}%`} />
            <Row k="Min. received" v={quote.data ? `${fmt(quote.data.minLcaiOut, 2)} LCAI` : '—'} />
            <Row k="Est. time" v="2–5 min" />
          </dl>
        )}
      </div>

      {aboveSoftCap && (
        <Notice tone="warn">
          Above {ZAP_SOFT_CAP_ETH} ETH the LCAI pool gets thin and price impact climbs fast.
          Consider splitting into smaller transactions.
        </Notice>
      )}
      {sendError && <Notice tone="error">{sendError.message.split('\n')[0]}</Notice>}

      <PrimaryButton onClick={button.onClick} disabled={button.disabled}>
        {button.label}
      </PrimaryButton>
    </div>
  );
}

function AmountPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[rgba(112,100,233,0.16)] bg-darker2/80 p-4 transition-colors focus-within:border-[rgba(112,100,233,0.45)] sm:p-5">
      <div className="mb-2 text-xs font-medium text-content-gray">{label}</div>
      {children}
    </div>
  );
}

function TokenChip({
  chainName,
  symbol,
  network,
}: {
  chainName: string;
  symbol: string;
  network: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-[rgba(112,100,233,0.24)] bg-dark2 py-1.5 pl-1.5 pr-4">
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dark [&_img]:size-full [&_svg]:size-full">
        <ChainLogo chainName={chainName} size={28} />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-contentBody">{symbol}</div>
        <div className="text-[11px] text-content-gray">{network}</div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-content-gray">{k}</dt>
      <dd className="text-right text-contentBody">{v}</dd>
    </>
  );
}

function Notice({ tone, children }: { tone: 'warn' | 'error'; children: React.ReactNode }) {
  return (
    <div
      className={clsx(
        'rounded-xl border px-4 py-2.5 text-xs',
        tone === 'warn' && 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
        tone === 'error' && 'border-red-500/30 bg-red-500/10 text-red-200',
      )}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="hpl-btn-gd flex w-full items-center justify-center rounded-xl px-4 py-4 font-secondary text-base font-semibold text-white shadow-[0_8px_30px_rgba(221,0,172,0.25)] transition-all before:inset-0 after:inset-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

function ExternalLinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 rounded-full border border-[rgba(112,100,233,0.24)] bg-dark2 px-4 py-2 text-contentBody transition-colors hover:border-[rgba(112,100,233,0.5)]"
    >
      {children}
      <LuExternalLink className="size-3.5" />
    </a>
  );
}
