import { Token, TokenAmount, WarpCore } from '@hyperlane-xyz/sdk';
import { LuArrowLeftRight } from "react-icons/lu";
import {
  KnownProtocolType,
  ProtocolType,
  convertToScaledAmount,
  eqAddress,
  errorToString,
  fromWei,
  isNullish,
  isValidAddressEvm,
  normalizeAddress,
  toWei,
} from '@hyperlane-xyz/utils';
import {
  AccountInfo,
  ChevronIcon,
  SpinnerIcon,
  getAccountAddressAndPubKey,
  useAccountAddressForChain,
  useAccounts,
  useModal,
} from '@hyperlane-xyz/widgets';
import BigNumber from 'bignumber.js';
import { Form, Formik, useFormikContext } from 'formik';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { RecipientWarningBanner } from '../../components/banner/RecipientWarningBanner';
import { ConnectAwareSubmitButton } from '../../components/buttons/ConnectAwareSubmitButton';
import { SolidButton } from '../../components/buttons/SolidButton';
import { TextField } from '../../components/input/TextField';
import { WARP_QUERY_PARAMS } from '../../consts/args';
import { config } from '../../consts/config';
import { defaultMultiCollateralRoutes } from '../../consts/defaultMultiCollateralRoutes';
import { Color } from '../../styles/Color';
import { logger } from '../../utils/logger';
import { updateQueryParams } from '../../utils/queryParams';
import { trackTransactionFailedEvent } from '../analytics/utils';
import { UsdLabel } from '../balances/UsdLabel';
import {
  getDestinationNativeBalance,
  useDestinationBalance,
  useOriginBalance,
} from '../balances/hooks';
import { useFeePrices } from '../balances/useFeePrices';
import { ChainConnectionWarning } from '../chains/ChainConnectionWarning';
import { ChainWalletWarning } from '../chains/ChainWalletWarning';
import { useChainDisplayName, useMultiProvider } from '../chains/hooks';
import { isMultiCollateralLimitExceeded } from '../limits/utils';
import { useIsAccountSanctioned } from '../sanctions/hooks/useIsAccountSanctioned';
import { RouterAddressInfo, useStore } from '../store';
import { ImportTokenButton } from '../tokens/ImportTokenButton';
import { TokenSelectField } from '../tokens/TokenSelectField';
import { useIsApproveRequired } from '../tokens/approval';
import {
  getInitialTokenKeys,
  getTokenByKeyFromMap,
  useCollateralGroups,
  useTokenByKeyMap,
  useTokens,
  useWarpCore,
} from '../tokens/hooks';
import { useTokenPrices } from '../tokens/useTokenPrice';
import { checkTokenHasRoute, findRouteToken } from '../tokens/utils';
import { WalletConnectionWarning } from '../wallet/WalletConnectionWarning';
import { WalletDropdown } from '../wallet/WalletDropdown';
import { FeeSectionButton } from './FeeSectionButton';
import { RecipientConfirmationModal } from './RecipientConfirmationModal';
import { TransferSection } from './TransferSection';
import { getInterchainQuote, getTotalFee, getTransferToken } from './fees';
import { useFetchMaxAmount } from './maxAmount';
import { TransferFormValues } from './types';
import { useRecipientBalanceWatcher } from './useBalanceWatcher';
import { useFeeQuotes } from './useFeeQuotes';
import { useTokenTransfer } from './useTokenTransfer';
import { isSmartContract, shouldClearAddress } from './utils';

