import { SearchIcon, XIcon } from '@hyperlane-xyz/widgets';
import { Ref } from 'react';
import { TextInput } from './TextField';

export function SearchInput({
  inputRef,
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
}: {
  inputRef?: Ref<HTMLInputElement>;
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
  'aria-label'?: string;
}) {
  return (
    <div className="relative w-full">
      <SearchIcon
        width={16}
        height={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 [&_path]:fill-contentBody"
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        name="search"
        className="!mt-0 w-full rounded-xl border border-[rgba(111,100,233,0.4)] bg-[rgba(204,206,239,0.08)] pl-9 pr-8 text-sm text-contentBody placeholder:text-content-gray all:py-2 all:focus:border-[#7064E9]"
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-content-gray hover:text-contentBody [&_path]:fill-content-gray hover:[&_path]:fill-contentBody transition-colors"
        >
          <XIcon width={12} height={12} />
        </button>
      )}
    </div>
  );
}
