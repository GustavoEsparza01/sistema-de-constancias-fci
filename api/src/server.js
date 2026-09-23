/**
 * API del sistema de constancias FCI-UNACAR.
 *
 * Es el único componente que habla con Supabase, usando la llave
 * service_role. El frontend nunca toca la base de datos directamente.
 *
 * Estado actual: esqueleto. Todavía no expone endpoints de negocio porque
 * la app sigue persistiendo en localStorage (ver README, "Qué falta").
 * Lo que ya está listo es el arranque, el CORS y el health check que
 * Render consulta para decidir si el despliegue quedó sano.
 */
import express from 'express';
import cors from 'cors';
import { config, supabaseConfigurado } from './config.js';
import { getSupabase } from './supabase.js';

const app = express();

app.use(express.json());

// CORS restringido al origen del frontend (Vercel en producción,
// localhost:5173 en desarrollo). Nada de "*": la API llegará a manejar
// datos de alumnos.
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

/**
 * Health check que consulta Render (healthCheckPath en render.yaml).
 *
 * Con Supabase configurado hace una consulta mínima (un head count de una
 * fila) y responde 503 si la base no contesta. Mientras no exista el
 * proyecto de Supabase responde 200 con supabase: "no configurado", para
 * que el servicio pueda desplegarse antes que la base de datos; en cuanto
 * se definan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY, el check pasa a ser
 * real sin tocar el código.
 */
app.get('/health', async (_req, res) => {
  if (!supabaseConfigurado()) {
    return res.status(200).json({ ok: true, supabase: 'no configurado' });
  }

  try {
    const { error } = await getSupabase()
      .from(config.healthTable)
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (error) throw error;
    return res.status(200).json({ ok: true, supabase: 'conectado' });
  } catch (error) {
    console.error('Health check falló:', error.message);
    return res.status(503).json({ ok: false, supabase: 'error' });
  }
});

app.listen(config.port, () => {
  console.log(`API escuchando en el puerto ${config.port}`);
  console.log(`CORS permitido para: ${config.frontendUrl}`);
  console.log(`Supabase: ${supabaseConfigurado() ? 'configurado' : 'no configurado'}`);
});
