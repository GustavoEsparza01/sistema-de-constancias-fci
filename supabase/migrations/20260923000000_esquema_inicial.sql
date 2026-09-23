-- =====================================================================
-- Esquema inicial — PROPUESTA, no aplicada todavía.
--
-- IMPORTANTE: este archivo NO se dedujo de consultas reales, porque la
-- aplicación todavía no habla con ninguna base de datos. Se infirió de la
-- forma que tienen los objetos guardados hoy en localStorage:
--   - frontend/src/hooks/useHistorial.js  (clave constancias-fci-historial-v1)
--   - frontend/src/hooks/useProgramas.js  (clave constancias-fci-programas-v1)
--   - frontend/src/data/seedHistorial.js  (forma del campo "data")
--
-- Revísalo y ajústalo antes de aplicarlo. Si prefieres partir de cero,
-- puedes borrar este archivo sin consecuencias.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Catálogo de programas educativos (Regla P1).
-- Hoy vive en localStorage y cada navegador tiene su propia copia.
-- ---------------------------------------------------------------------
create table if not exists public.programas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  creado_en   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Folio consecutivo (Regla F1).
--
-- Una secuencia de Postgres en lugar del cálculo por longitud del arreglo
-- que se hace hoy en el navegador (nextFolio en useHistorial.js). Esto es
-- lo que resuelve el problema documentado en el README: dos personas
-- generando constancias al mismo tiempo ya no pueden repetir folio,
-- porque la secuencia es atómica.
-- ---------------------------------------------------------------------
create sequence if not exists public.folio_consecutivo start with 101;

create or replace function public.siguiente_folio()
returns text
language sql
volatile
as $$
  select 'FCI-' || to_char(now() at time zone 'America/Mexico_City', 'YYYY')
      || '-' || nextval('public.folio_consecutivo')::text;
$$;

-- ---------------------------------------------------------------------
-- Historial de constancias generadas.
--
-- "data" se deja como jsonb a propósito: los campos varían según el tipo
-- de constancia (normal vs. promedio) y los define
-- frontend/src/data/formFields.js, que es la fuente de verdad del
-- formulario. Guardar el nombre del programa dentro de "data" (y no una
-- llave foránea a "programas") conserva el comportamiento actual: renombrar
-- un programa no altera el texto de constancias ya generadas.
-- ---------------------------------------------------------------------
create table if not exists public.constancias (
  id                 uuid primary key default gen_random_uuid(),
  folio              text not null unique,
  tipo               text not null check (tipo in ('normal', 'promedio')),
  estado             text not null default 'vigente' check (estado in ('vigente', 'anulada')),
  es_ejemplo         boolean not null default false,
  descargas          integer not null default 1 check (descargas >= 0),
  fecha_generacion   date not null default current_date,
  data               jsonb not null,
  creado_en          timestamptz not null default now(),
  actualizado_en     timestamptz not null default now()
);

-- El historial se ordena por fecha de generación descendente (ver
-- historialOrdenado en useHistorial.js).
create index if not exists constancias_fecha_generacion_idx
  on public.constancias (fecha_generacion desc, creado_en desc);

create index if not exists constancias_estado_idx
  on public.constancias (estado);

-- ---------------------------------------------------------------------
-- Row Level Security.
--
-- Se habilita en ambas tablas y NO se crea ninguna política. El efecto es
-- que los roles anon y authenticated no pueden leer ni escribir nada: la
-- base queda cerrada por completo desde el navegador. La API sí entra,
-- porque usa la llave service_role, que salta RLS por diseño.
--
-- Si algún día el frontend llegara a hablar directo con Supabase, aquí es
-- donde habría que escribir políticas explícitas — y antes haría falta
-- autenticación, porque sin ella las políticas solo podrían apoyarse en el
-- rol anon (ver README, sección de seguridad).
-- ---------------------------------------------------------------------
alter table public.programas   enable row level security;
alter table public.constancias enable row level security;

-- Semilla del catálogo (ver frontend/src/data/programas.js).
insert into public.programas (nombre) values
  ('Ingeniería en Sistemas Computacionales'),
  ('Ingeniería en Diseño Multimedia'),
  ('Maestría en Tecnologías de Información Emergentes')
on conflict (nombre) do nothing;
