import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { canAnimateDecor } from '../../lib/animationVisibility';
import type { SoftAuroraProps } from './SoftAurora';

// The aurora is decoration: load it after the page has painted, and not at all when the user
// prefers reduced motion or the browser has no WebGL (where it used to take the whole app down).
const SoftAurora = dynamic(() => import('./SoftAurora'), { ssr: false });

export default function DeferredAurora(props: SoftAuroraProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!canAnimateDecor()) return;
    const start = () => setShow(true);
    // Safari has no requestIdleCallback.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 1000);
    return () => clearTimeout(id);
  }, []);

  if (!show) return null;
  return <SoftAurora {...props} />;
}
