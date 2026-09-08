/**
 * Utilidades para convertir números y fechas a su forma escrita en español,
 * tal como aparecen en los formatos oficiales de constancias (ver
 * "Reglas de negocio — Sistema de Constancias").
 *
 * Reglas D1 y D3: el número de reinscripción se escribe como ordinal
 * ("cuarta") y la fecha de expedición se descompone en día / mes /
 * últimas dos cifras del año ("dos mil" es texto fijo de la plantilla).
 */

export const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const ORDINALES = [
  '',
  'primera',
  'segunda',
  'tercera',
  'cuarta',
  'quinta',
  'sexta',
  'séptima',
  'octava',
  'novena',
  'décima',
  'décima primera',
  'décima segunda',
  'décima tercera',
  'décima cuarta',
  'décima quinta',
  'décima sexta',
  'décima séptima',
  'décima octava',
  'décima novena',
  'vigésima',
];

const UNIDADES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];

const ESPECIALES = {
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte',
  21: 'veintiuno',
  22: 'veintidós',
  23: 'veintitrés',
  24: 'veinticuatro',
  25: 'veinticinco',
  26: 'veintiséis',
  27: 'veintisiete',
  28: 'veintiocho',
  29: 'veintinueve',
};

const DECENAS = {
  30: 'treinta',
  40: 'cuarenta',
  50: 'cincuenta',
  60: 'sesenta',
  70: 'setenta',
  80: 'ochenta',
  90: 'noventa',
};

const CENTENAS = {
  100: 'ciento',
  200: 'doscientos',
  300: 'trescientos',
  400: 'cuatrocientos',
  500: 'quinientos',
  600: 'seiscientos',
  700: 'setecientos',
  800: 'ochocientos',
  900: 'novecientos',
};

/**
 * Convierte un entero (0-9999) a su forma escrita en español.
 * Suficiente para días de mes, folios cortos y las últimas dos cifras de un año.
 */
export function numberToWords(n) {
  if (n === 0) return 'cero';
  if (n === 100) return 'cien';
  if (n < 10) return UNIDADES[n];
  if (ESPECIALES[n]) return ESPECIALES[n];

  if (n < 100) {
    const decena = Math.floor(n / 10) * 10;
    const unidad = n % 10;
    return DECENAS[decena] + (unidad ? ` y ${UNIDADES[unidad]}` : '');
  }

  if (n < 1000) {
    const centena = Math.floor(n / 100) * 100;
    const resto = n % 100;
    return CENTENAS[centena] + (resto ? ` ${numberToWords(resto)}` : '');
  }

  if (n < 10000) {
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    const prefijo = miles === 1 ? 'mil' : `${numberToWords(miles)} mil`;
    return prefijo + (resto ? ` ${numberToWords(resto)}` : '');
  }

  return String(n);
}

/** Convierte 1-20 al ordinal femenino usado en "cuarta reinscripción". */
export function ordinalWord(n) {
  return ORDINALES[n] || `${numberToWords(n)}ª`;
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Parsea un valor de <input type="date"> ("YYYY-MM-DD") sin líos de zona horaria. */
export function parseYMD(value) {
  if (!value) return null;
  const parts = value.split('-');
  if (parts.length !== 3) return null;
  return { y: parseInt(parts[0], 10), m: parseInt(parts[1], 10), d: parseInt(parts[2], 10) };
}

/** "09 de febrero" */
export function formatDateNumeric(value) {
  const p = parseYMD(value);
  if (!p) return null;
  return `${pad2(p.d)} de ${MESES[p.m - 1]}`;
}

/** "09 de febrero al 19 de junio del 2026" (Regla D2). */
export function formatDateRange(startValue, endValue) {
  const start = parseYMD(startValue);
  const end = parseYMD(endValue);
  if (!start || !end) return null;
  return `${pad2(start.d)} de ${MESES[start.m - 1]} al ${pad2(end.d)} de ${MESES[end.m - 1]} del ${end.y}`;
}

/**
 * Descompone una fecha en sus tres piezas variables para la fórmula de
 * expedición: "a los <dia> días del mes de <mes> del dos mil <anioSuf>."
 * (Regla D3 — "dos mil" es texto fijo de la plantilla, no se captura).
 */
export function dateWordParts(value) {
  const p = parseYMD(value);
  if (!p) return null;
  const dia = p.d === 1 ? 'primero' : numberToWords(p.d);
  return { dia, mes: MESES[p.m - 1], anioSuf: numberToWords(p.y % 100) };
}

/** Fecha de hoy en formato "YYYY-MM-DD", para precargar inputs type="date". */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
