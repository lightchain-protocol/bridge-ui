import clsx from 'clsx';
import { ReactNode } from 'react';

export function ModalHeader({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={clsx('px-4 py-2', className)}>
      {children && (
          <h3 className="text-contentBody text-center text-lg font-medium leading-[1.3]">{children}</h3>
      )}
    </div>
  );
}
