import editPencil from '../../assets/ui/edit-pencil.svg';
import styles from './ListNameField.module.css';

interface ListNameFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Figma `InputField`: bordered while empty or focused ("Action"), and shown as
 * plain text with an edit pencil once it holds a name ("Filled").
 */
export function ListNameField({ id, value, onChange }: ListNameFieldProps) {
  return (
    <div className={styles.field}>
      <input
        id={id}
        className={styles.input}
        type="text"
        placeholder="List name"
        autoComplete="off"
        maxLength={60}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <img className={styles.pencil} src={editPencil} width={16} height={16} alt="" />
    </div>
  );
}
