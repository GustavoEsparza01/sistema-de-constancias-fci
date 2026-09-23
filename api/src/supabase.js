/**
 * Cliente de Supabase con la llave service_role. Esta llave salta las
 * políticas RLS, por eso solo puede existir aquí, del lado del servidor,
 * y nunca debe viajar al navegador.
 */
import { createClient } from '@supabase/supabase-js';
import { config, supabaseConfigurado } from './config.js';

let cliente = null;

/** Devuelve el cliente (singleton), o null si todavía no hay Supabase configurado. */
export function getSupabase() {
  if (!supabaseConfigurado()) return null;
  if (!cliente) {
    cliente = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cliente;
}
