/**
 * Autenticación con Supabase Auth, siempre a través de la API: el
 * navegador manda correo y contraseña aquí, nunca a Supabase, así que no
 * necesita ninguna llave de Supabase (ver README, "Arquitectura").
 *
 * Las cuentas las crea un administrador en el panel de Supabase
 * (Authentication > Users > Add user). No hay registro público: es una
 * herramienta interna de la Secretaría.
 *
 * El frontend guarda el access_token y lo manda como
 * "Authorization: Bearer <token>"; requireAuth lo valida contra Supabase
 * en cada petición a un endpoint protegido.
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createClient, isAuthRetryableFetchError } from '@supabase/supabase-js';
import { config, supabaseConfigurado } from './config.js';
import { getSupabase } from './supabase.js';

/**
 * Un cliente nuevo por operación de sesión. signInWithPassword y
 * refreshSession guardan la sesión del usuario dentro del cliente; si se
 * hicieran con el cliente compartido de supabase.js, las consultas
 * siguientes de la API saldrían con el token de ese usuario en vez de la
 * llave service_role.
 */
function clienteDeSesion() {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Solo lo que el frontend necesita; nunca el objeto de usuario completo de Supabase. */
function respuestaDeSesion(session) {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at, // segundos desde epoch
    user: { id: session.user.id, email: session.user.email },
  };
}

function sinSupabase(res) {
  return res.status(503).json({ error: 'La autenticación no está configurada en el servidor.' });
}

/**
 * Supabase no contestó (red caída o error 5xx): no es culpa de las
 * credenciales, así que no se debe responder "contraseña incorrecta".
 */
function falloDeServicio(error) {
  return isAuthRetryableFetchError(error) || (error?.status ?? 0) >= 500;
}

function servicioCaido(res, error) {
  console.error('Supabase Auth no respondió:', error.message);
  return res.status(503).json({ error: 'El servicio de autenticación no respondió. Intenta de nuevo.' });
}

/**
 * Middleware para los endpoints que requieren sesión. Deja al usuario en
 * req.user. Todo endpoint con datos de alumnos debe pasar por aquí.
 */
export async function requireAuth(req, res, next) {
  if (!supabaseConfigurado()) return sinSupabase(res);

  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Falta iniciar sesión.' });
  }

  const { data, error } = await getSupabase().auth.getUser(token);
  if (falloDeServicio(error)) return servicioCaido(res, error);
  if (error || !data.user) {
    return res.status(401).json({ error: 'La sesión expiró o no es válida.' });
  }
  req.user = { id: data.user.id, email: data.user.email };
  return next();
}

// Frena intentos de adivinar contraseñas: 10 intentos fallidos por IP cada
// 15 minutos. Los inicios de sesión correctos no cuentan.
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' },
});

export const authRouter = Router();

authRouter.post('/login', limiteLogin, async (req, res) => {
  if (!supabaseConfigurado()) return sinSupabase(res);

  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ error: 'Escribe tu correo y tu contraseña.' });
  }

  const { data, error } = await clienteDeSesion().auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (falloDeServicio(error)) return servicioCaido(res, error);
  if (error || !data.session) {
    // Mismo mensaje para correo inexistente y contraseña incorrecta, para no
    // revelar qué correos tienen cuenta.
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }
  return res.json(respuestaDeSesion(data.session));
});

authRouter.post('/refresh', async (req, res) => {
  if (!supabaseConfigurado()) return sinSupabase(res);

  const { refreshToken } = req.body ?? {};
  if (typeof refreshToken !== 'string' || !refreshToken) {
    return res.status(400).json({ error: 'Falta el refresh token.' });
  }

  const { data, error } = await clienteDeSesion().auth.refreshSession({ refresh_token: refreshToken });
  if (falloDeServicio(error)) return servicioCaido(res, error);
  if (error || !data.session) {
    return res.status(401).json({ error: 'La sesión expiró. Inicia sesión de nuevo.' });
  }
  return res.json(respuestaDeSesion(data.session));
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/** Revoca el refresh token en Supabase; el access token deja de servir cuando expira (1 h). */
authRouter.post('/logout', requireAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  await getSupabase().auth.admin.signOut(token);
  res.status(204).end();
});
