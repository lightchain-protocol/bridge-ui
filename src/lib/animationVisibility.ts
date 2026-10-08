type VisibilityCleanup = () => void;

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
  margin = 320
): VisibilityCleanup {
  let isInViewport = isNearViewport(element, margin);

  const update = () => {
    onChange(isInViewport && document.visibilityState !== "hidden");
  };

  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            isInViewport = entry.isIntersecting;
            update();
          },
          { rootMargin: `${margin}px` }
        );

  observer?.observe(element);
  document.addEventListener("visibilitychange", update);
  update();

  return () => {
    observer?.disconnect();
    document.removeEventListener("visibilitychange", update);
  };
}
