'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Initials } from '@/components/ui/initials';
import { TextField } from '@/components/ui/text-field';
import { formatCedula } from '@/lib/format';
import { matchesStudent } from '@/lib/search';
import styles from './manual-student-search.module.scss';
import type { Roster, RosterStudent } from '@/types/offline';

const MAX_RESULTS = 8;

interface ManualStudentSearchProps {
  roster: Roster | null;
  initialQuery?: string;
  onSelect: (student: RosterStudent) => void;
}

export function ManualStudentSearch({ roster, initialQuery = '', onSelect }: ManualStudentSearchProps) {
  const [query, setQuery] = useState(initialQuery);

  if (!roster) {
    return (
      <Alert tone="info">
        Aún no hay estudiantes guardados en este dispositivo. Conéctate una vez para descargarlos.
      </Alert>
    );
  }

  const matches = roster.students.filter((student) =>
    matchesStudent(query, student.fullName, student.cedula),
  );
  const visible = matches.slice(0, MAX_RESULTS);

  return (
    <div className={styles.search}>
      <TextField
        label="Buscar por nombre o cédula"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />
      {visible.length === 0 ? (
        <p className={styles.muted}>No hay estudiantes que coincidan en tus asignaturas activas.</p>
      ) : (
        <ul className={styles.results}>
          {visible.map((student) => (
            <li key={student.id} className={styles.result}>
              <Initials name={student.fullName} />
              <div className={styles.text}>
                <span>{student.fullName}</span>
                <span className={styles.muted}>{formatCedula(student.cedula)}</span>
              </div>
              <Button variant="secondary" onClick={() => onSelect(student)}>
                Elegir
              </Button>
            </li>
          ))}
        </ul>
      )}
      {matches.length > visible.length && (
        <p className={styles.muted}>
          Mostrando {visible.length} de {matches.length}. Afina la búsqueda.
        </p>
      )}
    </div>
  );
}
