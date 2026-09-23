import { useState } from 'react';
import FormPanel from '../components/form/FormPanel';
import PreviewDocument from '../components/document/PreviewDocument';
import Icon from '../components/atoms/Icon';
import { TIPO_CONSTANCIA, TIPO_LABEL } from '../constants/tipos';
import { todayStr } from '../utils/spanishText';
import { semestreParaFecha, periodosDeSemestre } from '../hooks/useCalendario';
import { requiredKeys } from '../data/formFields';

/** Una constancia nueva arranca con los periodos del semestre vigente según el calendario escolar. */
function initialState(tipo, initialData, calendario) {
  if (initialData) return initialData;
  const semestre = semestreParaFecha(calendario, todayStr());
  return {
    ...(semestre ? periodosDeSemestre(requiredKeys(tipo), semestre) : {}),
    fechaExpedicion: todayStr(),
    fechaConsulta: todayStr(),
  };
}

export default function NuevaConstanciaView({
  tipo,
  nextFolio,
  initialData,
  onGenerate,
  programas,
  calendario,
}) {
  const [data, setData] = useState(() => initialState(tipo, initialData, calendario));

  function handleGenerate() {
    onGenerate({ tipo, data });
  }

  const folioSuffix = nextFolio.replace('FCI-', '');

  return (
    <div className="grid grid-cols-1 gap-space-lg items-start lg:grid-cols-12">
      <section className="lg:col-span-5">
        <FormPanel
          tipo={tipo}
          data={data}
          onChange={setData}
          nextFolio={nextFolio}
          onGenerate={handleGenerate}
          programas={programas}
          calendario={calendario}
        />
      </section>
      <section className="lg:col-span-7 sticky top-20 flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl bg-surface-container-lowest px-space-md py-space-xs shadow-sm">
          <div className="flex items-center gap-space-xs">
            <Icon name="picture_as_pdf" className="text-[20px] text-secondary" />
            <span className="font-semibold text-on-surface text-label-md">Vista previa oficial</span>
            <span
              className={`rounded px-space-xs py-space-2xs font-bold uppercase text-label-sm ${
                tipo === TIPO_CONSTANCIA.PROMEDIO
                  ? 'bg-secondary-fixed text-on-secondary-fixed'
                  : 'bg-primary-fixed text-on-primary-fixed'
              }`}
            >
              {TIPO_LABEL[tipo]}
            </span>
          </div>
        </div>
        <div className="flex justify-center rounded-xl bg-surface-container-low p-space-md shadow-inner">
          <PreviewDocument tipo={tipo} data={data} folio={folioSuffix} />
        </div>
      </section>
    </div>
  );
}
