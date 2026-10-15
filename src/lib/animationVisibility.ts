import { useSyncExternalStore } from 'react';

type VisibilityCleanup = () => void;

let canAnimateDecorCached: boolean | undefined;

/**
 * Whether decorative WebGL animations (aurora, footer pixels) should run at all: never without
 * WebGL (a missing context used to take the whole app down) and never when the user asks for
 * reduced motion. Evaluated once per page.
 */
export function canAnimateDecor(): boolean {
  if (typeof window === 'undefined') return false;
  if (canAnimateDecorCached !== undefined) return canAnimateDecorCached;
  let ok = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ok) {
    try {
      const canvas = document.createElement('canvas');
      ok = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      ok = false;
    }
  }
  canAnimateDecorCached = ok;
  return ok;
}

const noopSubscribe = () => () => {};

/** `canAnimateDecor()` as a hook: false during SSR/hydration, then the real value. */
export function useCanAnimateDecor(): boolean {
  return useSyncExternalStore(noopSubscribe, canAnimateDecor, () => false);
}

function isNearViewport(element: Element, margin: number) {
  const rect = element.getBoundingClientRect();

  return (
    rect.bottom >= -margin &&
    rect.right >= -margin &&
    rect.top <= window.innerHeight + margin &&
    rect.left <= window.innerWidth + margin
  );
}

export function createAnimationVisibilityController(
  element: Element,
  onChange: (isVisible: boolean) => void,
  margin = 320,
): VisibilityCleanup {
  let isInViewport = isNearViewport(element, margin);

  const update = () => {
    onChange(isInViewport && document.visibilityState !== 'hidden');
  };

  const observer =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            isInViewport = entry.isIntersecting;
            update();
          },
          { rootMargin: `${margin}px` },
        );

  observer?.observe(element);
  document.addEventListener('visibilitychange', update);
  update();

  return () => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', update);
  };
}
