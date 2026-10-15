import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createAnimationVisibilityController } from '../../lib/animationVisibility';

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  letterSpacing?: number;
  /** Base weight; the `weight` prop animates the 'wght' axis on top of it when enabled. */
  fontWeight?: number;
  minFontSize?: number;
  maxFontSize?: number;
  classNameTextPressure?: string;
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

/** Scoped class prefix — avoids global `.flex` / `.stroke` collisions */
const TP = 'text-pressure';

const debounce = <Args extends unknown[]>(func: (...args: Args) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const TextPressure: React.FC<TextPressureProps> = ({
  text = 'Compressa',
  fontFamily = 'Compressa VF',
  // No default font file: the original pointed at a dead URL, so every page load requested a
  // 404 and the browser fell back anyway. Pass `fontUrl` to load one.
  fontUrl = '',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = '#FFFFFF',
  strokeColor = '#FF0000',
  letterSpacing = 0,
  fontWeight = 100,
  className = '',
  minFontSize = 16,
  maxFontSize = 300,
  classNameTextPressure = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : containerW;
    const isSmall = viewportW <= 900;
    const effectiveMax = isSmall ? Math.min(maxFontSize, 96) : maxFontSize;

    /** `letter-spacing` adds horizontal space; sizing from `containerW` alone overflows with nowrap. */
    const letterExtra = letterSpacing * Math.max(0, chars.length - 1);
    const widthForGlyphs = Math.max(1, containerW - letterExtra);
    let newFontSize = widthForGlyphs / (chars.length / 2);
    newFontSize = Math.max(newFontSize, minFontSize);

    setFontSize(Math.min(newFontSize, effectiveMax));
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;

      // The estimate above assumes a condensed glyph (~0.5em). Measure the real glyph run and
      // shrink to fit, below minFontSize if needed: a clipped word is worse than a small one.
      const spans = spansRef.current.filter((s): s is HTMLSpanElement => !!s);
      if (spans.length) {
        const first = spans[0].getBoundingClientRect();
        const last = spans[spans.length - 1].getBoundingClientRect();
        const textW = last.right - first.left;
        const glyphW = textW - letterExtra; // letter-spacing is in px and does not scale
        if (textW > containerW && glyphW > 0) {
          const fitted = (Math.min(newFontSize, effectiveMax) * widthForGlyphs) / glyphW;
          setFontSize(Math.max(8, Math.floor(fitted * 0.98)));
        }
      }

      const textRect = titleRef.current.getBoundingClientRect();
      if (!isSmall && scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, letterSpacing, minFontSize, maxFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    // Glyph widths change when the web font arrives; measure again then.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) debouncedSetSize();
    });
    return () => {
      cancelled = true;
      window.removeEventListener('resize', debouncedSetSize);
    };
  }, [setSize]);

  useEffect(() => {
    let rafId = 0;
    let canAnimate = true;

    const stopAnimation = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const scheduleAnimation = () => {
      if (!rafId && canAnimate) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const animate = () => {
      rafId = 0;
      if (!canAnimate) return;

      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };

          const d = dist(mouseRef.current, charCenter);

          const axes: string[] = [];
          if (width) axes.push(`'wdth' ${Math.floor(getAttr(d, maxDist, 5, 200))}`);
          if (weight) axes.push(`'wght' ${Math.floor(getAttr(d, maxDist, 100, 900))}`);
          if (italic) axes.push(`'ital' ${getAttr(d, maxDist, 0, 1).toFixed(2)}`);
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : '1';

          const newFontVariationSettings = axes.length ? axes.join(', ') : 'normal';

          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      scheduleAnimation();
    };

    const cleanupVisibility = containerRef.current
      ? createAnimationVisibilityController(containerRef.current, (isVisible) => {
          canAnimate = isVisible;
          if (isVisible) {
            scheduleAnimation();
          } else {
            stopAnimation();
          }
        })
      : undefined;

    scheduleAnimation();

    return () => {
      stopAnimation();
      cleanupVisibility?.();
    };
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(() => {
    return (
      <style>{`
        ${
          fontUrl
            ? `@font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-style: normal;
        }`
            : ''
        }

        .${TP} .${TP}__flex {
          display: flex;
          justify-content: space-between;
        }

        .${TP} .${TP}__stroke span {
          position: relative;
          color: ${textColor};
        }
        .${TP} .${TP}__stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: 3px;
          -webkit-text-stroke-color: ${strokeColor};
        }

        .${TP} .${TP}__title {
          letter-spacing: ${letterSpacing}px;
          color: ${textColor};
        }
      `}</style>
    );
  }, [fontFamily, fontUrl, textColor, strokeColor, letterSpacing]);

  const dynamicClassName = [className, flex ? `${TP}__flex` : '', stroke ? `${TP}__stroke` : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={TP}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    >
      {styleElement}
      <span
        ref={titleRef}
        className={`${TP}__title ${dynamicClassName} ${classNameTextPressure}`}
        style={{
          fontFamily,
          textTransform: 'uppercase',
          fontSize: fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center top',
          margin: 0,
          textAlign: 'center',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          fontWeight,
          width: '100%',
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              spansRef.current[i] = el;
            }}
            data-char={char}
            style={{
              display: 'inline-block',
              color: stroke ? undefined : textColor,
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  );
};

export default TextPressure;
