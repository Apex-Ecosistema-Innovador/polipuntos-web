'use client';

import { FormEvent, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { fieldErrors } from '@/features/auth/use-form-errors';
import { useAuth } from '@/features/auth/auth-context';
import { useQuery } from '@/hooks/use-query';
import { errorMessage, formatCedula, formatDateTime } from '@/lib/format';
import { adminService } from '@/lib/services';
import { Invite, UserStatus } from '@/types/api';
import styles from './admin-panel.module.scss';

const statusTone = { active: 'green', pending_approval: 'yellow', disabled: 'danger' } as const;

const statusLabel: Record<UserStatus, string> = {
  active: 'Activo',
  pending_approval: 'Pendiente',
  disabled: 'Deshabilitado',
};

export function AdminPanel() {
  const { user } = useAuth();
  const teachers = useQuery(() => adminService.teachers().then((response) => response.payload), []);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({ cedula: '', fullName: '', password: '' });
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  const changeStatus = async (id: string, approve: boolean) => {
    setBusyId(id);
    setError(null);
    try {
      await (approve ? adminService.approveTeacher(id) : adminService.disableTeacher(id));
      await teachers.reload();
    } catch (caught) {
      setError(errorMessage(caught));
    }
    setBusyId(null);
  };

  const createInvite = async () => {
    setError(null);
    try {
      setInvite(await adminService.createInvite(7));
    } catch (caught) {
      setError(errorMessage(caught));
    }
  };

  const createAdmin = async (event: FormEvent) => {
    event.preventDefault();
    setAdminErrors({});
    setAdminMessage(null);
    try {
      await adminService.createAdmin(adminForm);
      setAdminForm({ cedula: '', fullName: '', password: '' });
      setAdminMessage('Administrador creado');
    } catch (caught) {
      setAdminErrors(fieldErrors(caught));
      setError(errorMessage(caught));
    }
  };

  const updateAdmin = (key: keyof typeof adminForm) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setAdminForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div className={styles.layout}>
      {error && <Alert tone="error">{error}</Alert>}

      <section aria-labelledby="teachers" className={styles.section}>
        <h2 id="teachers" className={styles.title}>
          Profesores
        </h2>
        {teachers.loading && <Spinner />}
        {teachers.data && teachers.data.length === 0 && <EmptyState title="Sin profesores registrados" />}
        <ul className={styles.list}>
          {(teachers.data ?? []).map((teacher) => (
            <li key={teacher.id}>
              <Card className={styles.row}>
                <div className={styles.info}>
                  <strong>{teacher.fullName}</strong>
                  <span className={styles.meta}>{formatCedula(teacher.cedula)}</span>
                  <Badge tone={statusTone[teacher.status]}>{statusLabel[teacher.status]}</Badge>
                </div>
                <div className={styles.actions}>
                  {teacher.status !== 'active' && (
                    <Button loading={busyId === teacher.id} onClick={() => changeStatus(teacher.id, true)}>
                      Aprobar
                    </Button>
                  )}
                  {teacher.status !== 'disabled' && (
                    <Button
                      variant="danger"
                      loading={busyId === teacher.id}
                      onClick={() => changeStatus(teacher.id, false)}
                    >
                      Deshabilitar
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.side}>
        <section aria-labelledby="invites" className={styles.section}>
          <h2 id="invites" className={styles.title}>
            Invitaciones
          </h2>
          <p className={styles.meta}>Un código permite a un profesor registrarse sin aprobación manual.</p>
          <Button variant="secondary" onClick={createInvite} fullWidthOnMobile>
            Generar código (7 días)
          </Button>
          {invite && (
            <Card className={styles.invite}>
              <span className={styles.code}>{invite.code}</span>
              <span className={styles.meta}>Vence {formatDateTime(invite.expiresAt)}</span>
            </Card>
          )}
        </section>

        {user?.role === 'super_admin' && (
          <section aria-labelledby="admins" className={styles.section}>
            <h2 id="admins" className={styles.title}>
              Nuevo administrador
            </h2>
            <form className={styles.form} onSubmit={createAdmin}>
              {adminMessage && <Alert tone="success">{adminMessage}</Alert>}
              <TextField
                label="Cédula"
                mono
                value={adminForm.cedula}
                onChange={updateAdmin('cedula')}
                error={adminErrors.cedula}
                required
              />
              <TextField
                label="Nombre completo"
                value={adminForm.fullName}
                onChange={updateAdmin('fullName')}
                error={adminErrors.fullName}
                required
              />
              <TextField
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={adminForm.password}
                onChange={updateAdmin('password')}
                error={adminErrors.password}
                required
              />
              <Button type="submit" fullWidthOnMobile>
                Crear administrador
              </Button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
