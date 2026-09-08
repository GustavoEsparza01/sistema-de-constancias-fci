import { useMemo } from 'react';
import Icon from '../components/atoms/Icon';
import { TIPO_CONSTANCIA, TIPO_LABEL } from '../constants/tipos';

function StatTile({ icon, label, value, accent = 'text-primary' }) {
  return (
    <div className="flex flex-col gap-space-2xs rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <span className="flex items-center gap-space-2xs text-on-surface-variant text-label-sm">
        <Icon name={icon} className="text-[16px]" />
        {label}
      </span>
      <span className={`font-bold text-headline-lg ${accent}`}>{value}</span>
    </div>
  );
}

export default function InicioView({ historial, onVerHistorial }) {
  const stats = useMemo(() => {
    const reales = historial.filter((e) => !e.isExample);
    const vigentes = reales.filter((e) => e.estado !== 'anulada');
    const anuladas = reales.filter((e) => e.estado === 'anulada');
    const normales = vigentes.filter((e) => e.tipo === TIPO_CONSTANCIA.NORMAL).length;
    const promedios = vigentes.filter((e) => e.tipo === TIPO_CONSTANCIA.PROMEDIO).length;
    return {
      total: vigentes.length,
      anuladas: anuladas.length,
      normales,
      promedios,
      folioReciente: reales[0]?.folio ?? '—',
    };
  }, [historial]);

  const maxTipo = Math.max(stats.normales, stats.promedios, 1);
  const ultimas = historial.slice(0, 5);

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
        <StatTile icon="fact_check" label="Constancias generadas" value={stats.total} />
        <StatTile icon="tag" label="Folio más reciente" value={stats.folioReciente} accent="text-secondary" />
        <StatTile icon="block" label="Anuladas" value={stats.anuladas} accent="text-error" />
      </div>

      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="mb-space-md font-semibold text-primary text-title-md">Por tipo de constancia</h2>
        <div className="flex flex-col gap-space-sm">
          <div>
            <div className="mb-space-2xs flex items-center justify-between text-label-sm">
              <span className="font-semibold text-on-surface">{TIPO_LABEL[TIPO_CONSTANCIA.NORMAL]}</span>
              <span className="text-on-surface-variant">{stats.normales}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-container-low">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(stats.normales / maxTipo) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-space-2xs flex items-center justify-between text-label-sm">
              <span className="font-semibold text-on-surface">{TIPO_LABEL[TIPO_CONSTANCIA.PROMEDIO]}</span>
              <span className="text-on-surface-variant">{stats.promedios}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-container-low">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${(stats.promedios / maxTipo) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="mb-space-md flex items-center justify-between">
          <h2 className="font-semibold text-primary text-title-md">Últimas constancias</h2>
          <button
            type="button"
            onClick={onVerHistorial}
            className="text-secondary text-label-md hover:underline"
          >
            Ver historial completo →
          </button>
        </div>
        {ultimas.length === 0 ? (
          <p className="text-on-surface-variant text-body-sm">Aún no se ha generado ninguna constancia.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant/40">
            {ultimas.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-space-sm py-space-xs text-body-sm"
              >
                <span className="font-mono text-on-surface-variant text-tabular-code">{item.folio}</span>
                <span className="flex-1 truncate px-space-sm text-on-surface">{item.data.alumno || '—'}</span>
                <span className="text-on-surface-variant text-label-sm">{TIPO_LABEL[item.tipo]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
