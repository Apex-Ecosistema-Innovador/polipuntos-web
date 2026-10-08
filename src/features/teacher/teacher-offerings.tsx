'use client';

import { FormEvent, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { TextField } from '@/components/ui/text-field';
import { useQuery } from '@/hooks/use-query';
import { fieldErrors } from '@/features/auth/use-form-errors';
import { errorMessage } from '@/lib/format';
import { offeringService } from '@/lib/services';
import {
  courseCodeError,
  courseNameError,
  firstError,
  sanitizeCourseCode,
  sanitizeTerm,
  termError,
} from '@/lib/validation';
import styles from './teacher-offerings.module.scss';

const emptyForm = { courseCode: '', courseName: '', term: '' };

export function TeacherOfferings() {
  const offerings = useQuery(() => offeringService.listMine(), []);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const update =
    (key: keyof typeof emptyForm, clean: (value: string) => string) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [key]: clean(event.target.value) }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const problems = firstError({
      courseCode: courseCodeError(form.courseCode),
      courseName: courseNameError(form.courseName),
      term: termError(form.term),
    });
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await offeringService.create({ ...form, courseName: form.courseName.trim() });
      setForm(emptyForm);
      setOverrides({});
      await offerings.reload();
    } catch (caught) {
      setErrors(fieldErrors(caught));
      setError(errorMessage(caught));
    }
    setSubmitting(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    setBusyId(id);
    setError(null);
    setOverrides((current) => ({ ...current, [id]: active }));
    try {
      await offeringService.update(id, { active });
    } catch (caught) {
      setOverrides((current) => ({ ...current, [id]: !active }));
      setError(errorMessage(caught));
    }
    setBusyId(null);
  };

  return (
    <div className={styles.layout}>
      <section aria-labelledby="new-offering" className={styles.section}>
        <h2 id="new-offering" className={styles.title}>
          Nueva asignatura
        </h2>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <Alert tone="error">{error}</Alert>}
          <TextField
            label="Código"
            mono
            placeholder="ING001"
            hint="Solo letras mayúsculas y números, sin guiones."
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={30}
            value={form.courseCode}
            onChange={update('courseCode', sanitizeCourseCode)}
            error={errors.courseCode}
            required
          />
          <TextField
            label="Nombre"
            maxLength={150}
            value={form.courseName}
            onChange={update('courseName', (value) => value.replace(/^\s+/, '').replace(/\s{2,}/g, ' '))}
            error={errors.courseName}
            required
          />
          <TextField
            label="Periodo"
            mono
            placeholder="2026-2"
            hint="Año y semestre, por ejemplo 2026-2 o 2027-1."
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={form.term}
            onChange={update('term', sanitizeTerm)}
            error={errors.term}
            required
          />
          <Button type="submit" loading={submitting} fullWidthOnMobile>
            Crear asignatura
          </Button>
        </form>
      </section>

      <section aria-labelledby="my-offerings" className={styles.section}>
        <h2 id="my-offerings" className={styles.title}>
          Mis asignaturas
        </h2>
        {!offerings.data && offerings.loading && <Spinner />}
        {offerings.data && offerings.data.length === 0 && (
          <EmptyState
            title="Sin asignaturas"
            description="Crea una para que tus estudiantes puedan inscribirse."
          />
        )}
        <ul className={styles.list}>
          {(offerings.data ?? []).map((offering) => {
            const active = overrides[offering.id] ?? offering.active;
            return (
              <li key={offering.id}>
                <Card className={styles.row}>
                  <div className={styles.info}>
                    <div className={styles.tags}>
                      <Badge tone="yellow">{offering.courseCode}</Badge>
                    </div>
                    <strong>{offering.courseName}</strong>
                    <span className={styles.meta}>{offering.term}</span>
                  </div>
                  <Switch
                    checked={active}
                    disabled={busyId === offering.id}
                    onChange={(next) => toggleActive(offering.id, next)}
                    label={`Asignatura ${offering.courseCode}`}
                    onLabel="Activa"
                    offLabel="Inactiva"
                  />
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
