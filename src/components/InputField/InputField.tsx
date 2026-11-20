import type { ComponentProps } from 'react';
import styles from './InputField.module.css';

/**
 * Figma `InputField`: a 44px outlined text input. Set `--input-field-background`
 * on an ancestor to give it a fill (it is transparent by default).
 */
export function InputField({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={className ? `${styles.input} ${className}` : styles.input}
      type={type}
      {...props}
    />
  );
}
