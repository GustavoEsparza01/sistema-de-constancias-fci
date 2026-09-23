# Constancias FCI

Sistema de generación de constancias en PDF para la Secretaría Académica de
la Facultad de Ciencias de la Información (FCI), UNACAR. Reemplaza el flujo
actual de editar el Word a mano: un formulario captura solo los datos
variables, una vista previa muestra el documento resultante en tiempo real,
y al generar se descarga el PDF real (mismo texto que la vista previa, ver
`utils/constanciaText.js` y `pdf/ConstanciaPdfDocument.jsx`).

Por ahora corre completamente en el navegador: el historial vive en
`localStorage` de ese equipo, sin backend ni base de datos compartida entre
usuarios. Ver "Qué falta" más abajo para lo que hace falta para varios
equipos en red.

El repositorio ya está organizado como monorepo (`frontend/` + `api/` +
`supabase/`) para poder alojar cada pieza por separado. La API todavía es un
esqueleto: expone `/health` y nada más, porque la aplicación sigue
persistiendo en el navegador.

## Arquitectura

Tres piezas desplegadas por separado. La regla que las ordena: **solo la API
toca la base de datos**, con la llave `service_role`; el navegador nunca ve
esa llave ni habla con Supabase directamente.

```
   Navegador
       |
       |  HTTPS
       v
+------------------+         +------------------+        +------------------+
|  frontend/       |  fetch  |  api/            |   pg   |  Supabase        |
|  React 19 + Vite | ------> |  Node 20+Express | -----> |  PostgreSQL      |
|                  |         |                  |        |                  |
|  Vercel          |         |  Render (Docker) |        |  RLS activo,     |
|  VITE_API_URL    |         | SERVICE_ROLE_KEY |        |  sin políticas   |
+------------------+         +------------------+        +------------------+
      público                   CORS restringido              cerrado al
                                a FRONTEND_URL                navegador
```

- **`frontend/`** — la aplicación React + Vite. Es lo único público. No
  contiene ninguna llave de Supabase, ni la `anon` ni la `service_role`.
- **`api/`** — Express en un contenedor Docker. Único componente con la
  llave `service_role`. CORS restringido al origen del frontend.
- **`supabase/migrations/`** — el esquema en SQL. RLS habilitado en todas
  las tablas y sin políticas, así que la base queda cerrada a cualquiera que
  no sea la API.

### Estado actual

La API es un esqueleto: solo tiene `GET /health`. El frontend sigue guardando
todo en `localStorage` y **no le hace ninguna llamada**. La estructura existe
para que la migración a base de datos sea agregar endpoints, no reorganizar
el repositorio.

Mientras `SUPABASE_URL` no esté configurada, `/health` responde
`200 {"ok": true, "supabase": "no configurado"}`, para que el servicio pueda
desplegarse en Render antes de que exista el proyecto de Supabase. En cuanto
se definan las variables, el check hace una consulta real y devuelve 503 si
la base no contesta.

### Seguridad: lo que falta antes de producción con datos reales

**El sistema no tiene autenticación.** Cualquiera con la URL del frontend
puede generar constancias. Mientras el historial vivió en `localStorage` eso
no exponía nada, pero en cuanto los datos de alumnos (nombre, matrícula,
promedios) estén en una base compartida, hace falta login antes de exponer
el sistema a internet. La arquitectura elegida (API con `service_role`, RLS
cerrado) es la que permite agregarlo después sin rehacer nada, pero no lo
sustituye.

## Poner a correr el proyecto

Requiere Node 20+.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # opcional mientras no haya API
npm run dev
```

Abre la URL que imprime Vite (normalmente `http://localhost:5173`).

Otros comandos, todos desde `frontend/`:

```bash
npm run build         # build de producción a dist/
npm run preview       # sirve el build de producción localmente
npm run lint          # oxlint
npm run format        # prettier --write
npm run format:check  # prettier --check
```

### API

```bash
cd api
npm install
cp .env.example .env    # se puede dejar vacío: arranca sin Supabase
npm run dev             # node --watch, escucha en http://localhost:3000
```

