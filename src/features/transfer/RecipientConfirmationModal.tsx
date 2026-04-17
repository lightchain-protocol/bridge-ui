import { getAccountAddressAndPubKey, Modal, useAccounts } from '@hyperlane-xyz/widgets';
import { useFormikContext } from 'formik';
import { SolidButton } from '../../components/buttons/SolidButton';
import { useMultiProvider } from '../chains/hooks';
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
      title="Confirm Recipient Address"
      panelClassname="flex max-w-sm flex-col items-center gap-5 overflow-hidden rounded-2xl border border-[rgba(112,100,233,0.20)] bg-dark p-4 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
    >
      <p className="text-center text-sm text-contentBody">
        The recipient address has no funds on the destination chain. Is this address correct?
      </p>
      <p className="w-full rounded-xl border border-[rgba(112,100,233,0.20)] bg-dark2 p-2 text-center text-sm text-contentBody">
        {recipient}
      </p>
      <div className="flex items-center justify-center gap-12">
        <SolidButton onClick={close} color="gray" className="min-w-24 px-4 py-1">
          Cancel
        </SolidButton>
        <SolidButton
          onClick={() => {
            close();
            onConfirm();
          }}
          color="primary"
          className="min-w-24 px-4 py-1"
        >
          Continue
        </SolidButton>
      </div>
    </Modal>
  );
}
