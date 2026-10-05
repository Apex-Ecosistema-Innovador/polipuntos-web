import Link from 'next/link';
import { RequiresConnection } from '@/components/feedback/requires-connection';
import { AuthLayout } from '@/components/layout/auth-layout';
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recupera tu contraseña"
      description="Ingresa tu correo institucional y te enviaremos un enlace para crear una nueva."
      footer={
        <span>
          ¿La recordaste? <Link href="/login">Ingresa</Link>
        </span>
      }
    >
      <RequiresConnection feature="La recuperación de contraseña">
        <ForgotPasswordForm />
      </RequiresConnection>
    </AuthLayout>
  );
}
