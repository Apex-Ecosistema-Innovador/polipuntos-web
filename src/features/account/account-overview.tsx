'use client';

import { Card } from '@/components/ui/card';
import { roleLabels } from '@/content/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { formatCedula } from '@/lib/format';
import { ChangePasswordForm } from './change-password-form';
import styles from './account.module.scss';

export function AccountOverview() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className={styles.account}>
      <Card className={styles.profile}>
        <dl className={styles.details}>
          <div>
            <dt>Nombre</dt>
            <dd>{user.fullName}</dd>
          </div>
          <div>
            <dt>Cédula</dt>
            <dd className={styles.mono}>{formatCedula(user.cedula)}</dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd>{user.email ?? 'Sin correo registrado'}</dd>
          </div>
          <div>
            <dt>Rol</dt>
            <dd>{roleLabels[user.role]}</dd>
          </div>
        </dl>
      </Card>

      <section aria-labelledby="password" className={styles.section}>
        <h2 id="password" className={styles.title}>
          Cambiar contraseña
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
