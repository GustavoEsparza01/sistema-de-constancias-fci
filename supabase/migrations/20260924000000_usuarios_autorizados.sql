-- =====================================================================
-- Lista de correos autorizados para entrar al sistema.
--
-- Supabase Auth dice QUIÉN es la persona (su correo y contraseña);
-- esta tabla dice si PUEDE entrar. La API la
-- consulta en cada inicio de sesión y en cada petición protegida (ver
-- api/src/autorizados.js), así que dar de baja a alguien surte efecto de
-- inmediato: basta con borrar su fila o poner activo = false.
--
-- Con su correo en esta tabla, cada persona crea su propia contraseña desde
-- el login ("Crear o cambiar mi contraseña"), con un código que le llega al correo.
-- =====================================================================

create table if not exists public.usuarios_autorizados (
  -- Siempre en minúsculas: la API compara contra el correo en minúsculas.
  email       text primary key check (email = lower(email)),
  nombre      text,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

-- Igual que el resto de las tablas: RLS sin políticas, cerrada al navegador.
-- Solo la API entra, con la llave service_role.
alter table public.usuarios_autorizados enable row level security;

-- Para dar de alta a alguien (desde el SQL Editor de Supabase):
--   insert into public.usuarios_autorizados (email, nombre)
--   values ('nombre@delfin.unacar.mx', 'Nombre Apellido');
