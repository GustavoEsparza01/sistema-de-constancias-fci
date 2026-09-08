/**
 * Persistencia genérica en localStorage, con try/catch (Safari privado,
 * cuota llena, etc. no deben tumbar la app). Cada hook de datos
 * (useHistorial, usePrograms, ...) trae su propia STORAGE_KEY.
 *
 * Nota: en el sistema real esto debe vivir en una base de datos (Regla
 * DB1), no en el navegador — ver "Qué falta" en el README.
 */

export function loadJSON(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`No se pudo leer "${key}" de localStorage:`, error);
    return null;
  }
}

export function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`No se pudo guardar "${key}" en localStorage:`, error);
  }
}
