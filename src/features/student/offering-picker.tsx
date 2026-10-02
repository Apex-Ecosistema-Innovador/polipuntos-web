'use client';

import { useMemo, useState } from 'react';
import { TextField } from '@/components/ui/text-field';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { Offering } from '@/types/api';
import styles from './offering-picker.module.scss';

interface OfferingPickerProps {
  offerings: Offering[];
  selectedIds: string[];
  onToggle: (offeringId: string) => void;
  actionLabel?: (selected: boolean) => string;
  disabledIds?: string[];
}

const fold = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function OfferingPicker({
  offerings,
  selectedIds,
  onToggle,
  actionLabel,
  disabledIds = [],
}: OfferingPickerProps) {
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const needle = fold(search.trim());
    if (!needle) return offerings;
    return offerings.filter((offering) =>
      fold(`${offering.courseCode} ${offering.courseName} ${offering.teacher.fullName}`).includes(needle),
    );
  }, [offerings, search]);

  return (
    <div className={styles.picker}>
      <TextField
        label="Buscar asignatura o profesor"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Código, asignatura o profesor"
      />
      <ul className={styles.list}>
        {visible.map((offering) => {
          const selected = selectedIds.includes(offering.id);
          const disabled = disabledIds.includes(offering.id);
          return (
            <li key={offering.id}>
              <button
                type="button"
                className={cn(styles.option, selected && styles.selected)}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => onToggle(offering.id)}
              >
                <span className={styles.main}>
                  <Badge tone="yellow">{offering.courseCode}</Badge>
                  <span className={styles.name}>{offering.courseName}</span>
                </span>
                <span className={styles.meta}>
                  {offering.teacher.fullName} · {offering.term}
                </span>
                {actionLabel && <span className={styles.action}>{actionLabel(selected)}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 && <p className={styles.none}>No hay asignaturas que coincidan.</p>}
    </div>
  );
}
