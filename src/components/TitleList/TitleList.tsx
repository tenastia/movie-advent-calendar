import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import dragHandle from '../../assets/ui/drag-handle.svg';
import { getCountdownRange } from '../../lib/calendar';
import styles from './TitleList.module.css';

interface TitleListProps {
  /** Number of calendar days, counting down to Christmas Eve. */
  days: number;
  /** Movie titles, index 0 = 1 December. */
  titles: readonly string[];
  onChangeTitle: (index: number, title: string) => void;
  /** Move the title at index `from` to index `to`, shifting the ones in between. */
  onMove: (from: number, to: number) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function TitleList({ days, titles, onChangeTitle, onMove }: TitleListProps) {
  const hintId = useId();
  const { first } = getCountdownRange(days);
  // Drag and focus state below is by row (0 = the first day shown).
  // Rows only become draggable while their handle is pressed, so text in the
  // inputs can still be selected with the mouse.
  const [armed, setArmed] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const handles = useRef<(HTMLButtonElement | null)[]>([]);
  const focusAfterMove = useRef<number | null>(null);

  useEffect(() => {
    if (focusAfterMove.current === null) return;
    handles.current[focusAfterMove.current]?.focus();
    focusAfterMove.current = null;
  });

  const move = (fromRow: number, toRow: number, refocus: boolean) => {
    if (toRow < 0 || toRow >= days || fromRow === toRow) return;
    onMove(first - 1 + fromRow, first - 1 + toRow);
    if (refocus) focusAfterMove.current = toRow;
    setAnnouncement(`Moved to December ${first + toRow}`);
  };

  const resetDrag = () => {
    setArmed(null);
    setDragFrom(null);
    setDragOver(null);
  };

  const handleDragStart = (event: DragEvent<HTMLLIElement>, row: number) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(row));
    setDragFrom(row);
  };

  const handleDragOver = (event: DragEvent<HTMLLIElement>, row: number) => {
    if (dragFrom === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOver(row);
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, row: number) => {
    event.preventDefault();
    if (dragFrom !== null) move(dragFrom, row, false);
    resetDrag();
  };

  return (
    <div className={styles.wrapper}>
      <ol className={styles.list}>
        {Array.from({ length: days }, (_, row) => {
          const day = first + row;
          const index = day - 1;
          const rowClass = [
            styles.row,
            dragFrom === row ? styles.dragging : '',
            dragOver === row && dragFrom !== row ? styles.dropTarget : '',
          ].join(' ');

          return (
            <li
              key={day}
              className={rowClass}
              draggable={armed === row}
              onDragStart={(event) => handleDragStart(event, row)}
              onDragOver={(event) => handleDragOver(event, row)}
              onDrop={(event) => handleDrop(event, row)}
              onDragEnd={resetDrag}
            >
              <div className={styles.date} aria-hidden="true">
                <span className={styles.dayNumber}>{pad(day)}</span>
                <span className={styles.month}>DEC</span>
              </div>
              <input
                className={styles.input}
                type="text"
                placeholder={`Enter movie title for Dec ${day}`}
                aria-label={`Movie title for December ${day}`}
                autoComplete="off"
                value={titles[index] ?? ''}
                onChange={(event) => onChangeTitle(index, event.target.value)}
              />
              <button
                ref={(element) => {
                  handles.current[row] = element;
                }}
                type="button"
                className={styles.handle}
                aria-label={`Reorder December ${day}`}
                aria-describedby={hintId}
                onPointerDown={() => setArmed(row)}
                onPointerUp={() => setArmed(null)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    move(row, row - 1, true);
                  } else if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    move(row, row + 1, true);
                  }
                }}
              >
                <img src={dragHandle} width={17} height={9} alt="" />
              </button>
            </li>
          );
        })}
      </ol>

      <p className={styles.scrollHint} aria-hidden="true">
        Scroll
      </p>
      <p id={hintId} className="visually-hidden">
        Drag, or press the up and down arrow keys, to move this title to another day.
      </p>
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </div>
  );
}
