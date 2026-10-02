'use client';

import { FormEvent, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { useQuery } from '@/hooks/use-query';
import { fieldErrors } from '@/features/auth/use-form-errors';
import { errorMessage } from '@/lib/format';
import { offeringService } from '@/lib/services';
import styles from './teacher-offerings.module.scss';

const emptyForm = { courseCode: '', courseName: '', term: '' };

export function TeacherOfferings() {
  const offerings = useQuery(() => offeringService.listMine(), []);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const update = (key: keyof typeof emptyForm) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setErrors({});
    try {
      await offeringService.create(form);
      setForm(emptyForm);
      await offerings.reload();
    } catch (caught) {
      setErrors(fieldErrors(caught));
      setError(errorMessage(caught));
    }
    setSubmitting(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    setBusyId(id);
    try {
      await offeringService.update(id, { active: !active });
      await offerings.reload();
    } catch (caught) {
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
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <Alert tone="error">{error}</Alert>}
          <TextField
            label="Código"
            mono
            value={form.courseCode}
            onChange={update('courseCode')}
            error={errors.courseCode}
            required
          />
          <TextField
            label="Nombre"
            value={form.courseName}
            onChange={update('courseName')}
            error={errors.courseName}
            required
          />
          <TextField
            label="Periodo"
            mono
            placeholder="2026-2"
            value={form.term}
            onChange={update('term')}
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
        {offerings.loading && <Spinner />}
        {offerings.data && offerings.data.length === 0 && (
          <EmptyState
            title="Sin asignaturas"
            description="Crea una para que tus estudiantes puedan inscribirse."
          />
        )}
        <ul className={styles.list}>
          {(offerings.data ?? []).map((offering) => (
            <li key={offering.id}>
              <Card className={styles.row}>
                <div className={styles.info}>
                  <div className={styles.tags}>
                    <Badge tone="yellow">{offering.courseCode}</Badge>
                    <Badge tone={offering.active ? 'green' : 'neutral'}>
                      {offering.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <strong>{offering.courseName}</strong>
                  <span className={styles.meta}>{offering.term}</span>
                </div>
                <Button
                  variant="secondary"
                  loading={busyId === offering.id}
                  onClick={() => toggleActive(offering.id, offering.active)}
                >
                  {offering.active ? 'Desactivar' : 'Activar'}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
