import { WarningIcon } from '@hyperlane-xyz/widgets';

export function RecipientWarningBanner({
  destinationChain,
  confirmRecipientHandler,
}: {
  destinationChain: string;
  confirmRecipientHandler: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row">
      <div className="shrink-0">
        <WarningIcon width={32} height={32} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="my-2 break-words whitespace-normal">
          The recipient address is the same as the currently connected smart contract wallet,{' '}
          <strong>but it does not exist as a smart contract on {destinationChain}</strong>.
        </p>
        <p className="my-2">This may result in losing access to your bridged tokens.</p>
        <p className="my-2 break-words whitespace-normal">
          <strong>
            Only proceed if you are certain you have control over this address on {destinationChain}
          </strong>
        </p>
        <div className="flex w-full items-start gap-2 rounded bg-white/30 px-2.5 py-2 text-left hover:bg-white/50 active:bg-white/60 sm:w-fit">
          <input
            onChange={({ target: { checked } }) => confirmRecipientHandler(checked)}
            type="checkbox"
            id="confirm-address"
            name="confirm-recipient"
            className="mt-1 shrink-0"
          />
          <label
            htmlFor="confirm-address"
            className="cursor-pointer break-words whitespace-normal leading-5"
          >
            I have control and want to bridge to this address
          </label>
        </div>
      </div>
    </div>
  );
}
