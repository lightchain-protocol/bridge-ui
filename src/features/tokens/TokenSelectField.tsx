import { Token } from '@hyperlane-xyz/sdk';
import { ChevronIcon } from '@hyperlane-xyz/widgets';
import { useField, useFormikContext } from 'formik';
import { useState } from 'react';
import { WARP_QUERY_PARAMS } from '../../consts/args';
import { updateQueryParams } from '../../utils/queryParams';
import { trackTokenSelectionEvent } from '../analytics/utils';
import { ChainEditModal } from '../chains/ChainEditModal';
import { useMultiProvider } from '../chains/hooks';
import { getChainDisplayName } from '../chains/utils';
import { TransferFormValues } from '../transfer/types';
import { shouldClearAddress } from '../transfer/utils';
import { getTokenByKeyFromMap, useTokenByKeyMap } from './hooks';
import { TokenChainIcon } from './TokenChainIcon';
import { TokenSelectionMode } from './types';
import { UnifiedTokenChainModal } from './UnifiedTokenChainModal';
import { getTokenKey } from './utils';

type Props = {
  name: string;
  label?: string;
  selectionMode: TokenSelectionMode;
  disabled?: boolean;
  setIsNft?: (value: boolean) => void;
  showLabel?: boolean;
  className?: string;
  childClass?: string;
};

export function TokenSelectField({
  name,
  label,
  selectionMode,
  disabled,
  setIsNft,
  showLabel = true,
  className,
  childClass,
}: Props) {
  const { values, setFieldValue } = useFormikContext<TransferFormValues>();
  const [{ value: tokenKey }, , { setValue: setTokenKey }] = useField<string | undefined>(name);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<string | null>(null);

  const handleEditBack = () => {
    setEditingChain(null);
    setIsModalOpen(true);
  };

  const multiProvider = useMultiProvider();
  const tokenMap = useTokenByKeyMap();

  // Get the current token
  const selectedToken = getTokenByKeyFromMap(tokenMap, tokenKey);

  // Get the counterpart token (destination when selecting origin, origin when selecting destination)
  const counterpartToken =
    selectionMode === 'origin'
      ? getTokenByKeyFromMap(tokenMap, values.destinationTokenKey)
      : getTokenByKeyFromMap(tokenMap, values.originTokenKey);

  const handleSelectToken = (newToken: Token) => {
    const newTokenKey = getTokenKey(newToken);
    setTokenKey(newTokenKey);

    // Track analytics - derive origin and destination from current tokens
    const originToken = getTokenByKeyFromMap(tokenMap, values.originTokenKey);
    const destToken = getTokenByKeyFromMap(tokenMap, values.destinationTokenKey);
    const origin = selectionMode === 'origin' ? newToken.chainName : originToken?.chainName || '';
    const destination =
      selectionMode === 'destination' ? newToken.chainName : destToken?.chainName || '';
    const destinationTokenSymbol =
      selectionMode === 'destination' ? newToken.symbol : destToken?.symbol || '';
    trackTokenSelectionEvent(
      selectionMode,
      newToken,
      destinationTokenSymbol,
      origin,
      destination,
      multiProvider,
    );

    // Update URL query params based on selection mode
    if (selectionMode === 'origin') {
      setFieldValue('amount', '');
      updateQueryParams({
        [WARP_QUERY_PARAMS.ORIGIN]: newToken.chainName,
        [WARP_QUERY_PARAMS.ORIGIN_TOKEN]: newToken.symbol,
      });
    } else {
      // When destination changes, validate and clear custom recipient if protocol changed
      const shouldClearRecipient = shouldClearAddress(
        multiProvider,
        values.recipient,
        newToken.chainName,
      );
      if (shouldClearRecipient) setFieldValue('recipient', '');
      updateQueryParams({
        [WARP_QUERY_PARAMS.DESTINATION]: newToken.chainName,
        [WARP_QUERY_PARAMS.DESTINATION_TOKEN]: newToken.symbol,
      });
    }

    // Update NFT state if callback provided
    if (setIsNft) {
      setIsNft(newToken.isNft());
    }
  };

  const openTokenSelectModal = () => {
    if (!disabled) setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col">
        {showLabel && label && <span className="mb-1 pl-0.5 text-sm text-gray-600">{label}</span>}
        <TokenButton
          token={selectedToken}
          disabled={disabled}
          onClick={openTokenSelectModal}
          multiProvider={multiProvider}
          childClass={childClass}
          className={className}
        />
      </div>

      <UnifiedTokenChainModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        onSelect={handleSelectToken}
        selectionMode={selectionMode}
        counterpartToken={counterpartToken}
        recipient={values.recipient}
        onEditChain={setEditingChain}
      />
      {editingChain && (
        <ChainEditModal
          isOpen={!!editingChain}
          close={() => setEditingChain(null)}
          onClickBack={handleEditBack}
          chainName={editingChain}
        />
      )}
    </>
  );
}

function TokenButton({
  token,
  disabled,
  onClick,
  multiProvider,
  childClass,
  className,
}: {
  token?: Token;
  disabled?: boolean;
  onClick: () => void;
  multiProvider: ReturnType<typeof useMultiProvider>;
  childClass?: string;
  className?: string;
}) {
  const chainDisplayName = token ? getChainDisplayName(multiProvider, token.chainName) : '';

  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between gap-1.5 rounded-lg border border-[rgba(112,100,233,0.20)] bg-dark2 px-1.5 py-2.5 transition-colors sm:gap-2 sm:px-3 ${disabled ? styles.disabled : styles.enabled} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {token ? (
        <div className={`flex min-w-0 items-center gap-1.5 sm:gap-3 ${childClass}`}>
          <div className="shrink-0">
            <TokenChainIcon token={token} size={36} />
          </div>
          {/* Single-line labels: long chain names truncate instead of wrapping */}
          <div className="flex min-w-0 flex-col items-start gap-0.5 [.flex-row-reverse_&]:items-end">
            <span className="whitespace-nowrap text-sm font-semibold leading-tight text-contentBody sm:text-base">
              {token.symbol}
            </span>
            <span
              title={chainDisplayName}
              className="max-w-full truncate whitespace-nowrap text-[10px] font-normal leading-tight tracking-tight text-content-gray sm:text-xs sm:tracking-normal"
            >
              {chainDisplayName}
            </span>
          </div>
        </div>
      ) : (
        <span className="text-sm text-gray-400">Select token</span>
      )}

      {!disabled && <ChevronIcon className="size-3 sm:size-3.5" direction="s" color="#7376AA" />}
    </button>
  );
}

const styles = {
  base: 'px-2 py-1.5 w-full flex items-center justify-between text-sm rounded-lg outline-none transition-colors duration-500',
  enabled: 'cursor-pointer hover:bg-darker2',
  // Locked during review: stays fully legible, just not interactive.
  disabled: 'cursor-default',
};
