import { useEffect, useRef } from 'react';
import { ensureFont } from '../../motion/fonts';
import styles from './Snowfall.module.css';

/** The letters that fall. */
const LETTERS = Array.from('movie advent calendar 2026').filter((c) => c !== ' ');
/** The letter motion's glyph face and colour, so the snow matches it. */
const FONT = '"JetBrains Mono", ui-monospace, monospace';
const WEIGHT = 500;
const COLOUR = '241, 237, 228'; // #f1ede4
/** Roughly one letter per this many square pixels of screen. */
const AREA_PER_FLAKE = 8000;

interface Flake {
  char: string;
  /** 0 = far away, 1 = close: sets size, brightness and speed. */
  depth: number;
  x: number;
  y: number;
  /** Sway: phase and period (s). */
  phase: number;
  period: number;
  /** Slow spin (rad, rad/s). */
  angle: number;
  spin: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

function newFlake(width: number, y: number, depth = Math.random() ** 1.6): Flake {
  return {
    char: pick(LETTERS),
    // More far flakes than near ones, as in real snow.
    depth,
    x: Math.random() * width,
    y,
    phase: Math.random() * Math.PI * 2,
    period: lerp(5, 10, Math.random()),
    angle: (Math.random() - 0.5) * 0.6,
    spin: (Math.random() - 0.5) * 0.5,
  };
}

const sizeOf = (f: Flake) => lerp(10, 36, f.depth);
const alphaOf = (f: Flake) => lerp(0.12, 0.85, f.depth);
const speedOf = (f: Flake) => lerp(14, 50, f.depth); // px per second
const swayOf = (f: Flake) => lerp(6, 26, f.depth); // px

/**
 * Before a calendar starts: letters of "movie advent calendar 2026" snowing
 * down the whole screen behind the page. Near letters are bigger, brighter and
 * faster; far ones small, faint and slow. With reduced motion the snow holds still.
 */
export default function Snowfall({ background }: { background: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let frame = 0;
    let last = performance.now();
    let elapsed = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Keep the snow as dense on any screen; start already spread over it, not empty.
      const count = Math.min(220, Math.round((width * height) / AREA_PER_FLAKE));
      flakes = flakes.slice(0, count);
      while (flakes.length < count) flakes.push(newFlake(width, Math.random() * height));
      flakes.sort((a, b) => a.depth - b.depth); // far ones drawn first
    };

    const draw = () => {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const f of flakes) {
        const size = sizeOf(f);
        const x = f.x + Math.sin(f.phase + (elapsed * Math.PI * 2) / f.period) * swayOf(f);
        ctx.save();
        ctx.translate(x, f.y);
        ctx.rotate(f.angle);
        ctx.font = `${WEIGHT} ${size}px ${FONT}`;
        ctx.fillStyle = `rgba(${COLOUR}, ${alphaOf(f)})`;
        ctx.fillText(f.char, 0, 0);
        ctx.restore();
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsed += dt;
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += speedOf(f) * dt;
        f.angle += f.spin * dt;
        // Off the bottom: a new letter starts above the top, at the same depth.
        if (f.y - sizeOf(f) > height) flakes[i] = newFlake(width, -sizeOf(f), f.depth);
      }
      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      resize();
      draw();
      if (!reduced) frame = requestAnimationFrame(tick);
    };

    // Draw once the face is ready, so the first frame isn't in a fallback font.
    let cancelled = false;
    ensureFont('JetBrains Mono', WEIGHT, LETTERS.join('')).then(() => !cancelled && start());

    const onResize = () => {
      resize();
      draw();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [background]);

  return <canvas ref={canvasRef} className={styles.snow} aria-hidden="true" />;
}
