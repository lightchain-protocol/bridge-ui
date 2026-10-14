import { getAccountAddressAndPubKey, Modal, useAccounts } from '@hyperlane-xyz/widgets';
import { useFormikContext } from 'formik';
import { LuTriangleAlert } from 'react-icons/lu';
import { useMultiProvider } from '../chains/hooks';
import { getChainDisplayName } from '../chains/utils';
import { getTokenByKeyFromMap, useTokenByKeyMap } from '../tokens/hooks';
import { TransferFormValues } from './types';

export function RecipientConfirmationModal({
  isOpen,
  close,
  onConfirm,
}: {
  isOpen: boolean;
  close: () => void;
  onConfirm: () => void;
}) {
  const { values } = useFormikContext<TransferFormValues>();
  const multiProvider = useMultiProvider();
  const tokenMap = useTokenByKeyMap();
  const { accounts } = useAccounts(multiProvider);
  const destinationToken = getTokenByKeyFromMap(tokenMap, values.destinationTokenKey);
  const destinationName = destinationToken
    ? getChainDisplayName(multiProvider, destinationToken.chainName)
    : 'the destination chain';

  // Get recipient (form value or fallback to connected wallet for destination)
  const { address: connectedDestAddress } = getAccountAddressAndPubKey(
    multiProvider,
    destinationToken?.chainName,
    accounts,
  );
  const recipient = values.recipient || connectedDestAddress || '';

  return (
    <Modal
      isOpen={isOpen}
      close={close}
      // The widget panel defaults to white; restyle it to match the dark bridge card.
      panelClassname="!max-w-md !rounded-3xl border border-[rgba(112,100,233,0.22)] !bg-dark/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-yellow-500/10 ring-1 ring-yellow-500/30">
          <LuTriangleAlert className="size-5 text-yellow-300" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-contentBody">
            Confirm recipient address
          </h2>
          <p className="mt-1.5 text-sm text-content-gray">
            This address has no funds on {destinationName} yet. Double-check it before sending.
          </p>
        </div>
        <p className="w-full break-all rounded-2xl border border-[rgba(112,100,233,0.16)] bg-darker2/80 px-4 py-3 font-mono text-xs leading-relaxed text-contentBody">
          {recipient}
        </p>
        <div className="grid w-full grid-cols-2 gap-3">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-[rgba(112,100,233,0.24)] bg-dark2 px-4 py-3 text-sm font-semibold text-contentBody transition-colors hover:border-[rgba(112,100,233,0.45)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              close();
              onConfirm();
            }}
            className="hpl-btn-gd flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white before:inset-0 after:inset-0"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}
