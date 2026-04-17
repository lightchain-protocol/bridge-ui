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
  recipientOverride,
  descriptionOverride,
}: {
  isOpen: boolean;
  close: () => void;
  onConfirm: () => void;
  recipientOverride?: string;
  descriptionOverride?: string;
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
  const recipient = recipientOverride || values.recipient || connectedDestAddress || '';
  const description =
    descriptionOverride ||
    'The recipient address has no funds on the destination chain. Is this address correct?';

  return (
    <Modal
      isOpen={isOpen}
      close={close}
      dialogClassname="hpl-recipient-details-modal"
      panelClassname="flex max-w-sm flex-col gap-4 overflow-hidden rounded-2xl border border-[rgba(112,100,233,0.20)] bg-dark p-0 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
    >
      <div className="border-b border-[rgba(112,100,233,0.18)] bg-darker2 px-4 py-3">
        <h3 className="font-secondary text-base font-medium text-contentBody">
          Confirm Recipient Address
        </h3>
      </div>
      <div className="px-4 pb-4">
        <p className="text-center text-sm text-contentBody">{description}</p>
        <p className="mt-3 w-full rounded-xl border border-[rgba(112,100,233,0.20)] bg-dark2 p-2 text-center text-sm text-contentBody">
          {recipient}
        </p>
        <div className="mt-4 flex w-full items-center gap-3">
          <SolidButton onClick={close} color="gray" className="h-10 w-full px-4">
            Cancel
          </SolidButton>
          <SolidButton
            onClick={() => {
              close();
              onConfirm();
            }}
            color="primary"
            className="h-10 w-full px-4"
          >
            Continue
          </SolidButton>
        </div>
      </div>
    </Modal>
  );
}
