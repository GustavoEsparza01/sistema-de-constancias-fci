import { VISTA } from '../../constants/tipos';
import Icon from '../atoms/Icon';

const NAV_ITEMS = [
  { view: VISTA.INICIO, label: 'Inicio', icon: 'space_dashboard' },
  { view: VISTA.HISTORIAL, label: 'Historial de Constancias', icon: 'dataset' },
  { view: VISTA.NUEVA_NORMAL, label: 'Nueva: Reinscripción', icon: 'assignment_turned_in' },
  { view: VISTA.NUEVA_PROMEDIO, label: 'Nueva: Promedio', icon: 'grade' },
];

const SOON_ITEMS = [
  { label: 'Catálogo de Programas', icon: 'school' },
  { label: 'Configuración de Plantillas', icon: 'draw' },
];

export default function Sidebar({ view, onChangeView }) {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-gutter-sidebar flex-col justify-between bg-primary-container shadow-[0_1px_8px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col">
        <div className="flex h-16 items-center gap-space-sm bg-primary px-space-md">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-lowest p-space-2xs">
            <Icon name="verified" className="text-[20px] text-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold uppercase tracking-wide text-on-primary text-label-md">
              UNACAR · FCI
            </span>
            <span className="text-on-primary-container text-label-sm">Constancias</span>
          </div>
        </div>

        <div className="px-space-md py-space-sm">
          <span className="uppercase tracking-wider text-on-primary-container text-label-sm">Navegación</span>
        </div>

        <nav className="flex flex-col gap-space-2xs px-space-xs">
          {NAV_ITEMS.map((item) => {
            const active = view === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onChangeView(item.view)}
                className={`flex items-center gap-space-sm rounded px-space-sm py-space-xs text-left text-body-md transition-colors ${
                  active
                    ? 'bg-secondary font-semibold text-on-secondary'
                    : 'text-on-primary-container hover:bg-white/10 hover:text-on-primary'
                }`}
              >
                <Icon name={item.icon} className="text-[18px]" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="my-space-2xs h-px bg-white/10" />

          {SOON_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled
              className="flex cursor-default items-center gap-space-sm rounded px-space-sm py-space-xs text-left text-on-primary-container/40 text-body-md"
            >
              <Icon name={item.icon} className="text-[18px]" />
              <span className="flex-1">{item.label}</span>
              <span className="rounded bg-white/10 px-space-2xs py-0.5 text-[10px] uppercase tracking-wide">
                Pronto
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-space-md">
        <div className="flex items-center gap-space-xs text-on-primary-container text-label-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 font-bold text-on-primary text-label-sm">
            SA
          </div>
          <div className="leading-tight">
            <div>Secretaría Académica</div>
            <div className="opacity-70">FCI · UNACAR</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
