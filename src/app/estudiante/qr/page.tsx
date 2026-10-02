import { PageHeading } from '@/components/ui/page-heading';
import { QrPanel } from '@/features/student/qr-panel';

export default function StudentQrPage() {
  return (
    <>
      <PageHeading
        eyebrow="Estudiante"
        title="Mi código QR"
        description="Tu profesor lo escanea para asignarte polipuntos."
      />
      <QrPanel />
    </>
  );
}
