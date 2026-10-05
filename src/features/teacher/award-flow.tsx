'use client';

import { FormEvent, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Initials } from '@/components/ui/initials';
import { SelectField, TextField } from '@/components/ui/text-field';
import { quickPoints, maxPointsPerAward } from '@/content/polipoints';
import { NetworkError } from '@/lib/api-client';
import { errorMessage, formatCedula } from '@/lib/format';
import { Roster } from '@/lib/offline/cache';
import { readQrSubject } from '@/lib/offline/qr-token';
import { recentAwards } from '@/lib/offline/recent-awards';
import { polipointService } from '@/lib/services';
import { Offering } from '@/types/api';
import { useConnectivity } from '../offline/connectivity-context';
import { useSync } from '../offline/sync-context';
import styles from './award-flow.module.scss';

const QrScanner = dynamic(() => import('./qr-scanner').then((module) => module.QrScanner), { ssr: false });

interface ScannedStudent {
  token: string;
  id: string;
  fullName: string | null;
  cedula: string | null;
  offerings: Offering[];
  total: number | null;
  verified: boolean;
}

const offeringLabel = (offering: Offering) => `${offering.courseCode} · ${offering.courseName}`;

function resolveOnDevice(token: string, roster: Roster | null): ScannedStudent | string {
  const studentId = readQrSubject(token);
  if (!studentId) return 'El código QR no es válido';
  if (!roster) return 'Aún no hay datos guardados en este dispositivo. Conéctate una vez para descargarlos.';

  const known = roster.students.find((student) => student.id === studentId);
  if (known) {
    return {
      token,
      id: known.id,
      fullName: known.fullName,
      cedula: known.cedula,
      offerings: roster.offerings.filter((offering) => known.offeringIds.includes(offering.id)),
      total: known.total,
      verified: true,
    };
  }

  return {
    token,
    id: studentId,
    fullName: null,
    cedula: null,
    offerings: roster.offerings,
    total: null,
    verified: false,
  };
}

export function AwardFlow() {
  const { online } = useConnectivity();
  const { roster, enqueue } = useSync();
  const [scan, setScan] = useState<ScannedStudent | null>(null);
  const [offeringId, setOfferingId] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  const offeringOptions = useMemo(
    () => (scan?.offerings ?? []).map((offering) => ({ value: offering.id, label: offeringLabel(offering) })),
    [scan],
  );

  const reset = () => {
    setScan(null);
    setOfferingId('');
    setPoints('');
    setReason('');
    setError(null);
    setDuplicateWarning(false);
  };

  const open = (student: ScannedStudent) => {
    setScan(student);
    setOfferingId(student.offerings.length === 1 ? student.offerings[0].id : '');
    setIdempotencyKey(crypto.randomUUID());
  };

  const scanOnServer = async (token: string) => {
    const result = await polipointService.scan(token);
    open({
      token,
      id: result.student.id,
      fullName: result.student.fullName,
      cedula: result.student.cedula,
      offerings: result.offerings,
      total: result.total,
      verified: true,
    });
  };

  const handleToken = async (token: string) => {
    if (scanning) return;
    setScanning(true);
    setError(null);
    setDone(null);

    try {
      if (!online) throw new NetworkError();
      await scanOnServer(token);
    } catch (caught) {
      if (caught instanceof NetworkError) {
        const local = resolveOnDevice(token, roster);
        if (typeof local === 'string') setError(local);
        else open(local);
      } else {
        setError(errorMessage(caught));
      }
    }
    setScanning(false);
  };

  const saveOffline = async (student: ScannedStudent, amount: number) => {
    const offering = student.offerings.find((entry) => entry.id === offeringId);
    await enqueue({
      id: idempotencyKey,
      qrToken: student.token,
      studentId: student.id,
      studentName: student.fullName,
      offeringId,
      offeringLabel: offering ? offeringLabel(offering) : offeringId,
      points: amount,
      reason: reason || undefined,
    });
    setDone(
      `Guardado en este dispositivo: ${amount} polipuntos para ${student.fullName ?? 'un estudiante sin verificar'}. Se enviarán al recuperar la conexión.`,
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!scan) return;
    const amount = Number(points);
    if (!Number.isInteger(amount) || amount < 1 || amount > maxPointsPerAward) {
      setError(`Ingresa una cantidad entre 1 y ${maxPointsPerAward}`);
      return;
    }
    if (!duplicateWarning && recentAwards.isRecent(scan.id, offeringId)) {
      setDuplicateWarning(true);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (!online) throw new NetworkError();
      await polipointService.award({
        studentId: scan.id,
        offeringId,
        points: amount,
        reason: reason || undefined,
        idempotencyKey,
      });
      setDone(`${amount} polipuntos asignados a ${scan.fullName ?? 'el estudiante'}`);
      recentAwards.record(scan.id, offeringId);
      reset();
    } catch (caught) {
      if (caught instanceof NetworkError) {
        try {
          await saveOffline(scan, amount);
          recentAwards.record(scan.id, offeringId);
          reset();
        } catch (storageError) {
          setError(errorMessage(storageError));
        }
      } else {
        setError(errorMessage(caught));
      }
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.flow}>
      {!online && (
        <Alert tone="info">
          Sin conexión: los polipuntos se guardan en este dispositivo y se envían al recuperar internet.
        </Alert>
      )}
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
            <Initials name={scan.fullName ?? '?'} size="lg" />
            <div className={styles.studentText}>
              <h2>{scan.fullName ?? 'Estudiante sin verificar'}</h2>
              {scan.cedula ? (
                <span className={styles.cedula}>{formatCedula(scan.cedula)}</span>
              ) : (
                <span className={styles.cedula}>ID {scan.id.slice(0, 8)}</span>
              )}
              {scan.total !== null && (
                <Badge tone="yellow">
                  {scan.total} polipuntos {online ? 'en total' : '· último total conocido, desactualizado'}
                </Badge>
              )}
              {!scan.verified && <Badge tone="danger">Sin verificar: se validará al sincronizar</Badge>}
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
                onChange={(event) => {
                  setOfferingId(event.target.value);
                  setDuplicateWarning(false);
                }}
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
              {duplicateWarning && (
                <Alert tone="info">
                  Acabas de asignar polipuntos a este estudiante en esta asignatura. Confirma si es un premio
                  distinto.
                </Alert>
              )}
              <div className={styles.actions}>
                <Button type="submit" loading={submitting} fullWidthOnMobile>
                  {duplicateWarning
                    ? 'Asignar de todos modos'
                    : online
                      ? 'Asignar polipuntos'
                      : 'Guardar sin conexión'}
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
