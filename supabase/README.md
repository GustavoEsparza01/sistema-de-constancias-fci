# Base de datos (Supabase)

## Estado

La aplicación **todavía no usa esta base de datos**. Hoy persiste en
`localStorage` del navegador (ver `frontend/src/utils/storage.js`). Esta
carpeta deja el terreno listo para la migración.

## `migrations/20260923000000_esquema_inicial.sql`

Es una **propuesta**, no un esquema aplicado. Se infirió de la forma de los
datos que la app guarda hoy en `localStorage`, no de consultas reales —
porque no hay ninguna. Revísalo antes de aplicarlo.

Incluye las tablas `constancias` y `programas`, una secuencia para el folio
consecutivo (que resuelve el riesgo de folios repetidos documentado en el
README raíz) y `ENABLE ROW LEVEL SECURITY` en ambas tablas, sin políticas:
la base queda cerrada al navegador y solo la API entra, con la llave
`service_role`.

## Aplicar el esquema

```bash
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```

## Exportar el esquema real

Si prefieres diseñar las tablas desde el panel de Supabase y luego traer el
esquema al repositorio:

```bash
# Solo el esquema, sin datos
npx supabase db dump --linked --file supabase/migrations/<timestamp>_esquema_inicial.sql

# Con los datos, para un respaldo completo
npx supabase db dump --linked --data-only --file respaldo-datos.sql
```

El `<timestamp>` debe tener el formato `YYYYMMDDHHMMSS`; Supabase aplica las
migraciones en orden alfabético.

## Respaldos automáticos

`.github/workflows/backup.yml` corre `pg_dump` cada domingo a las 06:00 UTC
y guarda el resultado como artifact con 30 días de retención. Requiere el
secret `SUPABASE_DB_URL` en GitHub (Settings > Secrets and variables >
Actions), con la cadena de conexión que aparece en Supabase en
Project Settings > Database > Connection string > URI.
