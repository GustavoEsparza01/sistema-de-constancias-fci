import { useState } from 'react';
import Icon from '../atoms/Icon';

const STATUS = { IDLE: 'idle', LOADING: 'loading', DONE: 'done', ERROR: 'error' };

const FIELD_LABELS = {
  matricula: 'Matrícula',
  alumno: 'Nombre del alumno',
  programa: 'Programa educativo',
  fechaConsulta: 'Fecha de consulta',
  promedioGeneral: 'Promedio general',
  semestreCursado: 'Semestre cursado',
  promedioSemestre: 'Promedio del semestre',
};

/**
 * Carga un kárdex (el "Análisis de Calificaciones por Alumno" que exporta
 * SUCEWEB) en PDF y precarga el formulario con los datos que el documento
 * declara sin ambigüedad. Todo ocurre en el navegador — el archivo nunca
 * se sube a ningún servidor — y cada campo que se llena sigue siendo
 * editable, para que un dato mal leído se pueda corregir antes de generar
 * la constancia.
 */
export default function KardexUpload({ onExtracted, programas }) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setStatus(STATUS.LOADING);
    setError(null);
    setSummary(null);
    try {
      const [{ extractPdfText }, { parseKardex }] = await Promise.all([
        import('../../kardex/extractPdfText'),
        import('../../kardex/parseKardex'),
      ]);
      const text = await extractPdfText(file);
      if (text.trim().length < 30) {
        setStatus(STATUS.ERROR);
        setError(
          'Este PDF no tiene texto seleccionable (¿es una hoja escaneada?). Completa los datos manualmente.',
        );
        return;
      }

      const { data, warnings } = parseKardex(text, programas);
      const { generacion, ...camposDeFormulario } = data;

      if (Object.keys(camposDeFormulario).length === 0) {
        setStatus(STATUS.ERROR);
        setError('No se reconoció el formato de este documento. Completa los datos manualmente.');
        return;
      }

      onExtracted(camposDeFormulario);
      setSummary({ campos: Object.keys(camposDeFormulario), generacion, warnings });
      setStatus(STATUS.DONE);
    } catch (err) {
      console.error('No se pudo leer el kárdex:', err);
      setStatus(STATUS.ERROR);
      setError('No se pudo leer el archivo. Verifica que sea un PDF válido.');
    }
  }

  return (
    <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-sm">
      <span className="flex items-center gap-space-2xs font-bold text-on-surface text-label-md">
        <Icon name="upload_file" className="text-[16px] text-secondary" />
        Cargar kárdex (PDF) — opcional
      </span>

      <label className="relative flex cursor-pointer flex-col items-center justify-center gap-space-2xs rounded-lg border-2 border-dashed border-secondary/40 bg-surface-container-lowest p-space-sm text-center transition-colors hover:border-secondary">
        <input
          type="file"
          accept="application/pdf"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => handleFile(e.target.files?.[0])}
          onClick={(e) => {
            e.target.value = '';
          }}
        />
        <Icon name="picture_as_pdf" className="text-[24px] text-secondary" />
        <span className="font-semibold text-primary text-title-md">
          {status === STATUS.LOADING ? 'Leyendo kárdex…' : 'Arrastra el PDF o selecciona archivo'}
        </span>
        <span className="text-on-surface-variant text-label-sm">
          Se lee en tu navegador; el archivo no se sube a ningún servidor.
        </span>
      </label>

      {error && (
        <p className="flex items-start gap-space-2xs text-warning text-label-sm">
          <Icon name="warning" className="mt-0.5 text-[16px]" />
          {error}
        </p>
      )}

      {summary && (
        <div className="flex flex-col gap-space-2xs text-label-sm">
          <p className="flex items-center gap-space-2xs text-secondary">
            <Icon name="check_circle" className="text-[16px]" />
            Se completó: {summary.campos.map((c) => FIELD_LABELS[c] ?? c).join(', ')}. Verifica los datos
            antes de generar.
          </p>
          {summary.generacion && (
            <p className="text-on-surface-variant">Generación detectada en el kárdex: {summary.generacion}</p>
          )}
          {summary.warnings.map((w) => (
            <p key={w} className="flex items-start gap-space-2xs text-warning">
              <Icon name="info" className="mt-0.5 text-[14px]" />
              {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
