import { RequiresConnection } from '@/components/feedback/requires-connection';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/auth-layout';
import { GuestRedirect } from '@/features/auth/guest-redirect';
import { LoginForm } from '@/features/auth/login-form';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Ingresar"
      description="Accede con tu cédula para ver o asignar polipuntos."
      footer={
        <>
          <span>
            ¿Eres estudiante? <Link href="/registro">Crea tu cuenta</Link>
          </span>
          <span>
            ¿Eres profesor? <Link href="/registro-profesor">Regístrate aquí</Link>
          </span>
        </>
      }
    >
      <RequiresConnection feature="Iniciar sesión">
        <GuestRedirect />
        <LoginForm />
      </RequiresConnection>
    </AuthLayout>
  );
}
