/**
 * Fechas del Calendario Escolar 2026-2027 (Tipo Educativo Superior,
 * UNACAR), capturadas a mano del PDF oficial: el calendario es una imagen
 * donde los periodos se marcan con colores, así que no se pueden leer
 * automáticamente. Cuando salga un calendario nuevo se actualizan desde
 * la vista "Calendario Escolar" (ver hooks/useCalendario.js).
 *
 * - periodo: "Inicio y fin de curso semestral de Licenciatura" (flechas azules).
 * - vacaciones: las "Vacaciones de invierno y verano" (celdas cian) que
 *   siguen al fin del semestre.
 */
export const CALENDARIO_INICIAL = {
  ciclo: '2026-2027',
  semestres: [
    {
      id: 'A',
      nombre: 'Semestre A (agosto–diciembre 2026)',
      periodoInicio: '2026-08-17',
      periodoFin: '2026-12-09',
      vacacionesInicio: '2026-12-17',
      vacacionesFin: '2027-01-05',
    },
    {
      id: 'B',
      nombre: 'Semestre B (febrero–junio 2027)',
      periodoInicio: '2027-02-11',
      periodoFin: '2027-06-18',
      vacacionesInicio: '2027-07-15',
      vacacionesFin: '2027-07-30',
    },
  ],
};

/** Los campos de fecha de cada semestre, en el orden en que se capturan. */
export const CAMPOS_SEMESTRE = ['periodoInicio', 'periodoFin', 'vacacionesInicio', 'vacacionesFin'];
