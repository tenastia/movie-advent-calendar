import { useId, useState, type FormEvent } from 'react';
import arrowRight from '../../assets/ui/arrow-right.svg';
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
  onGuess: (guess: string) => void;
}

export function GuessForm({ remainingAttempts, outcome, onGuess }: GuessFormProps) {
  const inputId = useId();
  const attemptsId = useId();
  const [value, setValue] = useState('');
  // Animate only an outcome reached during this visit; a decided day shows it straight away.
  const [outcomeOnArrival] = useState(outcome);
  const done = outcome !== 'playing';
  const animate = done && outcome !== outcomeOnArrival;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const guess = value.trim();
    if (!guess || done) return;
    onGuess(guess);
    setValue('');
  };

  return (
    <div className={`${styles.wrap} ${done ? styles.done : ''} ${animate ? styles.animate : ''}`}>
      {/* Once the day is decided the field sinks into the void, keeping its place in the layout. */}
      <form className={styles.form} onSubmit={handleSubmit} inert={done} aria-hidden={done || undefined}>
        <div className={styles.field}>
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
