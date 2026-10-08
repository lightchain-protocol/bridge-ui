import { PropsWithChildren } from 'react';

interface Props {
  className?: string;
}

export function Card({ className, children }: PropsWithChildren<Props>) {
  return <div className={`relative bg-dark px-4 py-6 sm:p-6 ${className}`}>{children}</div>;
}
