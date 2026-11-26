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
      // Wrong: the field shakes (not with reduced motion) and phones give a light double tap.
      wrongGuessHaptic();
      if (field.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        field.current.getAnimations().forEach((shake) => shake.cancel()); // quick guesses restart it
        field.current.animate(SHAKE, { duration: 420, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)' });
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

      <p className={styles.outcome} role="status">
        {done ? OUTCOME_TEXT[outcome] : ''}
      </p>
    </div>
  );
}
