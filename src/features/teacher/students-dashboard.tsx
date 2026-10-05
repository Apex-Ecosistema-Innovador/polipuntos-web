'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Initials } from '@/components/ui/initials';
import { Pagination } from '@/components/ui/pagination';
import { Combobox } from '@/components/ui/combobox';
import { SelectField, TextField } from '@/components/ui/text-field';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useQuery } from '@/hooks/use-query';
import { errorMessage, formatCedula } from '@/lib/format';
import { DashboardFilters, dashboardService, offeringService } from '@/lib/services';
import styles from './students-dashboard.module.scss';

const PAGE_SIZE = 20;

const sortOptions = [
  { value: 'name:asc', label: 'Nombre (A-Z)' },
  { value: 'name:desc', label: 'Nombre (Z-A)' },
  { value: 'points:desc', label: 'Más polipuntos' },
  { value: 'points:asc', label: 'Menos polipuntos' },
  { value: 'cedula:asc', label: 'Cédula' },
];

const toNumber = (value: string) => (value === '' ? undefined : Number(value));

export function StudentsDashboard() {
  const [offeringId, setOfferingId] = useState('');
  const [search, setSearch] = useState('');
  const [minPoints, setMinPoints] = useState('');
  const [maxPoints, setMaxPoints] = useState('');
  const [sortValue, setSortValue] = useState('name:asc');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const debouncedMin = useDebouncedValue(minPoints);
  const debouncedMax = useDebouncedValue(maxPoints);
  const [sort, order] = sortValue.split(':') as [DashboardFilters['sort'], DashboardFilters['order']];

  const filters: DashboardFilters = {
    offeringId: offeringId || undefined,
    q: debouncedSearch || undefined,
    minPoints: toNumber(debouncedMin),
    maxPoints: toNumber(debouncedMax),
    sort,
    order,
    page,
    limit: PAGE_SIZE,
  };

  const offerings = useQuery(() => offeringService.listMine(), []);
  const students = useQuery(
    () => dashboardService.students(filters),
    [offeringId, debouncedSearch, debouncedMin, debouncedMax, sortValue, page],
  );

  const onFilter =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await dashboardService.exportCsv({ ...filters, page: undefined, limit: undefined });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'polipuntos.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setExportError(errorMessage(caught));
    }
    setExporting(false);
  };

  const rows = students.data?.payload ?? [];
  const total = students.data?.total ?? 0;

  return (
    <div className={styles.dashboard}>
      <div className={styles.filters}>
        <Combobox
          label="Asignatura"
          value={offeringId}
          onChange={onFilter(setOfferingId)}
          emptyLabel="Todas"
          placeholder="Todas"
          searchPlaceholder="Código o nombre"
          emptyMessage="No hay asignaturas que coincidan."
          options={(offerings.data ?? []).map((offering) => ({
            value: offering.id,
            badge: offering.courseCode,
            label: offering.courseName,
            description: offering.term,
          }))}
        />
        <TextField
          label="Buscar"
          placeholder="Nombre o cédula"
          value={search}
          onChange={(event) => onFilter(setSearch)(event.target.value)}
        />
        <TextField
          label="Mín. polipuntos"
          type="number"
          min={0}
          mono
          value={minPoints}
          onChange={(event) => onFilter(setMinPoints)(event.target.value)}
        />
        <TextField
          label="Máx. polipuntos"
          type="number"
          min={0}
          mono
          value={maxPoints}
          onChange={(event) => onFilter(setMaxPoints)(event.target.value)}
        />
        <SelectField
          label="Ordenar por"
          value={sortValue}
          onChange={(event) => onFilter(setSortValue)(event.target.value)}
          options={sortOptions}
        />
      </div>

      <div className={styles.toolbar}>
        <span className={styles.count} aria-live="polite">
          {total} {total === 1 ? 'registro' : 'registros'}
        </span>
        <Button variant="secondary" onClick={handleExport} loading={exporting} disabled={total === 0}>
          Exportar CSV
        </Button>
      </div>

      {exportError && <Alert tone="error">{exportError}</Alert>}
      {students.error && <Alert tone="error">{students.error}</Alert>}
      {students.loading && rows.length === 0 && <Spinner />}

      {!students.loading && rows.length === 0 && !students.error && (
        <EmptyState
          title="Sin estudiantes"
          description="Cuando tus estudiantes se inscriban en tus asignaturas aparecerán aquí."
        />
      )}

      {rows.length > 0 && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Estudiante</th>
                <th scope="col">Cédula</th>
                <th scope="col">Asignatura</th>
                <th scope="col" className={styles.numeric}>
                  Polipuntos
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.studentId}-${row.offeringId}`}>
                  <td>
                    <Link href={`/profesor/estudiantes/${row.studentId}`} className={styles.student}>
                      <Initials name={row.fullName} />
                      <span>{row.fullName}</span>
                    </Link>
                  </td>
                  <td className={styles.mono} data-label="Cédula">
                    {formatCedula(row.cedula)}
                  </td>
                  <td data-label="Asignatura">
                    <Badge tone="yellow">{row.courseCode}</Badge> {row.courseName}
                  </td>
                  <td className={`${styles.numeric} ${styles.points}`} data-label="Polipuntos">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} limit={PAGE_SIZE} total={total} onChange={setPage} />
        </>
      )}
    </div>
  );
}
