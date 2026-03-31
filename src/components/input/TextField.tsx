import clsx from 'clsx';
import { Field, FieldAttributes } from 'formik';
import { ChangeEvent, InputHTMLAttributes, Ref, forwardRef } from 'react';

export function TextField({ className, ...props }: FieldAttributes<unknown>) {
  return <Field className={clsx(defaultClassName, className)} {...props} />;
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  onChange: (v: string) => void;
};

export const TextInput = forwardRef(function _TextInput(
  { onChange, className, ...props }: InputProps,
  ref: Ref<HTMLInputElement>,
) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e?.target?.value || '');
  };
  return (
    <input
      ref={ref}
      type="text"
      autoComplete="off"
      onChange={handleChange}
      className={clsx(defaultClassName, className)}
      {...props}
    />
  );
});

const defaultClassName =
  'px-0 py-3 text-[24px] text-contentBody font-bold border-b border-[rgba(112,100,233,0.10)] disabled:bg-gray-150 outline-none transition-all duration-300 bg-transparent focus:border-[rgba(112,100,233,0.50)]';