export function TransferTokenForm() {
  const multiProvider = useMultiProvider();
  const warpCore = useWarpCore();
  const tokenMap = useTokenByKeyMap();
  const collateralGroups = useCollateralGroups();

  const { setOriginChainName, routerAddressesByChainMap } = useStore((s) => ({
    setOriginChainName: s.setOriginChainName,
    routerAddressesByChainMap: s.routerAddressesByChainMap,
  }));

  const initialValues = useFormInitialValues();
  const { accounts } = useAccounts(multiProvider, config.addressBlacklist);

  // Flag for if form is in input vs review mode
  const [isReview, setIsReview] = useState(false);
  // Flag for check current type of token (setter used by TokenSelectField)
  const [, setIsNft] = useState(false);
  // This state is used for when the formik token is different from
  // the token with highest collateral in a multi-collateral token setup
  const [routeOverrideToken, setRouteTokenOverride] = useState<Token | null>(null);
  // Modal for confirming address
  const {
    open: openConfirmationModal,
    close: closeConfirmationModal,
    isOpen: isConfirmationModalOpen,
  } = useModal();

  const validate = async (values: TransferFormValues) => {
    const [result, overrideToken] = await validateForm(
      warpCore,
      tokenMap,
      collateralGroups,
      values,
      accounts,
      routerAddressesByChainMap,
    );

    trackTransactionFailedEvent(result, warpCore, values, accounts, overrideToken);

    // Unless this is done, the review and the transfer would contain
    // the selected token rather than collateral with highest balance
    setRouteTokenOverride(overrideToken);
    return result;
  };

  const onSubmitForm = async (values: TransferFormValues) => {
    const originToken = getTokenByKeyFromMap(tokenMap, values.originTokenKey);
    const destinationToken = getTokenByKeyFromMap(tokenMap, values.destinationTokenKey);
    if (!originToken || !destinationToken) return;

    // Get recipient (form value or fallback to connected wallet)
    const { address: connectedDestAddress } = getAccountAddressAndPubKey(
      multiProvider,
      destinationToken.chainName,
      accounts,
    );
    const recipient = values.recipient || connectedDestAddress || '';
    if (!recipient) return;

    logger.debug('Checking destination native balance for:', destinationToken.chainName, recipient);
    const balance = await getDestinationNativeBalance(multiProvider, {
      destination: destinationToken.chainName,
      recipient,
    });
    if (isNullish(balance)) return;
    else if (balance > 0n) {
      logger.debug('Reviewing transfer form values');
      setIsReview(true);
    } else {
      logger.debug('Recipient has no balance on destination. Confirming address.');
      openConfirmationModal();
    }
  };

  // Update origin chain name in store when origin token changes
  useEffect(() => {
    const originToken = getTokenByKeyFromMap(tokenMap, initialValues.originTokenKey);
    if (originToken) {
      setOriginChainName(originToken.chainName);
    }
  }, [initialValues.originTokenKey, tokenMap, setOriginChainName]);

  return (
    <Formik<TransferFormValues>
      initialValues={initialValues}
      onSubmit={onSubmitForm}
      validate={validate}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ isValidating }) => (
        <Form className="flex w-full flex-col items-stretch gap-2.5">
          <WarningBanners />
            <div className="grid grid-cols-2 gap-[33px] relative">
              <TokenSelectField
                name="originTokenKey"
                selectionMode="origin"
                disabled={isReview}
                setIsNft={setIsNft}
                showLabel={false}
                className='sm:pr-8 pr-2'
              />
              <SwapTokensButton disabled={isReview} />
              <TokenSelectField
                name="destinationTokenKey"
                selectionMode="destination"
                disabled={isReview}
                showLabel={false}
                className='flex-row-reverse sm:pl-8 pl-2'
                childClass="flex-row-reverse"
              />
            </div>
            <div className="p-2.5 rounded-xl border border-[rgba(112,100,233,0.20)] bg-[rgba(204,206,239,0.02)] mt-4">
              <TransferSection>
                <OriginTokenCard isReview={isReview} setIsNft={setIsNft} />
                <DestinationTokenCard isReview={isReview} />
              </TransferSection>
            </div>

          <ReviewDetails isReview={isReview} routeOverrideToken={routeOverrideToken} />
          <ButtonSection
            isReview={isReview}
            isValidating={isValidating}
            setIsReview={setIsReview}
            cleanOverrideToken={() => setRouteTokenOverride(null)}
            routeOverrideToken={routeOverrideToken}
          />
          <RecipientConfirmationModal
            isOpen={isConfirmationModalOpen}
            close={closeConfirmationModal}
            onConfirm={() => setIsReview(true)}
          />
        </Form>
      )}
    </Formik>
  );
}

