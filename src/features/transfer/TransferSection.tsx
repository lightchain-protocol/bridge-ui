import { ReactNode } from 'react';

type TransferSectionProps = {
  children: ReactNode;
};

export function TransferSection({ children }: TransferSectionProps) {
  return (
      <div className="flex flex-col gap-3">{children}</div>
  );
}