Comprobar que responde:

```bash
curl http://localhost:3000/health
# {"ok":true,"supabase":"no configurado"}
```

Con Docker:

```bash
docker build -t constancias-api ./api
docker run --rm -p 3000:3000 --env-file api/.env constancias-api
```

## Estructura del proyecto

```
.
├── frontend/              # aplicación React + Vite → Vercel
├── api/                   # API Express en Docker → Render
├── supabase/migrations/   # esquema de la base de datos en SQL
├── .github/workflows/     # CI y respaldo semanal
└── render.yaml            # Blueprint de Render
```

Dentro de `frontend/`:

```
frontend/src/
├── App.jsx                 # orquesta vista (Nueva/Historial), toast, historial
├── main.jsx                # punto de entrada de React
├── index.css                # design tokens + estilos (una hoja global, ver nota abajo)
├── constants/
│   └── tipos.js             # TIPO_CONSTANCIA, VISTA, TIPO_POR_VISTA, TIPO_LABEL
├── data/
│   ├── formFields.js         # config de campos por tipo (fuente de verdad del formulario)
│   ├── programas.js          # semilla inicial del catálogo de programas (Regla P1)
│   ├── calendarioInicial.js  # fechas del calendario escolar 2026-2027 (semestres y vacaciones)
│   └── seedHistorial.js      # datos de ejemplo para no arrancar con historial vacío
├── utils/
│   ├── spanishText.js        # números/fechas → texto en español (Reglas D1, D2, D3)
│   ├── constanciaText.js     # texto legal de cada tipo, fuente única para preview y PDF
│   ├── storage.js            # localStorage genérico (loadJSON/saveJSON), con try/catch
│   ├── fileStore.js          # archivos (PDF del calendario) en IndexedDB
│   ├── historialBackup.js    # exportar/importar el historial como archivo JSON
│   └── validation.js         # isComplete(tipo, data)
├── hooks/
│   ├── useHistorial.js       # historial + folio siguiente + anular/reactivar/descargas + import
│   ├── useProgramas.js       # catálogo de programas, persistido en localStorage (sin panel de edición aún)
│   ├── useCalendario.js      # calendario escolar (fechas + PDF oficial) y semestre vigente
│   └── useToast.js           # mensaje transitorio
├── pdf/
│   ├── ConstanciaPdfDocument.jsx  # documento @react-pdf/renderer (mismo texto y logos que la vista previa)
│   └── downloadConstanciaPdf.js   # arma el PDF y dispara la descarga en el navegador
├── kardex/
│   ├── extractPdfText.js     # texto plano de un PDF, en el navegador (pdfjs-dist)
│   └── parseKardex.js        # localiza matrícula/alumno/programa/promedios por sus etiquetas
├── assets/
│   ├── logo-unacar.png       # escudo UNACAR (recortado de una captura, ver nota abajo)
│   └── logo-fci.png          # logo de la FCI (recortado de una captura, ver nota abajo)
├── components/
│   ├── atoms/                 # VarField.jsx (ámbar = dato vacío), Icon.jsx (Material Symbols)
│   ├── form/                 # Field, inputs.jsx, FormPanel.jsx (dirigido por data/formFields.js), CalendarioPicker.jsx
│   ├── document/             # DocumentShell (membrete con logos) + Runs + PreviewNormal + PreviewPromedio + PreviewDocument
│   ├── history/               # HistorialTable.jsx, DocumentModal.jsx (con descarga real de PDF)
│   ├── kardex/KardexUpload.jsx  # carga de kárdex PDF, precarga el formulario
│   ├── layout/                # Sidebar.jsx, TopBar.jsx
│   └── Toast.jsx
└── views/
    ├── InicioView.jsx             # panel de métricas (total, por tipo, últimas constancias)
    ├── NuevaConstanciaView.jsx
    ├── CalendarioView.jsx         # PDF oficial del calendario + fechas de cada semestre
    └── HistorialView.jsx          # + exportar/importar respaldo
```

