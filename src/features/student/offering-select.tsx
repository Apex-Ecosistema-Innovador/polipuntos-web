'use client';

import { useMemo } from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Offering } from '@/types/api';

export const offeringToOption = (offering: Offering): ComboboxOption => ({
  value: offering.id,
  badge: offering.courseCode,
  label: offering.courseName,
  description: `${offering.teacher.fullName} · ${offering.term}`,
});

const baseProps = {
  searchPlaceholder: 'Código, asignatura o profesor',
  emptyMessage: 'No hay asignaturas que coincidan.',
};

interface MultipleProps {
  offerings: Offering[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  hint?: string;
}

export function OfferingMultiSelect({
  offerings,
  selectedIds,
  onChange,
  label = 'Asignaturas',
  hint,
}: MultipleProps) {
  const options = useMemo(() => offerings.map(offeringToOption), [offerings]);

  return (
    <Combobox
      {...baseProps}
      multiple
      label={label}
      hint={hint}
      placeholder="Buscar y elegir asignaturas"
      options={options}
      value={selectedIds}
      onChange={onChange}
    />
  );
}

interface AddProps {
  offerings: Offering[];
  onAdd: (id: string) => void;
  disabled?: boolean;
  label?: string;
}

export function OfferingAddSelect({ offerings, onAdd, disabled, label = 'Agregar asignatura' }: AddProps) {
  const options = useMemo(() => offerings.map(offeringToOption), [offerings]);

  return (
    <Combobox
      {...baseProps}
      label={label}
      placeholder="Buscar y agregar una asignatura"
      options={options}
      value=""
      disabled={disabled}
      onChange={onAdd}
    />
  );
}
