import Link from 'next/link';
import { AuthLayout } from '@/components/layout/auth-layout';
import { RegisterTeacherForm } from '@/features/auth/register-teacher-form';

export default function RegisterTeacherPage() {
  return (
    <AuthLayout
      title="Cuenta de profesor"
      description="Registra tu cuenta para asignar polipuntos a tus estudiantes."
      footer={
        <span>
          ¿Ya tienes cuenta? <Link href="/login">Ingresa</Link>
        </span>
      }
    >
      <RegisterTeacherForm />
    </AuthLayout>
  );
}
