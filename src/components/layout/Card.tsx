import { PropsWithChildren } from 'react';

interface Props {
  className?: string;
}

export function Card({ className, children }: PropsWithChildren<Props>) {
  return (
    <div
      className={`relative sm:p-6 py-6 px-4 bg-dark ${className}`}
    >
      {children}
    </div>
  );
}