function SwapTokensButton({ disabled }: { disabled?: boolean }) {
  const { values, setValues } = useFormikContext<TransferFormValues>();
  const tokenMap = useTokenByKeyMap();
  const multiProvider = useMultiProvider();

  const onSwap = useCallback(() => {
    if (disabled) return;

    const { originTokenKey, destinationTokenKey, recipient } = values;
    const originToken = getTokenByKeyFromMap(tokenMap, originTokenKey);
    const destToken = getTokenByKeyFromMap(tokenMap, destinationTokenKey);

    if (!originToken || !destToken) return;

    // After swap, origin becomes the new destination - validate recipient for new destination protocol
    const shouldClearRecipient = shouldClearAddress(
      multiProvider,
      recipient,
      originToken.chainName,
    );

    setValues((prevValues) => ({
      ...prevValues,
      amount: '',
      originTokenKey: destinationTokenKey,
      destinationTokenKey: originTokenKey,
      recipient: shouldClearRecipient ? '' : prevValues.recipient,
    }));

    // Update URL params
    if (originToken && destToken) {
      updateQueryParams({
        [WARP_QUERY_PARAMS.ORIGIN]: destToken.chainName,
        [WARP_QUERY_PARAMS.ORIGIN_TOKEN]: destToken.symbol,
        [WARP_QUERY_PARAMS.DESTINATION]: originToken.chainName,
        [WARP_QUERY_PARAMS.DESTINATION_TOKEN]: originToken.symbol,
      });
    }
  }, [disabled, values, tokenMap, setValues, multiProvider]);

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] sm:border-[6px] border-4 border-dark rounded-md">
      <button
        type="button"
        onClick={onSwap}
        disabled={disabled}
        className="sm:size-[44px] size-8 flex items-center justify-center bg-dark2 hover:bg-darker2"
      >
        <LuArrowLeftRight className='text-[#7064E9]' />
      </button>
    </div>
  );
}

function OriginTokenCard({
  isReview,
  setIsNft,
}: {
  isReview: boolean;
  setIsNft?: (b: boolean) => void;
}) {
  const { values } = useFormikContext<TransferFormValues>();
  const tokenMap = useTokenByKeyMap();
  const collateralGroups = useCollateralGroups();

  const originToken = getTokenByKeyFromMap(tokenMap, values.originTokenKey);
  const destinationToken = getTokenByKeyFromMap(tokenMap, values.destinationTokenKey);
  const { balance } = useOriginBalance(originToken);
  const { prices, isLoading: isPriceLoading } = useTokenPrices();
  const tokenPrice = originToken?.coinGeckoId ? prices[originToken.coinGeckoId] : undefined;

  const isRouteSupported = useMemo(() => {
    if (!originToken || !destinationToken) return true;
    return checkTokenHasRoute(originToken, destinationToken, collateralGroups);
  }, [originToken, destinationToken, collateralGroups]);

  const amount = parseFloat(values.amount);
  const totalTokenPrice = !isNullish(tokenPrice) && !isNaN(amount) ? amount * tokenPrice : 0;
  const shouldShowPrice = totalTokenPrice >= 0.01;

  return (
      <div className="rounded-lg border border-[rgba(112,100,233,0.20)] bg-darker2 p-4">

        <div className="flex items-center justify-between gap-2">
          <TextField
            name="amount"
            placeholder="0.00"
            className="w-full flex-1 border-none bg-transparent font-secondary text-xl font-normal text-contentBody outline-none placeholder:text-content-gray sm:text-2xl"
            type="number"
            step="any"
            disabled={isReview}
          />
          <MaxButton balance={balance} disabled={isReview} isRouteSupported={isRouteSupported} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs leading-[18px] text-content-gray">
          <span>
            {shouldShowPrice && !isPriceLoading ? (
              <>
                $
                {totalTokenPrice.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </>
            ) : (
              '$0.00'
            )}
          </span>
          <TokenBalance label="Balance" balance={balance} />
        </div>
      </div>
  );
}

function DestinationTokenCard({ isReview }: { isReview: boolean }) {
  const { values, setFieldValue } = useFormikContext<TransferFormValues>();
  const tokenMap = useTokenByKeyMap();
  const multiProvider = useMultiProvider();

  const destinationToken = getTokenByKeyFromMap(tokenMap, values.destinationTokenKey);

  const connectedDestAddress = useAccountAddressForChain(
    multiProvider,
    destinationToken?.chainName,
  );
  const recipient = values.recipient || connectedDestAddress;

  const { balance } = useDestinationBalance(recipient, destinationToken);

  useRecipientBalanceWatcher(recipient, balance);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <WalletDropdown
          chainName={destinationToken?.chainName}
          selectionMode="destination"
          recipient={values.recipient}
          onRecipientChange={(addr: string) => setFieldValue('recipient', addr)}
          disabled={isReview}
        />
        <ImportTokenButton token={destinationToken} />
      </div>

      <div className="rounded-lg border border-[rgba(112,100,233,0.20)] bg-darker2 p-4">
        <TokenBalance label="Remote Balance" balance={balance} />
      </div>
    </div>
  );
}

