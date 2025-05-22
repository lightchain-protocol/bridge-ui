import { PropsWithChildren } from 'react';

interface Props {
  className?: string;
}

export function Card({ className, children }: PropsWithChildren<Props>) {
  return (
    <div
      className={`hpl-card relative overflow-auto rounded-xl p-4 ${className}`}
    >
      {children}
    </div>
  );
}
