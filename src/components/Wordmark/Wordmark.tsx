import styles from './Wordmark.module.css';

export function Wordmark() {
  return (
    <h1 className={styles.wordmark}>
      <span className={styles.sans}>movie</span>
      <span className={styles.script}>Advent</span>
      <span className={styles.sans}>calendar</span>
    </h1>
  );
}