function MaxButton({
  balance,
  disabled,
  isRouteSupported,
}: {
  balance?: TokenAmount;
  disabled?: boolean;
  isRouteSupported: boolean;
}) {
  const { values, setFieldValue } = useFormikContext<TransferFormValues>();
  const { originTokenKey, destinationTokenKey } = values;
  const tokenMap = useTokenByKeyMap();
  const originToken = getTokenByKeyFromMap(tokenMap, originTokenKey);
  const destinationToken = getTokenByKeyFromMap(tokenMap, destinationTokenKey);
  const multiProvider = useMultiProvider();
  const { accounts } = useAccounts(multiProvider);
  const { fetchMaxAmount, isLoading } = useFetchMaxAmount();

  const isDisabled =
    disabled || !isRouteSupported || isLoading || !balance || !originToken || !destinationToken;

  const onClick = async () => {
    if (isDisabled) return;
    const maxAmount = await fetchMaxAmount({
      balance,
      origin: originToken.chainName,
      destination: destinationToken.chainName,
      accounts,
      recipient: values.recipient,
    });
    if (isNullish(maxAmount)) return;
    const decimalsAmount = maxAmount.getDecimalFormattedAmount();
    const roundedAmount = new BigNumber(decimalsAmount).toFixed(4, BigNumber.ROUND_FLOOR);
    setFieldValue('amount', roundedAmount);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="flex h-6 min-w-[52px] items-center justify-center rounded-[30px] bg-[#7064E9] px-3 font-secondary text-xs font-semibold leading-none text-contentBody transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? <SpinnerIcon className="h-4 w-4 text-contentBody" /> : 'Max'}
    </button>
  );
}

function TokenBalance({
  label,
  balance,
}: {
  label: string;
  balance: TokenAmount | null | undefined;
}) {
  return (
    <span className="text-sm font-medium leading-[18px] text-[#7064e9]">
      {balance ? (
        <>
          {label}: {balance.getDecimalFormattedAmount().toFixed(4)} {balance.token.symbol}
        </>
      ) : (
        <>{label}: 0.00</>
      )}
    </span>
  );
}

