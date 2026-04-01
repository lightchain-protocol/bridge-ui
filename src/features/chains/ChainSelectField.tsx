import { ChainSearchMenuProps, ChevronIcon } from '@hyperlane-xyz/widgets';
import { useField, useFormikContext } from 'formik';
import { useState } from 'react';
import { ChainLogo } from '../../components/icons/ChainLogo';
import { TransferFormValues } from '../transfer/types';
import { ChainSelectListModal } from './ChainSelectModal';
import { useChainDisplayName } from './hooks';

type Props = {
  name: string;
  label: string;
  onChange?: (id: ChainName, fieldName: string) => void;
  disabled?: boolean;
  customListItemField: ChainSearchMenuProps['customListItemField'];
  className?: string;
  childClass?: string;
};

export function ChainSelectField({ name, label, onChange, disabled, customListItemField, className, childClass }: Props) {
  const [field, , helpers] = useField<ChainName>(name);
  const { setFieldValue } = useFormikContext<TransferFormValues>();

  const displayName = useChainDisplayName(field.value, true);

  const handleChange = (chainName: ChainName) => {
    helpers.setValue(chainName);
    // Reset other fields on chain change
    setFieldValue('recipient', '');
    setFieldValue('amount', '');
    if (onChange) onChange(chainName, name);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const onClick = () => {
    if (!disabled) setIsModalOpen(true);
  };

  return (
    <div className="relative">
      <button
        type="button"
        name={field.name}
        className={`sm:px-4 px-2 py-2.5 w-full rounded-lg border border-[rgba(112,100,233,0.20)] bg-dark2 flex items-center justify-between sm:gap-4 gap-2 hover:bg-darker2 transition-colors ${disabled ? styles.disabled : styles.enabled} ${className}`}
        onClick={onClick}
      >
        <div className={`flex items-center justify-between sm:gap-4 gap-2.5 ${childClass}`}>
          <div className="sm:size-[50px] size-5">
            <ChainLogo chainName={field.value} size={50} />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <label htmlFor={name} className="sm:text-sm text-[10px] font-medium text-gray-400 leading-none">
              {label}
            </label>
            <span className="sm:text-lg text-xs font-medium text-contentBody leading-none">{displayName}</span>
          </div>
        </div>
        <ChevronIcon className='sm:size-3.5 size-3' direction="s" color="#7376AA" />
      </button>
      <ChainSelectListModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        onSelect={handleChange}
        customListItemField={customListItemField}
      />
      
    </div>
  );
}

const styles = {
  base: 'px-2 py-1.5 w-full flex items-center justify-between text-sm rounded-lg outline-none transition-colors duration-500',
  enabled: '',
  disabled: 'cursor-default',
};
