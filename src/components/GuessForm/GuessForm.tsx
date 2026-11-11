import { useId, useState, type FormEvent } from 'react';
import arrowRight from '../../assets/ui/arrow-right.svg';
import styles from './GuessForm.module.css';

interface GuessFormProps {
  remainingAttempts: number;
  onGuess: (guess: string) => void;
}

export function GuessForm({ remainingAttempts, onGuess }: GuessFormProps) {
  const inputId = useId();
  const attemptsId = useId();
  const [value, setValue] = useState('');
  const outOfAttempts = remainingAttempts <= 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const guess = value.trim();
    if (!guess || outOfAttempts) return;
    onGuess(guess);
    setValue('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={outOfAttempts}
          aria-describedby={attemptsId}
        />
        <button
          className={styles.submit}
          type="submit"
          aria-label="Submit guess"
          disabled={outOfAttempts}
        >
          <img src={arrowRight} width={22} height={22} alt="" />
        </button>
      </div>
      <p id={attemptsId} className={styles.attempts} aria-live="polite">
        Remaining attempts: {remainingAttempts}
      </p>
    </form>
  );
}