function ButtonSection({
  isReview,
  isValidating,
  setIsReview,
  cleanOverrideToken,
  routeOverrideToken,
}: {
  isReview: boolean;
  isValidating: boolean;
  setIsReview: (b: boolean) => void;
  cleanOverrideToken: () => void;
  routeOverrideToken: Token | null;
}) {
  const { values } = useFormikContext<TransferFormValues>();
  const multiProvider = useMultiProvider();
  const tokenMap = useTokenByKeyMap();
  const originToken = routeOverrideToken || getTokenByKeyFromMap(tokenMap, values.originTokenKey);
  const destinationToken = getTokenByKeyFromMap(tokenMap, values.destinationTokenKey);
  const chainDisplayName = useChainDisplayName(destinationToken?.chainName || '');
  const isRouteSupported = useIsRouteSupported();

  const { accounts } = useAccounts(multiProvider, config.addressBlacklist);
  const { address: connectedWallet } = getAccountAddressAndPubKey(
    multiProvider,
    originToken?.chainName,
    accounts,
  );

  // Get recipient (form value or fallback to connected wallet for destination)
  const { address: connectedDestAddress } = getAccountAddressAndPubKey(
    multiProvider,
    destinationToken?.chainName,
    accounts,
  );
  const recipient = values.recipient || connectedDestAddress || '';

  // Confirming recipient address
  const [{ addressConfirmed, showWarning }, setRecipientInfos] = useState({
    showWarning: false,
    addressConfirmed: true,
  });

  useEffect(() => {
    let isMounted = true;

    const checkSameEVMRecipient = async (recipient: string) => {
      if (!connectedWallet || !originToken || !destinationToken) {
        setRecipientInfos({ showWarning: false, addressConfirmed: true });
        return;
      }

      const { protocol: destinationProtocol } = multiProvider.getChainMetadata(
        destinationToken.chainName,
      );
      const { protocol: sourceProtocol } = multiProvider.getChainMetadata(originToken.chainName);

      if (
        sourceProtocol !== ProtocolType.Ethereum ||
        destinationProtocol !== ProtocolType.Ethereum
      ) {
        setRecipientInfos({ showWarning: false, addressConfirmed: true });
        return;
      }

      if (!isValidAddressEvm(recipient)) {
        setRecipientInfos({ showWarning: false, addressConfirmed: true });
        return;
      }

      const { isContract: isSenderSmartContract, error: senderCheckError } = await isSmartContract(
        multiProvider,
        originToken.chainName,
        connectedWallet,
      );
      if (!isMounted) return;

      const { isContract: isRecipientSmartContract, error: recipientCheckError } =
        await isSmartContract(multiProvider, destinationToken.chainName, recipient);
      if (!isMounted) return;

      const isSelfRecipient = eqAddress(recipient, connectedWallet);

      if (senderCheckError || recipientCheckError) {
        toast.error(senderCheckError || recipientCheckError);
        setRecipientInfos({ addressConfirmed: true, showWarning: false });
        return;
      }

      if (isSelfRecipient && isSenderSmartContract && !isRecipientSmartContract) {
        const msg = `The recipient address is the same as the connected wallet, but it does not exist as a smart contract on ${chainDisplayName}.`;
        logger.warn(msg);
        setRecipientInfos({ showWarning: true, addressConfirmed: false });
      } else {
        setRecipientInfos({ showWarning: false, addressConfirmed: true });
      }
    };
    checkSameEVMRecipient(recipient);

    return () => {
      isMounted = false;
    };
  }, [recipient, connectedWallet, multiProvider, originToken, destinationToken, chainDisplayName]);

  const isSanctioned = useIsAccountSanctioned();

  const { setTransferLoading } = useStore((s) => ({
    setTransferLoading: s.setTransferLoading,
  }));

  const onDoneTransactions = () => {
    setIsReview(false);
    cleanOverrideToken();
  };
  const { triggerTransactions } = useTokenTransfer(onDoneTransactions);

  const triggerTransactionsHandler = async () => {
    if (isSanctioned || !originToken || !destinationToken) return;
    setIsReview(false);
    setTransferLoading(true);

    await triggerTransactions(values, routeOverrideToken);
    setTransferLoading(false);
  };

  const onEdit = () => {
    setIsReview(false);
    cleanOverrideToken();
  };

  const text = !isRouteSupported
    ? 'Route is not supported'
    : isValidating
      ? 'Validating...'
      : 'Continue';

  if (!isReview) {
    return (
      <>
        <div
          className={`gap-2 bg-amber-400 px-4 text-sm ${
            showWarning ? 'max-h-38 py-2' : 'max-h-0'
          } overflow-hidden transition-all duration-500`}
        >
          <RecipientWarningBanner
            destinationChain={chainDisplayName}
            confirmRecipientHandler={(checked) =>
              setRecipientInfos((state) => ({ ...state, addressConfirmed: checked }))
            }
          />

        </div>

        <ConnectAwareSubmitButton
          disabled={!addressConfirmed || !isRouteSupported}
          chainName={originToken?.chainName || ''}
          text={text}
          classes="w-full px-3 py-3 font-secondary text-base font-semibold text-contentBody hpl-btn-gd"
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`gap-2 bg-amber-400 px-4 text-sm ${
          showWarning ? 'max-h-38 py-2' : 'max-h-0'
        } overflow-hidden transition-all duration-500`}
      >
        <RecipientWarningBanner
          destinationChain={chainDisplayName}
          confirmRecipientHandler={(checked) =>
            setRecipientInfos((state) => ({ ...state, addressConfirmed: checked }))
          }
        />
      </div>
      <div className="mb-4 mt-4 flex items-center justify-between space-x-4">
        <SolidButton
          type="button"
          color="primary"
          onClick={onEdit}
          className="px-6 py-2 font-secondary text-sm font-semibold"
          icon={<ChevronIcon direction="w" width={10} height={6} color={Color.white} />}
        >
          <span>Edit</span>
        </SolidButton>
        <SolidButton
          disabled={!addressConfirmed || isSanctioned}
          type="button"
          color="accent"
          onClick={triggerTransactionsHandler}
          className="flex-1 px-3 py-2 font-secondary text-sm font-semibold text-white"
        >
          {`Send to ${chainDisplayName}`}
        </SolidButton>
      </div>
    </>
  );
}

