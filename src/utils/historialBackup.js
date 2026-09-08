/**
 * Respaldo del historial a un archivo JSON y su restauración — mientras el
 * historial siga viviendo solo en localStorage de este navegador (ver
 * "Qué falta" en el README), esto es lo único que protege esos datos de
 * perderse si se borra el caché o se cambia de equipo.
 */

export function downloadHistorialBackup(historial) {
  const blob = new Blob([JSON.stringify(historial, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `constancias-fci-historial-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Lee y valida un archivo de respaldo; regresa solo las entradas con la forma esperada. */
export async function readHistorialBackupFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('El archivo no contiene una lista de constancias.');
  }
  return parsed.filter((e) => e && typeof e === 'object' && e.folio && e.tipo && e.data);
}
