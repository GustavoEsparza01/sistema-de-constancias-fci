import { useMemo } from 'react';
import { TIPO_LABEL } from '../../constants/tipos';
import Icon from '../atoms/Icon';

const BADGE_CLASS = {
  normal: 'bg-primary-fixed text-on-primary-fixed',
  promedio: 'bg-secondary-fixed text-on-secondary-fixed',
};

export default function HistorialTable({ historial, query, onQueryChange, onView }) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return historial;
    return historial.filter(
      (item) => item.folio.toLowerCase().includes(q) || (item.data.alumno || '').toLowerCase().includes(q),
    );
  }, [historial, query]);

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex max-w-[900px] items-center gap-space-sm">
        <input
          className="h-[38px] flex-1 rounded bg-surface-container-lowest px-space-sm text-on-surface text-body-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary"
          placeholder="Buscar por folio o nombre del alumno..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <span className="whitespace-nowrap text-outline text-label-sm">
          {filtered.length} de {historial.length}
        </span>
      </div>

      <div className="max-w-[1100px] overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-space-2xl text-center text-outline text-body-sm">
            No hay constancias que coincidan con la búsqueda.
          </div>
        ) : (
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-space-md py-space-sm text-left font-bold uppercase text-outline text-label-sm">
                  Folio
                </th>
                <th className="px-space-md py-space-sm text-left font-bold uppercase text-outline text-label-sm">
                  Alumno
                </th>
                <th className="px-space-md py-space-sm text-left font-bold uppercase text-outline text-label-sm">
                  Tipo
                </th>
                <th className="px-space-md py-space-sm text-left font-bold uppercase text-outline text-label-sm">
                  Generada
                </th>
                <th className="px-space-md py-space-sm text-left font-bold uppercase text-outline text-label-sm">
                  Estado
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-outline-variant/40 hover:bg-surface-container-low"
                >
                  <td className="px-space-md py-space-sm font-mono text-on-surface-variant text-tabular-code">
                    {item.folio}
                  </td>
                  <td className="px-space-md py-space-sm">{item.data.alumno || '—'}</td>
                  <td className="px-space-md py-space-sm">
                    <span
                      className={`rounded-full px-space-xs py-space-2xs font-bold uppercase tracking-wide text-label-sm ${BADGE_CLASS[item.tipo]}`}
                    >
                      {TIPO_LABEL[item.tipo]}
                    </span>
                  </td>
                  <td className="px-space-md py-space-sm">{item.fechaGeneracion}</td>
                  <td className="px-space-md py-space-sm">
                    <span
                      className={`rounded-full px-space-xs py-space-2xs text-label-sm ${
                        item.estado === 'anulada'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-surface-container-high text-secondary'
                      }`}
                    >
                      {item.estado === 'anulada' ? 'Anulada' : item.isExample ? 'Ejemplo' : 'Generada'}
                    </span>
                  </td>
                  <td className="px-space-md py-space-sm">
                    <button
                      type="button"
                      onClick={() => onView(item.id)}
                      className="flex items-center gap-space-2xs rounded border border-outline-variant px-space-sm py-space-2xs text-on-surface-variant text-label-md hover:border-secondary hover:text-secondary"
                    >
                      <Icon name="visibility" className="text-[16px]" />
                      Ver documento
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
