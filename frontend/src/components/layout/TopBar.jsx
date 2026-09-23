import { useState } from 'react';
import { VISTA } from '../../constants/tipos';
import Icon from '../atoms/Icon';

const TITLES = {
  [VISTA.INICIO]: 'Inicio',
  [VISTA.HISTORIAL]: 'Historial de Constancias',
  [VISTA.NUEVA_NORMAL]: 'Emisión de Constancia de Reinscripción',
  [VISTA.NUEVA_PROMEDIO]: 'Emisión de Constancia de Promedio',
};

export default function TopBar({ view, historialCount, onSearch }) {
  const [query, setQuery] = useState('');

  function submit(e) {
    e.preventDefault();
    onSearch(query.trim());
  }

  return (
    <header className="fixed left-gutter-sidebar right-0 top-0 z-40 flex h-16 items-center justify-between bg-surface-container-lowest px-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-space-md">
        <span className="font-semibold text-primary text-title-md">{TITLES[view] ?? 'Constancias FCI'}</span>
        <span className="rounded bg-surface-container-high px-space-xs py-space-2xs font-semibold uppercase tracking-wider text-on-surface-variant text-label-sm">
          Ciclo Escolar 2026
        </span>
        {view === VISTA.HISTORIAL && (
          <span className="text-outline text-label-sm">{historialCount} registradas</span>
        )}
      </div>

      <div className="flex items-center gap-space-lg">
        <form className="relative flex items-center" onSubmit={submit}>
          <Icon
            name="search"
            className="pointer-events-none absolute left-space-xs text-[18px] text-outline"
          />
          <input
            className="h-[38px] w-64 rounded bg-surface-container-low pl-8 pr-space-sm text-on-surface text-body-sm transition-all focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-secondary"
            placeholder="Buscar matrícula o folio…"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-space-sm pl-space-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-primary">
            <Icon name="badge" className="text-[18px]" />
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="font-semibold text-on-surface text-label-md">Secretaría Académica</span>
            <span className="mt-1 text-on-surface-variant text-label-sm">Sesión única · sin login</span>
          </div>
        </div>
      </div>
    </header>
  );
}
