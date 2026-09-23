/**
 * Punto único para hablar con la API (servicio de Render). Hoy la app
 * todavía persiste en localStorage (ver utils/storage.js), así que nadie
 * llama a esto aún: existe para que, cuando se migre a la base de datos,
 * la URL salga de una variable de entorno y no quede escrita en el código.
 *
 * VITE_API_URL se define en Vercel (producción) y en frontend/.env.local
 * (desarrollo). Ver frontend/.env.example.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/** true si la API ya está configurada; permite seguir usando localStorage mientras no lo esté. */
export function apiConfigurada() {
  return BASE_URL !== '';
}

/** Une la URL base con una ruta, tolerando barras de sobra en cualquiera de las dos. */
export function apiUrl(path) {
  if (!apiConfigurada()) {
    throw new Error('VITE_API_URL no está configurada (ver frontend/.env.example).');
  }
  return `${BASE_URL.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
}

/** fetch con JSON y manejo de error uniforme. */
export async function apiFetch(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    throw new Error(`La API respondió ${response.status} en ${path}`);
  }
  return response.status === 204 ? null : response.json();
}
