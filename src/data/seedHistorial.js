/**
 * Datos de ejemplo para que el panel de Historial no arranque vacío.
 * Corresponden a los 2 documentos de ejemplo que dieron origen a las
 * reglas de negocio (CONSTANCIA_NORMAL_No._EJEMPLO y
 * CONSTANCIA_PROMEDIO_AGO2026_EJEMPLO); los campos que en el original
 * venían como "XX" se rellenaron con valores plausibles marcados isExample.
 */
export function seedHistorial() {
  return [
    {
      id: 'seed-1',
      folio: 'FCI-2026-100',
      tipo: 'normal',
      isExample: true,
      fechaGeneracion: '2026-06-12',
      data: {
        alumno: 'Alumno de ejemplo',
        matricula: '000000',
        reinscripcion: 4,
        programa: 'Ingeniería en Diseño Multimedia',
        periodoInicio: '2026-02-09',
        periodoFin: '2026-06-19',
        vacacionesInicio: '2026-06-20',
        vacacionesFin: '2026-08-16',
        fechaExpedicion: '2026-06-12',
      },
    },
    {
      id: 'seed-2',
      folio: 'FCI-2026-183',
      tipo: 'promedio',
      isExample: true,
      fechaGeneracion: '2026-09-07',
      data: {
        alumno: 'Alumna de ejemplo',
        matricula: '020837',
        fechaConsulta: '2026-09-07',
        reinscripcion: 3,
        programa: 'Maestría en Tecnologías de Información Emergentes',
        semestreCursado: 'Febrero 2026',
        promedioSemestre: '9.20',
        promedioGeneral: '9.00',
        periodoInicio: '2026-08-01',
        periodoFin: '2027-01-31',
        fechaExpedicion: '2026-09-07',
      },
    },
  ];
}
