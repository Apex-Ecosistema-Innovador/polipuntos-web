'use client';

import { FormEvent, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Initials } from '@/components/ui/initials';
import { SelectField, TextField } from '@/components/ui/text-field';
import { errorMessage, formatCedula } from '@/lib/format';
import { polipointService } from '@/lib/services';
import { quickPoints, maxPointsPerAward } from '@/content/polipoints';
import { ScanResult } from '@/types/api';
import styles from './award-flow.module.scss';

const QrScanner = dynamic(() => import('./qr-scanner').then((module) => module.QrScanner), { ssr: false });

export function AwardFlow() {
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [offeringId, setOfferingId] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);

  const offeringOptions = useMemo(
    () =>
      (scan?.offerings ?? []).map((offering) => ({
        value: offering.id,
        label: `${offering.courseCode} · ${offering.courseName}`,
      })),
    [scan],
  );

  const reset = () => {
    setScan(null);
    setOfferingId('');
    setPoints('');
    setReason('');
    setError(null);
  };

  const handleToken = async (token: string) => {
    if (scanning) return;
    setScanning(true);
    setError(null);
    setDone(null);
    try {
      const result = await polipointService.scan(token);
      setScan(result);
      setOfferingId(result.offerings.length === 1 ? result.offerings[0].id : '');
      setIdempotencyKey(crypto.randomUUID());
    } catch (caught) {
      setError(errorMessage(caught));
    }
    setScanning(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!scan) return;
    const amount = Number(points);
    if (!Number.isInteger(amount) || amount < 1 || amount > maxPointsPerAward) {
      setError(`Ingresa una cantidad entre 1 y ${maxPointsPerAward}`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await polipointService.award({
        studentId: scan.student.id,
        offeringId,
        points: amount,
        reason: reason || undefined,
        idempotencyKey,
      });
      setDone(`${amount} polipuntos asignados a ${scan.student.fullName}`);
      reset();
    } catch (caught) {
      setError(errorMessage(caught));
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.flow}>
      {done && <Alert tone="success">{done}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      {!scan && (
        <div className={styles.scanner}>
          <QrScanner onToken={handleToken} />
          <p className={styles.help}>Apunta la cámara al código QR del estudiante.</p>
        </div>
      )}

      {scan && (
        <Card className={styles.card}>
          <div className={styles.student}>
            <Initials name={scan.student.fullName} size="lg" />
            <div className={styles.studentText}>
              <h2>{scan.student.fullName}</h2>
              <span className={styles.cedula}>{formatCedula(scan.student.cedula)}</span>
              <Badge tone="yellow">{scan.total} polipuntos en total</Badge>
            </div>
          </div>

          {scan.offerings.length === 0 ? (
            <Alert tone="error">
              Este estudiante no está inscrito en ninguna de tus asignaturas activas.
            </Alert>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <SelectField
                label="Asignatura"
                value={offeringId}
                onChange={(event) => setOfferingId(event.target.value)}
                options={offeringOptions}
                placeholder="Selecciona una asignatura"
                required
              />
              <div className={styles.chips} role="group" aria-label="Cantidades rápidas">
                {quickPoints.map((value) => (
                  <Button
                    key={value}
                    variant={points === String(value) ? 'primary' : 'secondary'}
                    onClick={() => setPoints(String(value))}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <TextField
                label="Polipuntos"
                mono
                type="number"
                inputMode="numeric"
                min={1}
                max={maxPointsPerAward}
                value={points}
                onChange={(event) => setPoints(event.target.value)}
                required
              />
              <TextField
                label="Motivo (opcional)"
                maxLength={255}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <div className={styles.actions}>
                <Button type="submit" loading={submitting} fullWidthOnMobile>
                  Asignar polipuntos
                </Button>
                <Button variant="ghost" onClick={reset} fullWidthOnMobile>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
          {scan.offerings.length === 0 && (
            <Button variant="secondary" onClick={reset}>
              Escanear otro
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
