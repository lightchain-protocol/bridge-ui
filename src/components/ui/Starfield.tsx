import { useEffect, useRef } from 'react';
import { createAnimationVisibilityController } from '../../lib/animationVisibility';

interface StarfieldProps {
  /** Travel speed in depth units per second: a star crosses the whole field in 1/speed s. */
  speed?: number;
  /** Stars per million CSS pixels of canvas; the total is clamped to [150, 700]. */
  density?: number;
}

const MAX_DPR = 1.5;
const MAX_FRAME_DT = 0.05; // s; a tab coming back from the background must not fast-forward
const NEAR = 0.02; // depth at which a star has flown past the viewer
const STREAK = 2.5; // streak length, in frames of travel at the current speed
const PARALLAX = 0.12; // how far (fraction of the canvas) the vanishing point follows the pointer
// Mostly white with a few brand-tinted stars. Alpha is set per star from its depth.
const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [255, 255, 255],
  [255, 255, 255],
  [255, 255, 255],
  [255, 255, 255],
  [255, 255, 255],
  [255, 255, 255],
  [196, 181, 253], // lavender
  [240, 171, 252], // light pink
  [221, 0, 172], // brand pink
  [112, 100, 233], // brand violet
];

/**
 * Warp-speed starfield on a plain 2D canvas: no WebGL, no dependencies, a few hundred line
 * draws per frame. Stars live in a unit cube in front of the viewer and are projected with
 * 1/z; each frame they move closer and are drawn as a streak from where they were to where
 * they are, so the ones rushing past the edges smear while the distant ones stay points.
 * Pauses when hidden or scrolled away; with `prefers-reduced-motion` it draws one still frame.
 */
export default function Starfield({ speed = 0.45, density = 220 }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 1;
    let h = 1;
    let count = 0;
    // Interleaved per star: x, y in [-1, 1]; z in (0, 1] with 1 the farthest; palette index.
    let stars = new Float32Array(0);

    const respawn = (i: number, z: number) => {
      const o = i * 4;
      stars[o] = Math.random() * 2 - 1;
      stars[o + 1] = Math.random() * 2 - 1;
      stars[o + 2] = z;
      stars[o + 3] = Math.floor(Math.random() * PALETTE.length);
    };

    // The vanishing point drifts slightly toward the pointer.
    const pointer = { x: 0.5, y: 0.5 };
    const center = { x: 0.5, y: 0.5 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = e.clientY / window.innerHeight;
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      center.x += (pointer.x - center.x) * 0.04;
      center.y += (pointer.y - center.y) * 0.04;
      const cx = w * (0.5 + (center.x - 0.5) * PARALLAX);
      const cy = h * (0.5 + (center.y - 0.5) * PARALLAX);
      const focal = Math.max(w, h) * 0.5;
      const step = speed * dt;
      ctx.lineCap = 'round';

      for (let i = 0; i < count; i++) {
        const o = i * 4;
        let z = stars[o + 2] - step;
        if (z <= NEAR) {
          respawn(i, 1);
          z = 1;
        }
        const x = stars[o];
        const y = stars[o + 1];
        const sx = cx + (x * focal) / z;
        const sy = cy + (y * focal) / z;
        if (sx < -4 || sx > w + 4 || sy < -4 || sy > h + 4) {
          respawn(i, 1);
          continue;
        }
        stars[o + 2] = z;

        const near = 1 - z; // 0 far .. 1 near
        const [r, g, b] = PALETTE[stars[o + 3]];
        const alpha = 0.2 + near * 0.8;
        const size = 0.5 + near * 1.8;

        if (dt === 0) {
          // Still frame (reduced motion): plain dots.
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
          continue;
        }
        const pz = Math.min(1, z + step * STREAK);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(cx + (x * focal) / pz, cy + (y * focal) / pz);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(700, Math.max(150, Math.round(((w * h) / 1e6) * density)));
      if (target !== count) {
        const next = new Float32Array(target * 4);
        next.set(stars.subarray(0, Math.min(stars.length, next.length)));
        stars = next;
        for (let i = count; i < target; i++) respawn(i, Math.random());
        count = target;
      }
      if (reduceMotion) draw(0);
    };

    let raf = 0;
    let running = false;
    let last = 0;
    const frame = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(MAX_FRAME_DT, Math.max(0, (t - last) / 1000));
      last = t;
      draw(dt);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const stopVisibility = reduceMotion
      ? undefined
      : createAnimationVisibilityController(canvas, (visible) => {
          if (visible && !running) {
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(frame);
          } else if (!visible && running) {
            running = false;
            cancelAnimationFrame(raf);
          }
        });
    if (!reduceMotion) window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      stopVisibility?.();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [speed, density]);

  return <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />;
}
