import { useState } from 'react';
import Field from '../components/form/Field';
import Icon from '../components/atoms/Icon';
import { TextInput, DateRangeInput } from '../components/form/inputs';
import { CAMPOS_SEMESTRE } from '../data/calendarioInicial';
import { formatDateRange } from '../utils/spanishText';

function PdfViewer({ url }) {
  return (
    <>
      <iframe title="Calendario escolar" src={url} className="h-[70vh] w-full rounded-lg bg-white" />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-space-2xs self-end font-semibold text-secondary text-label-md hover:underline"
      >
        <Icon name="open_in_new" className="text-[16px]" />
        Abrir en otra pestaña
      </a>
    </>
  );
}

/**
 * "Calendario Escolar": aquí vive el PDF oficial del calendario y las
 * fechas de cada semestre que se usan para llenar los periodos de las
 * constancias. Cuando cambia el calendario se sube el PDF nuevo y se
 * actualizan las fechas.
 */
export default function CalendarioView({ calendario, onGuardar, pdfUrl, onSubirPdf, showToast }) {
  const [draft, setDraft] = useState(calendario);
  const [subiendo, setSubiendo] = useState(false);
  const cambios = JSON.stringify(draft) !== JSON.stringify(calendario);
  const completo = draft.semestres.every((s) => CAMPOS_SEMESTRE.every((c) => s[c]));

  function setSemestre(id, key) {
    return (value) =>
      setDraft((prev) => ({
        ...prev,
        semestres: prev.semestres.map((s) => (s.id === id ? { ...s, [key]: value } : s)),
      }));
  }

  async function handleFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('El calendario debe ser un archivo PDF.');
      return;
    }
    setSubiendo(true);
    const ok = await onSubirPdf(file);
    setSubiendo(false);
    showToast(
      ok
        ? 'Calendario guardado. Revisa que las fechas de los semestres coincidan con el PDF nuevo.'
        : 'No se pudo guardar el PDF en este navegador.',
    );
  }

  function handleGuardar(e) {
    e.preventDefault();
    onGuardar({ ...draft, actualizado: new Date().toISOString() });
    showToast('Fechas del calendario actualizadas.');
  }

  return (
    <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
      <form
        onSubmit={handleGuardar}
        className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-5"
      >
        <div className="flex flex-col gap-space-2xs">
          <h2 className="font-semibold text-primary text-title-md">Fechas del calendario</h2>
          <p className="text-on-surface-variant text-label-sm">
            Estas fechas llenan el periodo del semestre y el periodo vacacional de las constancias nuevas.
            Cópialas del PDF oficial cada vez que cambie el calendario.
          </p>
        </div>

        <Field label="Ciclo escolar">
          <TextInput
            value={draft.ciclo}
            placeholder="Ej. 2026-2027"
            onChange={(ciclo) => setDraft({ ...draft, ciclo })}
          />
        </Field>

        {draft.semestres.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-sm"
          >
            <Field label="Nombre">
              <TextInput value={s.nombre} onChange={setSemestre(s.id, 'nombre')} />
            </Field>
            <Field
              label="Periodo del semestre (inicio y fin de cursos)"
              hint={formatDateRange(s.periodoInicio, s.periodoFin)}
            >
              <DateRangeInput
                startValue={s.periodoInicio}
                endValue={s.periodoFin}
                onChangeStart={setSemestre(s.id, 'periodoInicio')}
                onChangeEnd={setSemestre(s.id, 'periodoFin')}
              />
            </Field>
            <Field
              label="Periodo vacacional (al terminar el semestre)"
              hint={formatDateRange(s.vacacionesInicio, s.vacacionesFin)}
            >
              <DateRangeInput
                startValue={s.vacacionesInicio}
                endValue={s.vacacionesFin}
                onChangeStart={setSemestre(s.id, 'vacacionesInicio')}
                onChangeEnd={setSemestre(s.id, 'vacacionesFin')}
              />
            </Field>
          </div>
        ))}

        <button
          type="submit"
          disabled={!cambios || !completo}
          className="flex h-11 items-center justify-center gap-space-xs rounded-lg bg-primary font-bold text-on-primary shadow-md transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="save" className="text-[18px]" />
          Guardar fechas
        </button>
        {calendario.actualizado && (
          <p className="text-center text-outline text-label-sm">
            Última actualización: {new Date(calendario.actualizado).toLocaleString('es-MX')}
          </p>
        )}
      </form>

      <section className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex flex-col">
            <h2 className="font-semibold text-primary text-title-md">Calendario oficial (PDF)</h2>
            {calendario.pdfNombre && (
              <span className="text-on-surface-variant text-label-sm">
                {calendario.pdfNombre} · subido el{' '}
                {new Date(calendario.pdfSubido).toLocaleDateString('es-MX')}
              </span>
            )}
          </div>
          <label className="relative flex cursor-pointer items-center gap-space-xs rounded-lg bg-secondary px-space-sm py-space-xs font-semibold text-on-secondary text-label-md transition-opacity hover:opacity-90">
            <input
              type="file"
              accept="application/pdf"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(e) => handleFile(e.target.files?.[0])}
              onClick={(e) => {
                e.target.value = '';
              }}
            />
            <Icon name="upload_file" className="text-[18px]" />
            {subiendo ? 'Guardando…' : pdfUrl ? 'Reemplazar PDF' : 'Subir PDF'}
          </label>
        </div>

        {pdfUrl ? (
          <PdfViewer url={pdfUrl} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-space-2xs rounded-lg border-2 border-dashed border-secondary/40 p-space-lg text-center">
            <Icon name="calendar_month" className="text-[32px] text-secondary" />
            <span className="font-semibold text-primary">Aún no se ha subido el calendario oficial</span>
            <span className="text-on-surface-variant text-label-sm">
              Se guarda en este navegador para consultarlo cuando haga falta.
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
