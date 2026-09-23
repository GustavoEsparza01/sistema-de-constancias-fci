import { MESES } from '../utils/spanishText';

/**
 * Extrae los datos de un "Análisis de Calificaciones por Alumno" (el
 * reporte que exporta SUCEWEB, comúnmente llamado "kárdex") a partir del
 * texto plano ya extraído del PDF (ver kardex/extractPdfText.js).
 *
 * Solo se auto-completan los datos que el documento declara sin ambigüedad
 * (matrícula, nombre, programa, generación, fecha de consulta, promedio
 * general). Los periodos de semestre/vacacional y la fecha de expedición
 * NO se infieren — el kárdex no los declara (salen del calendario escolar,
 * ver hooks/useCalendario.js). El número de reinscripción (periodos
 * NORMALES menos uno) y el semestre cursado con su promedio (el último
 * periodo NORMAL con calificaciones) sí se infieren, pero se deben
 * verificar porque son un conteo, no un dato literal del documento.
 */

const MESES_ABREV = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function normalize(text) {
  return text
    .normalize('NFD')
    .split('')
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x0300 || code > 0x036f;
    })
    .join('')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** "02 DE SEPTIEMBRE DE 2026" → "2026-09-02" (o null si no calza el formato). */
function parseLongSpanishDate(text) {
  const m = normalize(text).match(/(\d{1,2})\s+DE\s+([A-ZÑ]+)\s+DE\s+(\d{4})/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const monthIdx = MESES.findIndex((mes) => normalize(mes) === m[2]);
  if (monthIdx === -1) return null;
  const year = m[3];
  return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** "FEB2026" → "Febrero 2026" (o el texto original si no calza el formato). */
function formatPeriodCode(code) {
  const m = normalize(code).match(/^(?:INT\s+)?([A-Z]{3})(\d{4})$/);
  if (!m) return code;
  const idx = MESES_ABREV.indexOf(m[1]);
  if (idx === -1) return code;
  const mes = MESES[idx];
  return `${mes[0].toUpperCase()}${mes.slice(1)} ${m[2]}`;
}

/** "MORALES ESPARZA GUSTAVO ADOLFO" → "Morales Esparza Gustavo Adolfo" (el kárdex viene en mayúsculas). */
function titleCase(text) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** Empareja el programa extraído contra el catálogo fijo (data/programas.js). */
function matchPrograma(extraido, catalogo) {
  if (!extraido) return null;
  const norm = normalize(extraido);
  let best = null;
  for (const opcion of catalogo) {
    const normOpcion = normalize(opcion);
    if (norm.includes(normOpcion) && (!best || normOpcion.length > normalize(best).length)) {
      best = opcion;
    }
  }
  return best;
}

/**
 * Recorre el texto buscando pares (código de periodo, promedio parcial) en
 * el orden en que aparecen, y regresa el último periodo NORMAL (no
 * intersemestral) cuyo promedio sea mayor a cero — es decir, el último
 * semestre regular ya con calificaciones asentadas.
 */
function findUltimoSemestreCursado(text) {
  const periodoRegex = /(INT\s+)?([A-Z]{3})(\d{4})/g;
  const promedioRegex = /PROMEDIO PARCIAL:\s*([\d.]+)/g;

  const periodos = [];
  let m;
  while ((m = periodoRegex.exec(text))) {
    periodos.push({ index: m.index, esIntersemestral: Boolean(m[1]), codigo: `${m[2]}${m[3]}` });
  }

  let ultimo = null;
  while ((m = promedioRegex.exec(text))) {
    const promedioIndex = m.index;
    const promedio = parseFloat(m[1]);
    // El periodo del bloque es el último código de periodo visto antes de esta línea.
    let periodoDelBloque = null;
    for (const p of periodos) {
      if (p.index < promedioIndex) periodoDelBloque = p;
      else break;
    }
    if (periodoDelBloque && !periodoDelBloque.esIntersemestral && promedio > 0) {
      ultimo = { codigo: periodoDelBloque.codigo, promedio };
    }
  }
  return ultimo;
}

/**
 * Número de reinscripción: los periodos NORMALES distintos del kárdex
 * (contando el que está en curso, aunque aún no tenga calificaciones)
 * menos uno, porque el primero es la inscripción. Los intersemestrales no
 * cuentan. Se cuentan los periodos que sí aparecen, en vez de restar
 * contra la generación, para que una baja temporal no infle el número.
 *
 * Cada renglón de materia termina en "<PERIODO> [calificación] <TIPO>";
 * la calificación falta en el periodo en curso ("AGO2026 NORMAL").
 */
function contarReinscripciones(text) {
  const renglonRegex = /\b(INT\s+)?([A-Z]{3}\d{4})\s+(?:[A-Z0-9.]+\s+)?(NORMAL|INTERSEMESTRAL)\b/g;
  const periodosNormales = new Set();
  let m;
  while ((m = renglonRegex.exec(text))) {
    if (!m[1] && m[3] === 'NORMAL') periodosNormales.add(m[2]);
  }
  return periodosNormales.size - 1;
}

/**
 * @param {string} rawText texto extraído del PDF (ver extractPdfText.js)
 * @param {string[]} catalogoProgramas data/programas.js → PROGRAMAS
 * @returns {{ data: object, warnings: string[] }}
 */
export function parseKardex(rawText, catalogoProgramas) {
  const text = rawText.replace(/\s+/g, ' ').trim();
  const textNorm = normalize(text);
  const data = {};
  const warnings = [];

  const matricula = text.match(/MATR[IÍ]CULA:\s*([0-9A-Z-]+)/i);
  if (matricula) data.matricula = matricula[1];
  else warnings.push('No se encontró la matrícula en el documento.');

  const alumno = text.match(/ALUMNO:\s*(.+?)\s*PLAN ESTUDIO:/i);
  if (alumno) data.alumno = titleCase(alumno[1].trim());
  else warnings.push('No se encontró el nombre del alumno en el documento.');

  const programaMatch = text.match(/PROGRAMA EDUCATIVO:\s*(.+?)\s*FECHA:/i);
  if (programaMatch) {
    const encontrado = matchPrograma(programaMatch[1], catalogoProgramas);
    if (encontrado) data.programa = encontrado;
    else
      warnings.push(
        `El programa "${programaMatch[1].trim()}" no está en el catálogo; selecciónalo manualmente.`,
      );
  } else {
    warnings.push('No se encontró el programa educativo en el documento.');
  }

  const fechaMatch = text.match(/FECHA:\s*(\d{1,2}\s*DE\s*[A-ZÑÁÉÍÓÚ]+\s*DE\s*\d{4})/i);
  if (fechaMatch) {
    const iso = parseLongSpanishDate(fechaMatch[1]);
    if (iso) data.fechaConsulta = iso;
  }

  const generacionMatch = textNorm.match(/GENERACION:\s*([A-Z]{3}\d{4})/);
  if (generacionMatch) data.generacion = formatPeriodCode(generacionMatch[1]);

  const promedioGeneralMatch = textNorm.match(/PROMEDIO GENERAL:\s*([\d.]+)/);
  if (promedioGeneralMatch) data.promedioGeneral = promedioGeneralMatch[1];
  else warnings.push('No se encontró el promedio general en el documento.');

  const reinscripciones = contarReinscripciones(textNorm);
  if (reinscripciones >= 1) data.reinscripcion = String(reinscripciones);
  else warnings.push('No se pudo determinar el número de reinscripción; complétalo manualmente.');

  const ultimoSemestre = findUltimoSemestreCursado(textNorm);
  if (ultimoSemestre) {
    data.semestreCursado = formatPeriodCode(ultimoSemestre.codigo);
    data.promedioSemestre = String(ultimoSemestre.promedio);
  } else {
    warnings.push('No se pudo determinar el último semestre cursado; complétalo manualmente.');
  }

  return { data, warnings };
}
