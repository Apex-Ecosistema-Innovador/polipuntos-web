'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { SelectField, TextField } from '@/components/ui/text-field';
import {
  registrationStatusLabel,
  registrationStatusOptions,
  registrationStatusTone,
  verificationOptions,
} from '@/content/hackathon';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useQuery } from '@/hooks/use-query';
import { formatDateTime } from '@/lib/format';
import { hackathonAdminService } from '@/lib/services';
import type { HackathonRegistration } from '@/types/api';
import styles from './hackathon-registrations.module.scss';

const PAGE_SIZE = 20;

const asLink = (value: string) => (/^https?:\/\//i.test(value) ? value : null);

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.detail}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ExternalValue({ value }: { value: string | null }) {
  if (!value) return <>—</>;
  const href = asLink(value);
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {value}
    </a>
  ) : (
    <>{value}</>
  );
}

function RegistrationCard({ registration }: { registration: HackathonRegistration }) {
  const verified = Boolean(registration.correoVerificadoEn);
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <strong>{registration.nombre}</strong>
          <span className={styles.meta}>{registration.correo}</span>
        </div>
        <div className={styles.badges}>
          <Badge tone={registrationStatusTone[registration.estado]}>
            {registrationStatusLabel[registration.estado]}
          </Badge>
          <Badge tone={verified ? 'green' : 'neutral'}>{verified ? 'Correo verificado' : 'Sin verificar'}</Badge>
        </div>
      </div>
      <p className={styles.meta}>
        {registration.institucion} · {registration.programa} · Semestre {registration.semestre}
      </p>
      <details className={styles.more}>
        <summary>Ver todos los datos</summary>
        <dl className={styles.details}>
          <Detail label="Inscrito">{formatDateTime(registration.creadoEn)}</Detail>
          <Detail label="Correo verificado el">
            {registration.correoVerificadoEn ? formatDateTime(registration.correoVerificadoEn) : '—'}
          </Detail>
          <Detail label="Nivel de experiencia">{registration.nivelExperiencia ?? '—'}</Detail>
          <Detail label="Tecnologías">
            {registration.tecnologias.length > 0 ? registration.tecnologias.join(', ') : '—'}
          </Detail>
          <Detail label="GitHub">{registration.github ?? '—'}</Detail>
          <Detail label="LinkedIn">
            <ExternalValue value={registration.linkedin} />
          </Detail>
          <Detail label="Portafolio">
            <ExternalValue value={registration.portafolio} />
          </Detail>
          <Detail label="Autoriza uso de imagen">{registration.consientePublicacionImagen ? 'Sí' : 'No'}</Detail>
          <Detail label="Reglamento aceptado">
            v{registration.reglamentoVersion} · {formatDateTime(registration.aceptadoEn)}
          </Detail>
          <Detail label="Autorización de datos">v{registration.datosVersion}</Detail>
        </dl>
      </details>
    </Card>
  );
}

export function HackathonRegistrations() {
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [verificado, setVerificado] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const summary = useQuery(() => hackathonAdminService.summary(), []);
  const registrations = useQuery(
    () =>
      hackathonAdminService.registrations({
        q: debouncedSearch || undefined,
        estado: estado || undefined,
        verificado: verificado || undefined,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, estado, verificado, page],
  );

  const reset = (apply: () => void) => {
    apply();
    setPage(1);
  };

  return (
    <div className={styles.layout}>
      {(summary.error || registrations.error) && <Alert tone="error">{summary.error ?? registrations.error}</Alert>}

      {summary.data && (
        <ul className={styles.stats} aria-label="Resumen">
          <li>
            <span className={styles.statValue}>{summary.data.total}</span>
            <span className={styles.meta}>Inscritos</span>
          </li>
          <li>
            <span className={styles.statValue}>{summary.data.verificadas}</span>
            <span className={styles.meta}>Con correo verificado</span>
          </li>
          {registrationStatusOptions.map((option) => (
            <li key={option.value}>
              <span className={styles.statValue}>
                {summary.data!.porEstado[option.value as keyof typeof summary.data.porEstado]}
              </span>
              <span className={styles.meta}>{option.label}</span>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.filters}>
        <TextField
          label="Buscar"
          placeholder="Nombre, correo, institución o programa"
          value={search}
          onChange={(event) => reset(() => setSearch(event.target.value))}
        />
        <SelectField
          label="Estado"
          placeholder="Todos"
          options={registrationStatusOptions}
          value={estado}
          onChange={(event) => reset(() => setEstado(event.target.value))}
        />
        <SelectField
          label="Correo"
          placeholder="Todos"
          options={verificationOptions}
          value={verificado}
          onChange={(event) => reset(() => setVerificado(event.target.value))}
        />
      </div>

      {!registrations.data && registrations.loading && <Spinner />}
      {registrations.data && registrations.data.items.length === 0 && (
        <EmptyState title="No hay inscripciones con estos filtros" />
      )}
      <ul className={styles.list}>
        {(registrations.data?.items ?? []).map((registration) => (
          <li key={registration.id}>
            <RegistrationCard registration={registration} />
          </li>
        ))}
      </ul>
      {registrations.data && registrations.data.total > PAGE_SIZE && (
        <Pagination page={page} limit={PAGE_SIZE} total={registrations.data.total} onChange={setPage} />
      )}
    </div>
  );
}