function ReviewDetails({
  isReview,
  routeOverrideToken,
}: {
  isReview: boolean;
  routeOverrideToken: Token | null;
}) {
  const { values } = useFormikContext<TransferFormValues>();
  const warpCore = useWarpCore();
  const { amount, originTokenKey, destinationTokenKey } = values;
  const tokenMap = useTokenByKeyMap();
  const originTokenByKey = routeOverrideToken || getTokenByKeyFromMap(tokenMap, originTokenKey);
  const destinationTokenByKey = getTokenByKeyFromMap(tokenMap, destinationTokenKey);
  // Finding actual token pair for the given tokens
  const originToken =
    destinationTokenByKey && originTokenByKey
      ? findRouteToken(warpCore, originTokenByKey, destinationTokenByKey.chainName)
      : undefined;
  const destinationToken = destinationTokenByKey
    ? originToken?.getConnectionForChain(destinationTokenByKey.chainName)?.token
    : undefined;
  const originTokenSymbol = originToken?.symbol || '';
  const isNft = originToken?.isNft();
  const isRouteSupported = useIsRouteSupported();

  const scaledAmount = useMemo(() => {
    if (!originToken?.scale || !destinationToken?.scale) return null;
    if (!isReview || originToken.scale === destinationToken.scale) return null;

    const amountWei = toWei(amount, originToken.decimals);
    const precisionFactor = 100000;

    const convertedAmount = convertToScaledAmount({
      amount: BigInt(amountWei),
      fromScale: originToken.scale,
      toScale: destinationToken.scale,
      precisionFactor,
    });
    const value = convertedAmount / BigInt(precisionFactor);

    return {
      value: fromWei(value.toString(), originToken.decimals),
      originScale: originToken.scale,
      destinationScale: destinationToken.scale,
    };
  }, [amount, originToken, destinationToken, isReview]);

  const amountWei = isNft ? amount.toString() : toWei(amount, originToken?.decimals);

  const { isLoading: isApproveLoading, isApproveRequired } = useIsApproveRequired(
    originToken,
    amountWei,
    isReview,
  );
  // Only fetch fees if route is supported
  const { isLoading: isQuoteLoading, fees: feeQuotes } = useFeeQuotes(
    values,
    isRouteSupported,
    originToken,
    destinationToken,
    !isReview,
  );

  const { prices } = useTokenPrices();
  const feePrices = useFeePrices(feeQuotes ?? null, warpCore.tokens, prices);
  const tokenPrice = originToken?.coinGeckoId ? prices[originToken.coinGeckoId] : undefined;
  const parsedAmount = parseFloat(amount);
  const transferUsd = tokenPrice && !isNaN(parsedAmount) ? parsedAmount * tokenPrice : 0;
  const isLoading = isApproveLoading || isQuoteLoading;

  const fees = useMemo(() => {
    if (!feeQuotes) return null;

    const interchainQuote = getInterchainQuote(originToken, feeQuotes.interchainQuote);
    const fees = {
      ...feeQuotes,
      interchainQuote: interchainQuote || feeQuotes.interchainQuote,
    };
    const totalFees = getTotalFee({
      ...fees,
      interchainQuote: interchainQuote || fees.interchainQuote,
    })
      .map((fee) => `${fee.getDecimalFormattedAmount().toFixed(8)} ${fee.token.symbol}`)
      .join(', ');

    return {
      ...fees,
      totalFees,
    };
  }, [feeQuotes, originToken]);

  return (
    <>
      {!isReview && (
        <FeeSectionButton
          fees={fees}
          isLoading={isLoading}
          feePrices={feePrices}
          transferUsd={transferUsd}
        />
      )}

      <div
        className={`${
          isReview ? 'max-h-screen duration-1000 ease-in' : 'max-h-0 duration-500'
        } overflow-hidden transition-all`}
      >
        <label className="mt-4 block pl-0.5 text-sm text-content-gray">Transactions</label>
        <div className="mt-1.5 space-y-2 break-all rounded-xl border border-[rgba(112,100,233,0.20)] bg-darker2 px-3 py-3 text-sm text-contentBody">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <SpinnerIcon className="h-5 w-5" />
            </div>
          ) : (
            <>
              {isApproveRequired && (
                <div>
                  <h4 className="text-sm font-semibold text-contentBody">Transaction 1: Approve Transfer</h4>
                  <div className="ml-1.5 mt-2 space-y-1.5 border-l border-[rgba(112,100,233,0.20)] pl-3 text-xs text-content-gray">
                    <p>{`Router Address: ${originToken?.addressOrDenom}`}</p>
                    {originToken?.collateralAddressOrDenom && (
                      <p>{`Collateral Address: ${originToken.collateralAddressOrDenom}`}</p>
                    )}
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-contentBody">{`Transaction${isApproveRequired ? ' 2' : ''}: Transfer Remote`}</h4>
                <div className="ml-1.5 mt-2 space-y-1.5 border-l border-[rgba(112,100,233,0.20)] pl-3 text-xs text-content-gray">
                  {destinationToken?.addressOrDenom && (
                    <p className="flex">
                      <span className="min-w-[7.5rem]">Remote Token</span>
                      <span>{destinationToken.addressOrDenom}</span>
                    </p>
                  )}

                  <p className="flex">
                    <span className="min-w-[7.5rem]">{isNft ? 'Token ID' : 'Amount'}</span>
                    <span>{`${amount} ${originTokenSymbol}`}</span>
                  </p>
                  {scaledAmount && (
                    <p className="flex">
                      <span className="min-w-[7.5rem]">Received Amount</span>
                      <span>{`${scaledAmount.value} ${originTokenSymbol} (scaled from ${scaledAmount.originScale} to ${scaledAmount.destinationScale})`}</span>
                    </p>
                  )}
                  {fees?.localQuote && fees.localQuote.amount > 0n && (
                    <p className="flex">
                      <span className="min-w-[7.5rem]">Local Gas (est.)</span>
                      <span>
                        {`${fees.localQuote.getDecimalFormattedAmount().toFixed(8) || '0'} ${fees.localQuote.token.symbol || ''}`}
                        <UsdLabel tokenAmount={fees.localQuote} feePrices={feePrices} />
                      </span>
                    </p>
                  )}
                  {fees?.interchainQuote && fees.interchainQuote.amount > 0n && (
                    <p className="flex">
                      <span className="min-w-[7.5rem]">Interchain Gas</span>
                      <span>
                        {`${fees.interchainQuote.getDecimalFormattedAmount().toFixed(8) || '0'} ${fees.interchainQuote.token.symbol || ''}`}
                        <UsdLabel tokenAmount={fees.interchainQuote} feePrices={feePrices} />
                      </span>
                    </p>
                  )}
                  {fees?.tokenFeeQuote && fees.tokenFeeQuote.amount > 0n && (
                    <p className="flex">
                      <span className="min-w-[7.5rem]">Token Fee</span>
                      <span>
                        {`${fees.tokenFeeQuote.getDecimalFormattedAmount().toFixed(8) || '0'} ${fees.tokenFeeQuote.token.symbol || ''}`}
                        <UsdLabel tokenAmount={fees.tokenFeeQuote} feePrices={feePrices} />
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function WarningBanners() {
  const { values } = useFormikContext<TransferFormValues>();
  const tokenMap = useTokenByKeyMap();
  const originToken = getTokenByKeyFromMap(tokenMap, values.originTokenKey);
  const destinationToken = getTokenByKeyFromMap(tokenMap, values.destinationTokenKey);

  return (
    // Max height to prevent double padding if multiple warnings are visible
    <div className="max-h-10">
      <ChainWalletWarning origin={originToken?.chainName || ''} />
      <ChainConnectionWarning
        origin={originToken?.chainName || ''}
        destination={destinationToken?.chainName || ''}
      />
      <WalletConnectionWarning origin={originToken?.chainName || ''} />
    </div>
  );
}

function useFormInitialValues(): TransferFormValues {
  const warpCore = useWarpCore();
  const tokens = useTokens();

  const { originTokenKey, destinationTokenKey } = getInitialTokenKeys(warpCore, tokens);

  return useMemo(
    () => ({
      originTokenKey,
      destinationTokenKey,
      amount: '',
      recipient: '',
    }),
    [originTokenKey, destinationTokenKey],
  );
}

function useIsRouteSupported(): boolean {
  const { values } = useFormikContext<TransferFormValues>();
  const tokenMap = useTokenByKeyMap();
  const collateralGroups = useCollateralGroups();
  const originToken = getTokenByKeyFromMap(tokenMap, values.originTokenKey);
  const destinationToken = getTokenByKeyFromMap(tokenMap, values.destinationTokenKey);

  return useMemo(() => {
    if (!originToken || !destinationToken) return true;
    return checkTokenHasRoute(originToken, destinationToken, collateralGroups);
  }, [originToken, destinationToken, collateralGroups]);
}

const insufficientFundsErrMsg = /insufficient.(funds|lamports)/i;
const emptyAccountErrMsg = /AccountNotFound/i;

async function validateForm(
  warpCore: WarpCore,
  tokenMap: Map<string, Token>,
  collateralGroups: Map<string, Token[]>,
  values: TransferFormValues,
  accounts: Record<KnownProtocolType, AccountInfo>,
  routerAddressesByChainMap: Record<ChainName, Record<string, RouterAddressInfo>>,
): Promise<[Record<string, string> | null, Token | null]> {
  // returns a tuple, where first value is validation result
  // and second value is token override
  try {
    const { originTokenKey, destinationTokenKey, amount, recipient: formRecipient } = values;

    // Look up tokens from the pre-computed map
    const token = getTokenByKeyFromMap(tokenMap, originTokenKey);
    const destinationToken = getTokenByKeyFromMap(tokenMap, destinationTokenKey);

    if (!amount) return [{ amount: 'Invalid amount' }, null];
    if (!token) return [{ originTokenKey: 'Origin token is required' }, null];
    if (!destinationToken) return [{ destinationTokenKey: 'Destination token is required' }, null];

    // Use form recipient if set, otherwise fallback to connected wallet for destination chain
    const { address: connectedDestAddress } = getAccountAddressAndPubKey(
      warpCore.multiProvider,
      destinationToken.chainName,
      accounts,
    );
    const recipient = formRecipient || connectedDestAddress || '';

    if (!recipient) return [{ amount: 'Invalid recipient' }, null];

    // Early route check using collateral groups - validates origin token can reach destination token
    if (!checkTokenHasRoute(token, destinationToken, collateralGroups)) {
      return [{ destinationTokenKey: 'Route is not supported' }, null];
    }

    const destination = destinationToken.chainName;

    if (routerAddressesByChainMap[destination]?.[normalizeAddress(recipient)]) {
      return [{ recipient: 'Warp Route address is not valid as recipient' }, null];
    }

    const { address: sender, publicKey: senderPubKey } = getAccountAddressAndPubKey(
      warpCore.multiProvider,
      token.chainName,
      accounts,
    );

    const amountWei = toWei(amount, token.decimals);
    const transferToken = await getTransferToken(
      warpCore,
      token,
      destinationToken,
      amountWei,
      recipient,
      sender,
      defaultMultiCollateralRoutes,
    );

    // This should not happen since we already checked the route above, but keep as safety check
    const connection = transferToken.getConnectionForChain(destination);
    if (!connection) {
      return [{ destinationTokenKey: 'Route is not supported' }, null];
    }

    const multiCollateralLimit = isMultiCollateralLimitExceeded(token, destination, amountWei);

    if (multiCollateralLimit) {
      return [
        {
          amount: `Transfer limit is ${fromWei(multiCollateralLimit.toString(), token.decimals)} ${token.symbol}`,
        },
        null,
      ];
    }

    const originTokenAmount = transferToken.amount(amountWei);
    const result = await warpCore.validateTransfer({
      originTokenAmount,
      destination,
      recipient,
      sender: sender || '',
      senderPubKey: await senderPubKey,
    });

    if (!isNullish(result)) {
      const enriched = await enrichBalanceError(
        warpCore,
        result,
        originTokenAmount,
        destination,
        sender || '',
        recipient,
      );
      return [enriched, null];
    }

    if (transferToken.addressOrDenom === token.addressOrDenom) return [null, null];

    return [null, transferToken];
  } catch (error: any) {
    logger.error('Error validating form', error);
    let errorMsg = errorToString(error, 40);
    const fullError = `${errorMsg} ${error.message}`;
    if (insufficientFundsErrMsg.test(fullError) || emptyAccountErrMsg.test(fullError)) {
      const originToken = getTokenByKeyFromMap(tokenMap, values.originTokenKey);
      const chainMetadata = originToken
        ? warpCore.multiProvider.tryGetChainMetadata(originToken.chainName)
        : null;
      const symbol = chainMetadata?.nativeToken?.symbol || 'funds';
      errorMsg = `Insufficient ${symbol} for gas fees`;
    }
    return [{ form: errorMsg }, null];
  }
}

const igpErrorPattern = /^Insufficient (\S+) for interchain gas$/;

async function enrichBalanceError(
  warpCore: WarpCore,
  result: Record<string, string>,
  originTokenAmount: TokenAmount,
  destination: string,
  sender: string,
  recipient: string,
): Promise<Record<string, string>> {
  if (!result.amount) return result;
  const igpErrorMatch = igpErrorPattern.exec(result.amount);
  if (!igpErrorMatch) return result;

  try {
    const { igpQuote } = await warpCore.getInterchainTransferFee({
      originTokenAmount,
      destination,
      sender,
      recipient,
    });

    // Symbol in validateTransfer message is sourced from igpQuote.token.symbol.
    if (igpErrorMatch[1] !== igpQuote.token.symbol) return result;

    const balance = originTokenAmount.token.isFungibleWith(igpQuote.token)
      ? await originTokenAmount.token.getBalance(warpCore.multiProvider, sender)
      : await igpQuote.token.getBalance(warpCore.multiProvider, sender);
    const deficit = igpQuote.amount - balance.amount;
    if (deficit > 0n) {
      const deficitAmount = new TokenAmount(deficit, igpQuote.token);
      return {
        ...result,
        amount: `Insufficient ${igpQuote.token.symbol} for interchain gas (need ${deficitAmount.getDecimalFormattedAmount().toFixed(4)} more ${igpQuote.token.symbol})`,
      };
    }
  } catch (e) {
    logger.warn('Failed to enrich balance error', e);
  }
  return result;
}
