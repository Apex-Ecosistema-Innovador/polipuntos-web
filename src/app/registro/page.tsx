import { RequiresConnection } from '@/components/feedback/requires-connection';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/auth-layout';
import { RegisterStudentForm } from '@/features/auth/register-student-form';

export default function RegisterStudentPage() {
  return (
    <AuthLayout
      title="Crea tu cuenta"
      description="Tu cédula es tu identidad. Elige las asignaturas que cursas; puedes agregar más después."
      footer={
        <span>
          ¿Ya tienes cuenta? <Link href="/login">Ingresa</Link>
        </span>
      }
    >
      <RequiresConnection feature="El registro">
        <RegisterStudentForm />
      </RequiresConnection>
    </AuthLayout>
  );
}
