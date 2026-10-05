import { RequiresConnection } from '@/components/feedback/requires-connection';
import { AuthLayout } from '@/components/layout/auth-layout';
import { ResetPasswordForm } from '@/features/auth/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Nueva contraseña" description="Elige una contraseña nueva para tu cuenta.">
      <RequiresConnection feature="El restablecimiento de contraseña">
        <ResetPasswordForm />
      </RequiresConnection>
    </AuthLayout>
  );
}
