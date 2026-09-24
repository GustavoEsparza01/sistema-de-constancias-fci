/**
 * Autenticación con Supabase Auth, siempre a través de la API: el
 * navegador manda correo y contraseña aquí, nunca a Supabase, así que no
 * necesita ninguna llave de Supabase (ver README, "Arquitectura").
 *
 * Solo entran los correos que el administrador dio de alta en la lista de
 * autorizados (ver autorizados.js). Cada persona crea su propia contraseña:
 * pide un código que le llega a su correo (POST /auth/codigo) y con él fija
 * la contraseña (POST /auth/crear-password). El mismo camino sirve para
 * "olvidé mi contraseña". No hay registro abierto: es una herramienta
 * interna de la Secretaría.
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
import { estaAutorizado, MENSAJE_NO_AUTORIZADO } from './autorizados.js';

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
 *
 * Revisa la lista de autorizados en cada petición, no solo al entrar: así
 * quitar a alguien de la lista le corta el acceso aunque tenga una sesión
 * abierta.
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
  try {
    if (!(await estaAutorizado(data.user.email))) {
      return res.status(403).json({ error: MENSAJE_NO_AUTORIZADO });
    }
  } catch (err) {
    return servicioCaido(res, err);
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
  try {
    if (!(await estaAutorizado(data.user.email))) {
      await getSupabase().auth.admin.signOut(data.session.access_token);
      return res.status(403).json({ error: MENSAJE_NO_AUTORIZADO });
    }
  } catch (err) {
    return servicioCaido(res, err);
  }
  return res.json(respuestaDeSesion(data.session));
});

// Pedir código: 5 solicitudes por IP cada 15 minutos. Supabase además deja
// pasar como máximo un correo por minuto a la misma dirección.
const limiteCodigo = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.' },
});

// Frena intentos de adivinar el código: 10 intentos fallidos por IP cada 15 minutos.
const limiteCrearPassword = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' },
});

const LONGITUD_MINIMA_PASSWORD = 8;

const MENSAJE_CODIGO_ENVIADO =
  'Si tu correo está registrado, te llegará un código en unos minutos. Revisa también la carpeta de correo no deseado.';

function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

/**
 * Manda un código de un solo uso al correo, para crear la contraseña por
 * primera vez o para cambiarla si se olvidó. Responde lo mismo esté o no
 * autorizado el correo, para no revelar quién tiene acceso.
 */
authRouter.post('/codigo', limiteCodigo, async (req, res) => {
  if (!supabaseConfigurado()) return sinSupabase(res);

  const email = normalizarEmail(req.body?.email);
  if (!email) return res.status(400).json({ error: 'Escribe tu correo.' });

  try {
    if (!(await estaAutorizado(email))) return res.json({ mensaje: MENSAJE_CODIGO_ENVIADO });
  } catch (err) {
    return servicioCaido(res, err);
  }

  // La cuenta se crea aquí, con la llave service_role, la primera vez que
  // la persona pide su código. Así el registro público de Supabase ("Allow
  // new users to sign up") puede quedar apagado. Todavía no tiene
  // contraseña: nadie puede entrar con ella hasta verificar el código.
  const { error: errorAlta } = await getSupabase().auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (errorAlta && errorAlta.code !== 'email_exists' && errorAlta.code !== 'user_already_exists') {
    if (falloDeServicio(errorAlta)) return servicioCaido(res, errorAlta);
    console.error('No se pudo crear la cuenta:', errorAlta.code, errorAlta.message);
    return res.status(500).json({
      error: 'No se pudo enviar el código. Intenta de nuevo más tarde.',
    });
  }

  const { error } = await clienteDeSesion().auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) {
    if (falloDeServicio(error)) return servicioCaido(res, error);
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Ya se envió un código hace poco. Espera un minuto antes de pedir otro.',
      });
    }
    console.error('No se pudo enviar el código:', error.code, error.message);
    return res.status(500).json({
      error: 'No se pudo enviar el código. Intenta de nuevo más tarde.',
    });
  }
  return res.json({ mensaje: MENSAJE_CODIGO_ENVIADO });
});

/**
 * Verifica el código que llegó al correo y fija la contraseña. Si todo
 * sale bien, la persona queda con la sesión iniciada.
 */
authRouter.post('/crear-password', limiteCrearPassword, async (req, res) => {
  if (!supabaseConfigurado()) return sinSupabase(res);

  const email = normalizarEmail(req.body?.email);
  const codigo = typeof req.body?.codigo === 'string' ? req.body.codigo.replace(/\s/g, '') : '';
  const { password } = req.body ?? {};
  if (!email || !codigo)
    return res.status(400).json({ error: 'Escribe tu correo y el código que te llegó.' });
  if (typeof password !== 'string' || password.length < LONGITUD_MINIMA_PASSWORD) {
    return res.status(400).json({
      error: `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`,
    });
  }

  const { data, error } = await clienteDeSesion().auth.verifyOtp({
    email,
    token: codigo,
    type: 'email',
  });
  if (falloDeServicio(error)) return servicioCaido(res, error);
  if (error || !data.session) {
    return res.status(401).json({ error: 'El código no es válido o ya expiró. Pide uno nuevo.' });
  }

  try {
    if (!(await estaAutorizado(email))) {
      await getSupabase().auth.admin.signOut(data.session.access_token);
      return res.status(403).json({ error: MENSAJE_NO_AUTORIZADO });
    }
  } catch (err) {
    return servicioCaido(res, err);
  }

  const { error: errorPassword } = await getSupabase().auth.admin.updateUserById(data.user.id, { password });
  if (errorPassword) {
    if (falloDeServicio(errorPassword)) return servicioCaido(res, errorPassword);
    if (errorPassword.code === 'weak_password') {
      return res.status(400).json({
        error: 'Esa contraseña es muy débil o muy común. Elige otra.',
      });
    }
    console.error('No se pudo guardar la contraseña:', errorPassword.code, errorPassword.message);
    return res.status(500).json({ error: 'No se pudo guardar la contraseña. Intenta de nuevo.' });
  }

  // Si la cambió porque la olvidó, cierra las sesiones que tuviera abiertas
  // en otros equipos. La de este navegador sigue.
  await getSupabase().auth.admin.signOut(data.session.access_token, 'others');

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
