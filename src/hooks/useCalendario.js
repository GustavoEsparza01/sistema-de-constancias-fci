import { useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';
import { loadFile, saveFile } from '../utils/fileStore';
import { CALENDARIO_INICIAL, CAMPOS_SEMESTRE } from '../data/calendarioInicial';

const STORAGE_KEY = 'constancias-fci-calendario-v1';
const PDF_KEY = 'calendario-pdf';

/**
 * Calendario escolar vigente: las fechas de cada semestre (en
 * localStorage) y el PDF oficial del que salen (en IndexedDB, ver
 * utils/fileStore.js). Las fechas se capturan a mano porque el calendario
 * oficial es una imagen; el PDF se guarda para poder consultarlo desde la
 * app y verificarlas.
 */
export function useCalendario() {
  const [calendario, setCalendario] = useState(() => loadJSON(STORAGE_KEY) || CALENDARIO_INICIAL);
  const [pdfUrl, setPdfUrl] = useState(null); // URL temporal (blob:) del PDF oficial, si ya se subió

  useEffect(() => {
    saveJSON(STORAGE_KEY, calendario);
  }, [calendario]);

  useEffect(() => {
    let cancelled = false;
    loadFile(PDF_KEY).then((file) => {
      if (!cancelled && file) setPdfUrl(URL.createObjectURL(file));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Libera la URL anterior cuando se reemplaza el PDF.
  useEffect(() => () => pdfUrl && URL.revokeObjectURL(pdfUrl), [pdfUrl]);

  /** @returns {Promise<boolean>} si se pudo guardar el archivo */
  async function subirPdf(file) {
    const ok = await saveFile(PDF_KEY, file);
    if (ok) {
      setPdfUrl(URL.createObjectURL(file));
      setCalendario((prev) => ({ ...prev, pdfNombre: file.name, pdfSubido: new Date().toISOString() }));
    }
    return ok;
  }

  return { calendario, guardarCalendario: setCalendario, pdfUrl, subirPdf };
}

/** Los periodos de un semestre que usa un formulario, según sus campos obligatorios (la de promedio no lleva vacacional). */
export function periodosDeSemestre(keys, semestre) {
  return Object.fromEntries(CAMPOS_SEMESTRE.filter((c) => keys.includes(c)).map((c) => [c, semestre[c]]));
}

/**
 * El semestre del calendario que corresponde a una fecha ("YYYY-MM-DD"):
 * el que la contiene o, si cae entre semestres, el siguiente en empezar
 * (una constancia de reinscripción se pide para el semestre que viene).
 * Si ya pasaron todos, el último.
 */
export function semestreParaFecha(calendario, fecha) {
  const semestres = [...calendario.semestres]
    .filter((s) => s.periodoInicio && s.periodoFin)
    .sort((a, b) => a.periodoInicio.localeCompare(b.periodoInicio));
  return semestres.find((s) => fecha <= s.periodoFin) ?? semestres[semestres.length - 1] ?? null;
}