**Por qué está dividido así:** `data/formFields.js` describe cada campo
(nombre, tipo, si es obligatorio, catálogo de opciones) y `FormPanel`
simplemente lo renderiza — agregar un campo, o un tercer tipo de constancia,
es agregar una entrada a esa configuración en vez de duplicar JSX. La lógica
de texto en español (números y fechas a palabras) vive aparte en
`utils/spanishText.js`, ya que es la pieza que más directamente traduce las
reglas de negocio y conviene poder probarla sola. El texto legal de cada
tipo de constancia (los párrafos completos, con sus datos variables) vive en
`utils/constanciaText.js` y es la única fuente que usan tanto la vista
previa en pantalla como el PDF real — así nunca pueden quedar desalineados.

## Carga de kárdex (PDF)

Ambos formularios ("Nueva: Reinscripción" y "Nueva: Promedio") tienen una
carga opcional de PDF: el "Análisis de Calificaciones por Alumno" que
exporta SUCEWEB, comúnmente llamado kárdex. Todo pasa en el navegador
(`kardex/extractPdfText.js` con `pdfjs-dist`) — el archivo nunca se sube a
ningún servidor.

`kardex/parseKardex.js` solo completa los campos que el documento declara
sin ambigüedad, localizándolos por su etiqueta exacta:

- **Matrícula, nombre del alumno, programa educativo** (emparejado contra
  `data/programas.js`; si no calza con el catálogo, se deja en blanco con
  una advertencia en vez de asignar un programa al azar).
- **Promedio general** y **fecha de consulta** (constancia de Promedio).
- **Semestre cursado y su promedio**: se infiere como el último periodo
  *regular* (no intersemestral) con calificaciones ya asentadas — es una
  inferencia, no un dato literal del documento, así que queda marcada para
  verificar.
- **Número de reinscripción**: los periodos *regulares* distintos del
  kárdex, contando el que está en curso aunque aún no tenga calificaciones,
  menos uno (el primero es la inscripción). Los intersemestrales no
  cuentan. También es un conteo, así que se debe verificar.

Los periodos de semestre y vacacional salen del calendario escolar (vista
"Calendario Escolar"), no del kárdex.

**A propósito no se auto-completa** la fecha de
expedición: el kárdex no la declara de forma explícita, y adivinarla
sería justo el tipo de error que esta función busca evitar. Todo campo que
sí se completa automáticamente sigue siendo editable, para poder corregir
cualquier dato mal leído antes de generar la constancia.

Si el PDF no tiene texto seleccionable (por ejemplo, es una hoja escaneada)
o no calza con el formato esperado, se avisa en pantalla y el formulario
se sigue llenando a mano.

## Pantallas

- **Inicio**: total de constancias generadas, desglose por tipo, folio más
  reciente, cuántas están anuladas, y las últimas 5 constancias — todo
  calculado a partir del historial que ya existe, sin backend adicional.
- **Historial**: además de ver/descargar cada constancia, tiene:
  - **Anular / reactivar constancia**: marca una constancia con error como
    anulada sin borrarla (rastro de lo que pasó), y se puede revertir. No
    cambia el texto del PDF ya generado — es un estado, no una redacción
    retroactiva del documento.
  - **Contador de descargas**: cuenta cuántas veces se ha vuelto a descargar
    el PDF de una constancia desde el historial.
  - **Exportar / importar respaldo (JSON)**: mientras el historial siga en
    `localStorage`, esto es lo único que protege esos datos de perderse si
    se borra el caché o se cambia de equipo. Importar solo agrega
    constancias cuyo folio no exista ya — no reemplaza ni borra nada.

El sidebar tiene "Catálogo de Programas" marcado como "Pronto": el catálogo
en sí ya es editable por código (`hooks/useProgramas.js`, persistido en
localStorage) y ya lo usan el formulario y la carga de kárdex, pero por
ahora no hace falta un panel para administrarlo desde la interfaz — se
puede agregar cuando sí haga falta, sin tocar el resto del sistema.

## Decisiones y supuestos de este maquetado

