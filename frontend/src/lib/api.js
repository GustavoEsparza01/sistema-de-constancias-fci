/**
 * Punto único para hablar con la API (servicio de Render). Hoy solo lo usa
 * el inicio de sesión (hooks/useAuth.js); los datos todavía persisten en
 * localStorage (ver utils/storage.js) hasta que se migren a la base de
 * datos. La URL sale de una variable de entorno, no del código.
 *
 * VITE_API_URL se define en Vercel (producción) y en frontend/.env.local
 * (desarrollo). Ver frontend/.env.example.
 */

import { loadSession } from './session';

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

/** Error de la API, con el código HTTP para distinguir p. ej. 401 (sesión) de 503 (servidor). */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * fetch con JSON y manejo de error uniforme. Si hay sesión, manda el
 * access token; el mensaje de error es el que devolvió la API, si lo hay.
 */
export async function apiFetch(path, options = {}) {
  const session = loadSession();
  let response;
  try {
    response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error ?? `La API respondió ${response.status} en ${path}`, response.status);
  }
  return response.status === 204 ? null : response.json();
}
