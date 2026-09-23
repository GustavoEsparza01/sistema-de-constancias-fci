import Icon from '../atoms/Icon';
import { requiredKeys } from '../../data/formFields';
import { periodosDeSemestre } from '../../hooks/useCalendario';

/**
 * Botones para llenar los periodos con un semestre del calendario escolar
 * (ver views/CalendarioView.jsx). El semestre cuyos periodos ya están en
 * el formulario se marca como seleccionado.
 */
export default function CalendarioPicker({ tipo, calendario, data, onPick }) {
  const semestres = calendario.semestres.filter((s) => s.periodoInicio && s.periodoFin);
  if (semestres.length === 0) return null;
  const keys = requiredKeys(tipo);

  return (
    <div className="flex flex-col gap-space-2xs">
      <span className="flex items-center gap-space-2xs text-on-surface-variant text-label-sm">
        <Icon name="calendar_month" className="text-[14px]" />
        Tomar del calendario escolar {calendario.ciclo}:
      </span>
      <div className="flex flex-wrap gap-space-xs">
        {semestres.map((s) => {
          const periodos = periodosDeSemestre(keys, s);
          const activo = Object.entries(periodos).every(([key, value]) => data[key] === value);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick(periodos)}
              className={`rounded-full px-space-sm py-space-2xs font-semibold text-label-sm transition-colors ${
                activo
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-lowest text-secondary ring-1 ring-secondary/40 hover:ring-secondary'
              }`}
            >
              {s.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