Estas quedaron abiertas en las reglas de negocio y aquí se resolvieron con un
valor por default, marcado en la propia interfaz:

- **Un solo rol de usuario** (sin login ni permisos todavía).
- **Folio consecutivo compartido** entre tipos de constancia, año fijo 2026
  (`useHistorial.js`).
- **Catálogo de programas en `localStorage`** (`hooks/useProgramas.js`),
  sin panel de administración todavía (ver "Pantallas" arriba) — por
  navegador/equipo, no compartido.
- **Historial en `localStorage`**, no en base de datos.
- **Calendario escolar por navegador**: las fechas en `localStorage` y el
  PDF oficial en IndexedDB (`hooks/useCalendario.js`), no compartidos entre
  equipos. Las fechas se capturan a mano porque el calendario oficial es una
  imagen sin texto legible.
- **Logos del membrete en baja resolución** (`assets/logo-unacar.png`,
  `assets/logo-fci.png`): se recortaron de una captura de pantalla porque no
  había archivos de imagen aislados disponibles. Se ven bien en el tamaño
  actual del membrete, pero si la Secretaría consigue los archivos oficiales
  (del sitio de UNACAR o del manual de identidad) en mejor resolución, basta
  con reemplazar esos dos archivos — el resto del código no cambia.

## Variables de entorno

Ningún valor real se guarda en el repositorio. Cada carpeta trae un
`.env.example` con los nombres y sin los valores; los reales se capturan en
el panel de cada servicio.

### `frontend/` (se capturan en Vercel)

| Variable | Para qué sirve | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API, sin barra final | `https://constancias-fci-api.onrender.com` |

Todo lo que empieza con `VITE_` queda **incrustado en el bundle y es
público**. Por eso aquí no va ninguna llave de Supabase.

### `api/` (se capturan en Render)

| Variable | Para qué sirve | Dónde sale |
| --- | --- | --- |
| `SUPABASE_URL` | URL del proyecto | Supabase > Project Settings > API > Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave secreta, salta RLS | Supabase > Project Settings > API > service_role |
| `FRONTEND_URL` | Origen permitido por CORS, sin barra final | La URL que da Vercel |
| `PORT` | Puerto de escucha | Render la inyecta sola; en local, 3000 |
| `HEALTH_TABLE` | Tabla que consulta `/health` (opcional) | Por defecto `constancias` |

### GitHub Actions

| Secret | Para qué sirve | Dónde sale |
| --- | --- | --- |
| `SUPABASE_DB_URL` | Respaldo semanal con `pg_dump` | Supabase > Project Settings > Database > Connection string > URI |

## Despliegue

El orden importa: Supabase da las llaves que necesita Render, y Render da la
URL que necesita Vercel.

### 1. Supabase

