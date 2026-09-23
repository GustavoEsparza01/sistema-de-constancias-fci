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

## Poner a correr el proyecto

Requiere Node 18+.

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (normalmente `http://localhost:5173`).

Otros comandos:

```bash
npm run build         # build de producción a dist/
npm run preview       # sirve el build de producción localmente
npm run lint          # oxlint
npm run format        # prettier --write
npm run format:check  # prettier --check
```

## Estructura del proyecto

```
src/
├── App.jsx                 # orquesta vista (Nueva/Historial), toast, historial
├── main.jsx                # punto de entrada de React
├── index.css                # design tokens + estilos (una hoja global, ver nota abajo)
├── constants/
│   └── tipos.js             # TIPO_CONSTANCIA, VISTA, TIPO_POR_VISTA, TIPO_LABEL
├── data/
│   ├── formFields.js         # config de campos por tipo (fuente de verdad del formulario)
│   ├── programas.js          # semilla inicial del catálogo de programas (Regla P1)
│   └── seedHistorial.js      # datos de ejemplo para no arrancar con historial vacío
├── utils/
│   ├── spanishText.js        # números/fechas → texto en español (Reglas D1, D2, D3)
│   ├── constanciaText.js     # texto legal de cada tipo, fuente única para preview y PDF
│   ├── storage.js            # localStorage genérico (loadJSON/saveJSON), con try/catch
│   ├── historialBackup.js    # exportar/importar el historial como archivo JSON
│   └── validation.js         # isComplete(tipo, data)
├── hooks/
│   ├── useHistorial.js       # historial + folio siguiente + anular/reactivar/descargas + import
│   ├── useProgramas.js       # catálogo de programas, persistido en localStorage (sin panel de edición aún)
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
│   ├── form/                 # Field, inputs.jsx, FormPanel.jsx (dirigido por data/formFields.js)
│   ├── document/             # DocumentShell (membrete con logos) + Runs + PreviewNormal + PreviewPromedio + PreviewDocument
│   ├── history/               # HistorialTable.jsx, DocumentModal.jsx (con descarga real de PDF)
│   ├── kardex/KardexUpload.jsx  # carga de kárdex PDF, precarga el formulario
│   ├── layout/                # Sidebar.jsx, TopBar.jsx
│   └── Toast.jsx
└── views/
    ├── InicioView.jsx             # panel de métricas (total, por tipo, últimas constancias)
    ├── NuevaConstanciaView.jsx
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
- **Logos del membrete en baja resolución** (`assets/logo-unacar.png`,
  `assets/logo-fci.png`): se recortaron de una captura de pantalla porque no
  había archivos de imagen aislados disponibles. Se ven bien en el tamaño
  actual del membrete, pero si la Secretaría consigue los archivos oficiales
  (del sitio de UNACAR o del manual de identidad) en mejor resolución, basta
  con reemplazar esos dos archivos — el resto del código no cambia.

## Qué falta para el sistema completo

Ya resuelto: la generación real del PDF (`@react-pdf/renderer`, mismo texto
que la vista previa) y su descarga desde "Nueva constancia" y desde el
historial. Sigue pendiente, sobre todo pensando en que varias personas y
equipos de la Secretaría lo usen a la vez:

- Backend con base de datos compartida (Regla DB1): hoy el historial y el
  folio consecutivo viven en `localStorage`, es decir, por navegador/equipo,
  no compartido entre usuarios. Sin esto, dos personas generando constancias
  al mismo tiempo pueden repetir folio.
- Autenticación y roles, si se confirma que hará falta más de uno.
- Guardar el PDF generado (o poder regenerarlo) en el backend, para
  auditoría, en vez de sólo regenerarlo al vuelo desde los datos guardados.
- Catálogo de programas y anulaciones compartidos entre equipos (hoy cada
  navegador tiene su propia copia en localStorage).
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
