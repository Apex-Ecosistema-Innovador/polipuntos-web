import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Combobox, ComboboxOption } from './combobox';

const options: ComboboxOption[] = [
  { value: 'a', badge: '001', label: 'Algoritmos I', description: 'María Pérez · 2026-2' },
  { value: 'b', badge: '002', label: 'Algoritmos II', description: 'Juan Ríos · 2026-2' },
  { value: 'c', badge: '003', label: 'Estructuras de Datos', description: 'María Pérez · 2026-2' },
];

function Single({ onChange = () => undefined }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <Combobox
      label="Asignatura"
      options={options}
      value={value}
      emptyLabel="Todas"
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

function Multiple() {
  const [value, setValue] = useState<string[]>([]);
  return <Combobox multiple label="Asignaturas" options={options} value={value} onChange={setValue} />;
}

const open = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}\\b`) }));
const search = (text: string) => fireEvent.change(screen.getByRole('combobox'), { target: { value: text } });
const optionNames = () => screen.queryAllByRole('option').map((option) => option.textContent ?? '');

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe('Combobox', () => {
  it('keeps the list closed until it is opened', () => {
    render(<Single />);
    expect(screen.queryByRole('listbox')).toBeNull();
    open('Asignatura');
    expect(screen.getByRole('listbox')).toBeDefined();
  });

  it('filters by code, name, description and ignores accents', () => {
    render(<Single />);
    open('Asignatura');

    search('maria');
    expect(
      optionNames().filter((name) => name.includes('Algoritmos I') || name.includes('Estructuras')),
    ).toHaveLength(2);
    expect(optionNames().join('|')).not.toContain('Juan');

    search('003');
    expect(optionNames()).toEqual([expect.stringContaining('Estructuras de Datos')]);

    search('zzz');
    expect(screen.getByText('No hay resultados.')).toBeDefined();
  });

  it('selects with the mouse and closes the panel', () => {
    const onChange = vi.fn();
    render(<Single onChange={onChange} />);
    open('Asignatura');
    fireEvent.click(screen.getByRole('option', { name: /^002/ }));

    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('button', { name: /^Asignatura Algoritmos II/ })).toBeDefined();
  });

  it('supports keyboard navigation, Enter and Escape', () => {
    const onChange = vi.fn();
    render(<Single onChange={onChange} />);
    open('Asignatura');
    const input = screen.getByRole('combobox');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toMatch(/option-2$/);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith('b');

    open('Asignatura');
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('offers an empty choice to clear the selection', () => {
    const onChange = vi.fn();
    render(<Single onChange={onChange} />);
    open('Asignatura');
    fireEvent.click(screen.getByRole('option', { name: /^001/ }));
    open('Asignatura');
    fireEvent.click(screen.getByRole('option', { name: 'Todas' }));

    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('toggles several options, keeps the panel open and lists them as removable chips', () => {
    render(<Multiple />);
    open('Asignaturas');
    fireEvent.click(screen.getByRole('option', { name: /^001/ }));
    fireEvent.click(screen.getByRole('option', { name: /^003/ }));

    expect(screen.getByRole('listbox')).toBeDefined();
    const chips = within(screen.getByRole('list', { name: 'Asignaturas seleccionadas' }));
    expect(chips.getAllByRole('listitem')).toHaveLength(2);

    fireEvent.click(chips.getByRole('button', { name: 'Quitar Algoritmos I' }));
    expect(chips.getAllByRole('listitem')).toHaveLength(1);
  });

  it('caps the rendered rows for very long lists', () => {
    const many = Array.from({ length: 300 }, (_, index) => ({
      value: String(index),
      label: `Materia ${index}`,
    }));
    render(
      <Combobox label="Asignatura" options={many} value="" onChange={() => undefined} maxVisible={20} />,
    );
    open('Asignatura');

    expect(screen.getAllByRole('option')).toHaveLength(20);
    expect(screen.getByText(/Mostrando 20 de 300/)).toBeDefined();
  });
});
