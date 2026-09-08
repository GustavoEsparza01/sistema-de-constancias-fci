import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Toast from './components/Toast';
import InicioView from './views/InicioView';
import NuevaConstanciaView from './views/NuevaConstanciaView';
import HistorialView from './views/HistorialView';
import { useHistorial } from './hooks/useHistorial';
import { useProgramas } from './hooks/useProgramas';
import { useToast } from './hooks/useToast';
import { VISTA, TIPO_POR_VISTA } from './constants/tipos';
import { todayStr } from './utils/spanishText';

export default function App() {
  const [view, setView] = useState(VISTA.INICIO);
  const [prefill, setPrefill] = useState(null); // { tipo, data } al "duplicar para nueva emisión"
  const [historialQuery, setHistorialQuery] = useState('');
  const {
    historial,
    nextFolio,
    registrarConstancia,
    anularConstancia,
    reactivarConstancia,
    registrarDescarga,
    importarHistorial,
  } = useHistorial();
  const { programas } = useProgramas();
  const { message, showToast } = useToast();

  function changeView(nextView) {
    setPrefill(null);
    setView(nextView);
  }

  function handleSearchSubmit(query) {
    setHistorialQuery(query);
    setView(VISTA.HISTORIAL);
  }

  async function handleGenerate({ tipo, data }) {
    const entry = registrarConstancia({ tipo, data });
    const folioSuffix = entry.folio.replace('FCI-', '');
    setPrefill(null);
    setView(VISTA.HISTORIAL);
    try {
      const { downloadConstanciaPdf } = await import('./pdf/downloadConstanciaPdf');
      await downloadConstanciaPdf({ tipo, data, folio: folioSuffix });
      showToast(`Constancia ${entry.folio} generada y descargada.`);
    } catch (error) {
      console.error('No se pudo generar el PDF:', error);
      showToast(
        `Constancia ${entry.folio} generada, pero el PDF falló. Descárgalo de nuevo desde el historial.`,
      );
    }
  }

  /**
   * "Duplicar para nueva emisión": precarga el formulario con los mismos
   * datos, con la fecha de expedición/consulta puesta en hoy (es una
   * emisión nueva) y el folio nuevo se asigna al generar.
   */
  function handleDuplicate(item) {
    const data = { ...item.data };
    if (data.fechaExpedicion) data.fechaExpedicion = todayStr();
    if (data.fechaConsulta) data.fechaConsulta = todayStr();
    setPrefill({ tipo: item.tipo, data });
    setView(TIPO_POR_VISTA[item.tipo] ?? VISTA.NUEVA_NORMAL);
  }

  function handleImportar(entradas) {
    if (entradas.length === 0) {
      showToast('No se encontraron constancias válidas en ese archivo.');
      return;
    }
    const agregadas = importarHistorial(entradas);
    showToast(
      agregadas > 0
        ? `Se importaron ${agregadas} constancia(s) nueva(s).`
        : 'Ese respaldo no tenía constancias nuevas (ya estaban todas en el historial).',
    );
  }

  const tipoActual = TIPO_POR_VISTA[view];

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans antialiased">
      <Sidebar view={view} onChangeView={changeView} />
      <div className="pl-gutter-sidebar">
        <TopBar view={view} historialCount={historial.length} onSearch={handleSearchSubmit} />
        <main className="pt-16 min-h-screen">
          <div className="p-space-lg max-w-[1600px] mx-auto w-full">
            {view === VISTA.INICIO && (
              <InicioView historial={historial} onVerHistorial={() => setView(VISTA.HISTORIAL)} />
            )}
            {view === VISTA.HISTORIAL && (
              <HistorialView
                historial={historial}
                query={historialQuery}
                onQueryChange={setHistorialQuery}
                onDuplicate={handleDuplicate}
                onAnular={anularConstancia}
                onReactivar={reactivarConstancia}
                onRegistrarDescarga={registrarDescarga}
                onImportar={handleImportar}
              />
            )}
            {tipoActual && (
              <NuevaConstanciaView
                key={view}
                tipo={tipoActual}
                nextFolio={nextFolio}
                initialData={prefill?.tipo === tipoActual ? prefill.data : null}
                onGenerate={handleGenerate}
                programas={programas}
              />
            )}
          </div>
        </main>
      </div>
      <Toast message={message} />
    </div>
  );
}
