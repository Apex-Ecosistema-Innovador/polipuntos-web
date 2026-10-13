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
