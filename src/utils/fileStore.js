/**
 * Guarda archivos (Blob) en IndexedDB. localStorage no sirve para esto:
 * solo guarda texto y su cuota (~5 MB) se llenaría con un solo PDF.
 * Igual que utils/storage.js, los errores se registran y no tumban la app.
 */

const DB_NAME = 'constancias-fci-archivos';
const STORE = 'archivos';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run(mode, action) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function loadFile(key) {
  try {
    return (await run('readonly', (store) => store.get(key))) ?? null;
  } catch (error) {
    console.warn(`No se pudo leer el archivo "${key}":`, error);
    return null;
  }
}

/** @returns {Promise<boolean>} si se pudo guardar */
export async function saveFile(key, blob) {
  try {
    await run('readwrite', (store) => store.put(blob, key));
    return true;
  } catch (error) {
    console.warn(`No se pudo guardar el archivo "${key}":`, error);
    return false;
  }
}
