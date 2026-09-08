import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import ConstanciaPdfDocument from './ConstanciaPdfDocument';

const DIACRITICS_RANGE_START = 0x0300;
const DIACRITICS_RANGE_END = 0x036f;

/** Slug simple para el nombre del archivo, a partir del nombre del alumno. */
function slug(text) {
  const chars = String(text || 'constancia')
    .normalize('NFD')
    .split('')
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < DIACRITICS_RANGE_START || code > DIACRITICS_RANGE_END;
    })
    .join('');

  return chars
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Genera el PDF real de la constancia (mismo texto que la vista previa,
 * ver utils/constanciaText.js) y dispara su descarga en el navegador.
 *
 * `folio` es el sufijo mostrado en la vista previa (p. ej. "2026-101"),
 * sin el prefijo "FCI-".
 */
export async function downloadConstanciaPdf({ tipo, data, folio }) {
  const blob = await pdf(createElement(ConstanciaPdfDocument, { tipo, data, folio })).toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `Constancia-FCI-${folio}-${slug(data.alumno)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
