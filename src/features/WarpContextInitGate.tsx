import { useTimeout } from '@hyperlane-xyz/widgets';
import { PropsWithChildren, useState } from 'react';
import { useReadyMultiProvider } from './chains/hooks';
import { LuLoaderCircle } from "react-icons/lu";

const INIT_TIMEOUT = 10_000; // 10 seconds

// A wrapper app to delay rendering children until the warp context is ready
export function WarpContextInitGate({ children }: PropsWithChildren<unknown>) {
  const isWarpContextReady = !!useReadyMultiProvider();

  const [isTimedOut, setIsTimedOut] = useState(false);
  useTimeout(() => setIsTimedOut(true), INIT_TIMEOUT);

  if (!isWarpContextReady) {
    if (isTimedOut) {
      // Fallback to outer error boundary
      throw new Error(
        'Failed to initialize warp context. Please check your registry URL and connection status.',
      );
    } else {
      return (
        <div className="flex h-screen items-center justify-center">
          <LuLoaderCircle className="animate-spin size-8 text-[#7064E9]" />
        </div>
      );
    }
  }

  return <>{children}</>;
}
