import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * Extrae el texto plano de un PDF (todas las páginas, en orden de lectura)
 * completamente en el navegador — no sube el archivo a ningún servidor.
 * Si el PDF no tiene texto seleccionable (por ejemplo, es una hoja
 * escaneada), regresa una cadena vacía.
 */
export async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + ' ';
  }
  return text;
}
