'use client';

import { KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { normalizeSearch } from '@/lib/search';
import { Badge } from './badge';
import { FieldShell } from './text-field';
import styles from './combobox.module.scss';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  searchText?: string;
  disabled?: boolean;
}

interface BaseProps {
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  maxVisible?: number;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
  emptyLabel?: string;
}

interface MultipleProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

type ComboboxProps = SingleProps | MultipleProps;

const DEFAULT_MAX_VISIBLE = 50;

const haystack = (option: ComboboxOption) =>
  normalizeSearch(
    [option.badge, option.label, option.description, option.searchText].filter(Boolean).join(' '),
  );

export function Combobox(props: ComboboxProps) {
  const {
    label,
    options,
    placeholder = 'Selecciona una opción',
    searchPlaceholder = 'Buscar…',
    emptyMessage = 'No hay resultados.',
    hint,
    error,
    disabled,
    maxVisible = DEFAULT_MAX_VISIBLE,
  } = props;
  const multiple = props.multiple === true;
  const emptyLabel = props.multiple ? undefined : props.emptyLabel;
  const selectedValues = props.multiple ? props.value : props.value ? [props.value] : [];

  const id = useId();
  const listId = `${id}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const indexed = useMemo(() => options.map((option) => ({ option, text: haystack(option) })), [options]);

  const matches = useMemo(() => {
    const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
    return indexed
      .filter(({ text }) => terms.every((term) => text.includes(term)))
      .map(({ option }) => option);
  }, [indexed, query]);

  const visible = matches.slice(0, maxVisible);
  const rows =
    emptyLabel !== undefined && !query
      ? [{ value: '', label: emptyLabel } as ComboboxOption, ...visible]
      : visible;
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));
  const current = rows[Math.min(active, Math.max(rows.length - 1, 0))];

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    panelRef.current?.scrollIntoView({ block: 'nearest' });
    const handlePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);

  const openPanel = () => {
    if (disabled) return;
    setQuery('');
    setActive(
      Math.max(
        rows.findIndex((row) => selectedValues.includes(row.value) && row.value !== ''),
        0,
      ),
    );
    setOpen(true);
  };

  const closePanel = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const choose = (option: ComboboxOption | undefined) => {
    if (!option || option.disabled) return;
    if (props.multiple) {
      props.onChange(
        selectedValues.includes(option.value)
          ? selectedValues.filter((value) => value !== option.value)
          : [...selectedValues, option.value],
      );
      return;
    }
    props.onChange(option.value);
    closePanel();
  };

  const remove = (value: string) => {
    if (props.multiple) props.onChange(selectedValues.filter((item) => item !== value));
  };

  const handleInputKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    const last = rows.length - 1;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (index >= last ? 0 : index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (index <= 0 ? last : index - 1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(Math.max(last, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(current);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
    } else if (event.key === 'Tab') {
      closePanel(false);
    }
  };

  const handleTriggerKeys = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openPanel();
    }
  };

  const summary = multiple
    ? selectedOptions.length > 0
      ? `${selectedOptions.length} ${selectedOptions.length === 1 ? 'seleccionada' : 'seleccionadas'}`
      : null
    : (selectedOptions[0]?.label ?? null);

  return (
    <FieldShell label={label} hint={hint} error={error} id={id}>
      <div ref={rootRef} className={styles.root}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className={cn(styles.trigger, error && styles.invalid, open && styles.open)}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={disabled}
          onClick={() => (open ? closePanel() : openPanel())}
          onKeyDown={handleTriggerKeys}
        >
          {!multiple && selectedOptions[0]?.badge && <Badge tone="yellow">{selectedOptions[0].badge}</Badge>}
          <span id={`${id}-value`} className={cn(styles.value, !summary && styles.placeholder)}>
            {summary ?? placeholder}
          </span>
          <span className={styles.chevron} aria-hidden="true" />
        </button>

        {open && (
          <div ref={panelRef} className={styles.panel}>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              className={styles.search}
              aria-label={`Buscar en ${label}`}
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={
                rows.length > 0 ? `${id}-option-${Math.min(active, rows.length - 1)}` : undefined
              }
              aria-autocomplete="list"
              autoComplete="off"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={handleInputKeys}
            />
            <ul
              id={listId}
              role="listbox"
              aria-multiselectable={multiple}
              aria-label={label}
              className={styles.list}
            >
              {rows.map((option, index) => {
                const selected =
                  option.value === '' ? selectedValues.length === 0 : selectedValues.includes(option.value);
                return (
                  <li
                    key={option.value || 'empty'}
                    id={`${id}-option-${index}`}
                    role="option"
                    aria-selected={selected}
                    aria-disabled={option.disabled}
                    className={cn(
                      styles.option,
                      index === active && styles.active,
                      selected && styles.selected,
                      option.disabled && styles.disabled,
                    )}
                    onPointerMove={() => setActive(index)}
                    onClick={() => choose(option)}
                  >
                    <span className={styles.main}>
                      {option.badge && <Badge tone="yellow">{option.badge}</Badge>}
                      <span className={styles.name}>{option.label}</span>
                    </span>
                    {option.description && <span className={styles.description}>{option.description}</span>}
                    {multiple && <span className={styles.check} aria-hidden="true" />}
                  </li>
                );
              })}
              {rows.length === 0 && <li className={styles.none}>{emptyMessage}</li>}
            </ul>
            {matches.length > visible.length && (
              <p className={styles.more}>
                Mostrando {visible.length} de {matches.length}. Escribe para afinar la búsqueda.
              </p>
            )}
          </div>
        )}

        {multiple && selectedOptions.length > 0 && (
          <ul className={styles.chips} aria-label={`${label} seleccionadas`}>
            {selectedOptions.map((option) => (
              <li key={option.value} className={styles.chip}>
                <span className={styles.chipText}>
                  {option.badge && <Badge tone="yellow">{option.badge}</Badge>}
                  <span className={styles.name}>{option.label}</span>
                  {option.description && <span className={styles.description}>{option.description}</span>}
                </span>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Quitar ${option.label}`}
                  onClick={() => remove(option.value)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FieldShell>
  );
}
