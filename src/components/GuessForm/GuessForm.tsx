import { useId, useRef, useState, type FormEvent } from 'react';
import arrowRight from '../../assets/ui/arrow-right.svg';
import { wrongGuessHaptic } from '../../lib/haptics';
import styles from './GuessForm.module.css';

/** Where today's guessing stands. */
export type GuessOutcome = 'playing' | 'solved' | 'out';

const OUTCOME_TEXT: Record<Exclude<GuessOutcome, 'playing'>, string> = {
  out: 'So close!',
  solved: 'You got it!',
};

interface GuessFormProps {
  remainingAttempts: number;
  outcome: GuessOutcome;
  /** Records a guess; returns whether it was right. */
  onGuess: (guess: string) => boolean;
}

/** How many 😱 rise from the field on a wrong guess. */
const REACTIONS = 7;

/**
 * 😱 floating up from the field like bubbles or flames: each starts small,
 * rises with a sway, swells a little and fades out, then removes itself.
 * Sizes, paths and timing vary so they don't move as a block.
 */
function releaseReactions(layer: HTMLElement, className: string) {
  const width = layer.clientWidth;
  for (let i = 0; i < REACTIONS; i++) {
    const emoji = document.createElement('span');
    emoji.className = className;
    emoji.textContent = '😱';
    emoji.style.left = `${width * (0.12 + Math.random() * 0.76)}px`;
    emoji.style.fontSize = `${16 + Math.random() * 12}px`;
    layer.appendChild(emoji);

    const rise = 80 + Math.random() * 90;
    const sway = (Math.random() * 2 - 1) * 18;
    const at = (x: number, y: number, scale: number) => `translate(calc(-50% + ${x}px), ${y}px) scale(${scale})`;
    const timing = { duration: 1800 + Math.random() * 800, delay: i * 70 + Math.random() * 80, fill: 'both' } as const;
    // The rise slows as it goes; the fade is even, so each one stays visible for a while before it goes.
    const flight = emoji.animate(
      [
        { transform: at(0, 0, 0.6) },
        { transform: at(sway * 0.5, -rise * 0.25, 1), offset: 0.2 },
        { transform: at(-sway * 0.4, -rise * 0.65, 1.05), offset: 0.6 },
        { transform: at(sway, -rise, 1.15) },
      ],
      { ...timing, easing: 'cubic-bezier(0.3, 0.7, 0.5, 1)' },
    );
    emoji.animate([{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], {
      ...timing,
      easing: 'linear',
    });
    flight.onfinish = () => emoji.remove();
    flight.oncancel = () => emoji.remove();
  }
}

/** A quick, settling side-to-side shake for a wrong guess. */
const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-7px)' },
  { transform: 'translateX(6px)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(3px)' },
  { transform: 'translateX(-1px)' },
  { transform: 'translateX(0)' },
];

export function GuessForm({ remainingAttempts, outcome, onGuess }: GuessFormProps) {
  const inputId = useId();
  const attemptsId = useId();
  const [value, setValue] = useState('');
  const field = useRef<HTMLDivElement>(null);
  const reactions = useRef<HTMLDivElement>(null);
  // Animate only an outcome reached during this visit; a decided day shows it straight away.
  const [outcomeOnArrival] = useState(outcome);
  const done = outcome !== 'playing';
  const animate = done && outcome !== outcomeOnArrival;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const guess = value.trim();
    if (!guess || done) return;
    const correct = onGuess(guess);
    setValue('');
    if (!correct) {
      // Wrong: the field shakes and 😱 float up (not with reduced motion); phones give a light double tap.
      wrongGuessHaptic();
      if (field.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        field.current.getAnimations().forEach((shake) => shake.cancel()); // quick guesses restart it
        field.current.animate(SHAKE, { duration: 420, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)' });
        if (reactions.current) releaseReactions(reactions.current, styles.reaction);
      }
    }
  };

  return (
    <div className={`${styles.wrap} ${done ? styles.done : ''} ${animate ? styles.animate : ''}`}>
      {/* Once the day is decided the field sinks into the void, keeping its place in the layout. */}
      <form className={styles.form} onSubmit={handleSubmit} inert={done} aria-hidden={done || undefined}>
        <div ref={field} className={styles.field}>
          <label className="visually-hidden" htmlFor={inputId}>
            Guess the movie
          </label>
          <input
            id={inputId}
            className={styles.input}
            type="text"
            placeholder="Guess the movie"
            autoComplete="off"
            enterKeyHint="send"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-describedby={attemptsId}
          />
          <button className={styles.submit} type="submit" aria-label="Submit guess">
            <img src={arrowRight} width={22} height={22} alt="" />
          </button>
        </div>
        <p id={attemptsId} className={styles.attempts} aria-live="polite">
          Remaining attempts: {remainingAttempts}
        </p>
      </form>

      {/* Wrong-guess 😱, outside the form so they keep rising while it fades. */}
      <div ref={reactions} className={styles.reactions} aria-hidden="true" />

      <p className={styles.outcome} role="status">
        {done ? OUTCOME_TEXT[outcome] : ''}
      </p>
    </div>
  );
}
