import editPencil from '../../assets/ui/edit-pencil.svg';
import styles from './ListNameField.module.css';

interface ListNameFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Called when Enter confirms the name; without it, Enter just leaves the field. */
  onEnter?: () => void;
}

/**
 * Figma `InputField`: bordered while empty or focused ("Action"), and shown as
 * plain text with an edit pencil once it holds a name ("Filled").
 */
export function ListNameField({ id, value, onChange, onEnter }: ListNameFieldProps) {
  return (
    <div className={styles.field}>
      <input
        id={id}
        className={styles.input}
        type="text"
        placeholder="e.g. Winter movies for Ana"
        autoComplete="off"
        enterKeyHint="next"
        maxLength={60}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
          event.preventDefault();
          if (onEnter) onEnter();
          else event.currentTarget.blur();
        }}
      />
      <img className={styles.pencil} src={editPencil} width={16} height={16} alt="" />
    </div>
  );
}