1. Crear el proyecto en [supabase.com](https://supabase.com).
2. Aplicar el esquema. Revisar primero
   `supabase/migrations/20260923000000_esquema_inicial.sql`, que es una
   propuesta inferida (ver `supabase/README.md`):

   ```bash
   npx supabase link --project-ref <tu-project-ref>
   npx supabase db push
   ```

3. Confirmar en Authentication > Policies que las tablas aparecen con RLS
   habilitado.
4. Copiar de Project Settings > API la *Project URL* y la llave
   *service_role*.

### 2. Render (API)

1. New > Blueprint y apuntar al repositorio. Render lee `render.yaml` y
   detecta el servicio Docker con `rootDir: api`.
2. Capturar a mano las variables, que vienen con `sync: false`:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `FRONTEND_URL`.
   `PORT` no se captura: Render la inyecta.
3. `FRONTEND_URL` todavía no se conoce en este punto. Se puede dejar
   `http://localhost:5173` y corregirla después del paso 3.
4. Esperar a que el health check de `/health` pase en verde y anotar la URL
   del servicio.

### 3. Vercel (frontend)

1. Add New > Project y apuntar al mismo repositorio.
2. **Root Directory: `frontend`** — es el ajuste que más se olvida. Sin él,
   Vercel busca el `package.json` en la raíz y el build falla.
3. Framework Preset: Vite. El build (`npm run build`) y el directorio de
   salida (`dist`) se detectan solos.
4. Capturar `VITE_API_URL` con la URL de Render del paso 2.
5. Desplegar y anotar la URL que asigna Vercel.

### 4. Cerrar el círculo

Volver a Render y poner en `FRONTEND_URL` la URL real de Vercel. Si no, CORS
bloquea las llamadas del navegador. Render redespliega solo al guardar.

### 5. Respaldos

En GitHub, Settings > Secrets and variables > Actions, agregar el secret
`SUPABASE_DB_URL`. El respaldo corre los domingos a las 06:00 UTC y también
se puede lanzar a mano desde la pestaña Actions.

## Qué falta para el sistema completo

Ya resuelto: la generación real del PDF (`@react-pdf/renderer`, mismo texto
que la vista previa) y su descarga desde "Nueva constancia" y desde el
historial. Sigue pendiente, sobre todo pensando en que varias personas y
equipos de la Secretaría lo usen a la vez:

- Backend con base de datos compartida (Regla DB1): hoy el historial y el
  folio consecutivo viven en `localStorage`, es decir, por navegador/equipo,
  no compartido entre usuarios. Sin esto, dos personas generando constancias
  al mismo tiempo pueden repetir folio.
  **La estructura ya está lista** (`api/` con Express y Docker, `supabase/`
  con el esquema propuesto, `render.yaml`): falta escribir los endpoints y
  cambiar los hooks `useHistorial`/`useProgramas` para que llamen a la API
  (con `frontend/src/lib/api.js`) en vez de a `localStorage`. El esquema
  propuesto ya resuelve el folio repetido con una secuencia de Postgres.
- Autenticación (ver "Seguridad" en Arquitectura): hace falta **antes** de
  exponer el sistema a internet con datos reales de alumnos.
- Autenticación y roles, si se confirma que hará falta más de uno.
- Guardar el PDF generado (o poder regenerarlo) en el backend, para
  auditoría, en vez de sólo regenerarlo al vuelo desde los datos guardados.
- Catálogo de programas, anulaciones y calendario escolar compartidos entre
  equipos (hoy cada navegador tiene su propia copia en localStorage /
  IndexedDB); el PDF del calendario iría a Supabase Storage.
- Panel para administrar el catálogo de programas desde la interfaz (hoy
  solo se edita por código o por consola del navegador).

## Nota sobre estilos

La interfaz usa **Tailwind CSS v4** (`@tailwindcss/vite`, sin
`tailwind.config.js` — la configuración vive como tokens `@theme` en
`index.css`). La paleta de colores, tipografía (Inter + Material Symbols
Outlined) y escala de espaciado (`space-xs`, `space-md`, etc.) vienen de las
pantallas de diseño en las carpetas `stitch_ui_screen_design_phase_1*`
(fuera de este proyecto, en la raíz del repo) — cada `DESIGN.md` trae los
tokens exactos. La hoja de la constancia (`.doc-paper`) es la excepción: se
mantiene en tipografía serif porque es la misma que usa el PDF real
(`pdf/ConstanciaPdfDocument.jsx`), para que la vista previa no prometa un
documento distinto del que se descarga.

Esas pantallas de diseño también traían widgets que simulaban funciones que
el sistema no tenía (búsqueda de alumno contra una base de datos falsa,
firma digital SHA-256, sello QR, envío al alumno, bitácora de auditoría) —
se dejaron fuera a propósito para no aparentar una funcionalidad que no
existe. La carga de kárdex sí se construyó, pero como extracción de texto
real (ver sección arriba), no como la "IA" decorativa del diseño original.
También se adoptó como navegación real: el sidebar entra directo a
"Nueva: Reinscripción" o "Nueva: Promedio" (ya no hay una pantalla
intermedia de elegir tipo), y el historial tiene una acción real de
"Duplicar para nueva emisión" que precarga el formulario con los mismos
datos y la fecha de expedición en hoy.
