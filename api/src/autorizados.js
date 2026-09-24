/**
 * Lista de correos que pueden entrar al sistema (tabla usuarios_autorizados,
 * ver supabase/migrations/20260924000000_usuarios_autorizados.sql).
 *
 * El administrador da de alta aquí el correo de cada persona; con eso ella
 * misma puede crear su contraseña (ver auth.js, POST /auth/codigo). Se
 * revisa al pedir el código, al entrar y en cada petición protegida.
 */
import { getSupabase } from './supabase.js';

/** true si el correo está en la lista y activo. Lanza si la base no contesta. */
export async function estaAutorizado(email) {
  if (typeof email !== 'string' || !email) return false;

  const { data, error } = await getSupabase()
    .from('usuarios_autorizados')
    .select('email')
    .eq('email', email.trim().toLowerCase())
    .eq('activo', true)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export const MENSAJE_NO_AUTORIZADO = 'Tu cuenta no tiene acceso al sistema. Pídeselo a quien lo administra.';
