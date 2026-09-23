import { TIPO_CONSTANCIA } from '../constants/tipos';
import { ordinalWord } from '../utils/spanishText';

/**
 * Configuración de campos por tipo de constancia (Sección 2 de las
 * reglas de negocio). FormPanel renderiza esta lista en vez de tener
 * el JSX de cada campo duplicado por tipo — agregar un campo nuevo, o
 * un tipo de constancia nuevo, es agregar una entrada aquí.
 *
 * `required` alimenta la validación de la Regla "todos los campos
 * variables son obligatorios antes de generar" (ver utils/validation.js).
 */
export const FORM_FIELDS = {
  [TIPO_CONSTANCIA.NORMAL]: [
    { group: 'Datos del alumno' },
    {
      name: 'alumno',
      label: 'Nombre completo del alumno',
      type: 'text',
      placeholder: 'Ej. Juan Pérez López',
      required: true,
    },
    { name: 'matricula', label: 'Matrícula', type: 'text', placeholder: 'Ej. 000000', required: true },
    {
      name: 'programa',
      label: 'Programa educativo',
      type: 'select',
      optionsSource: 'programas',
      required: true,
    },
    {
      name: 'reinscripcion',
      label: 'Número de reinscripción',
      type: 'number',
      min: 1,
      max: 20,
      required: true,
      hint: (value) =>
        value ? `Se escribirá como "${ordinalWord(Number(value))}"` : 'Se convierte a texto automáticamente',
    },
    { group: 'Periodo', calendario: true },
    {
      name: 'periodo',
      label: 'Periodo del semestre',
      type: 'date-range',
      startKey: 'periodoInicio',
      endKey: 'periodoFin',
      required: true,
    },
    {
      name: 'vacaciones',
      label: 'Periodo vacacional',
      type: 'date-range',
      startKey: 'vacacionesInicio',
      endKey: 'vacacionesFin',
      required: true,
    },
    { group: 'Expedición' },
    {
      name: 'fechaExpedicion',
      label: 'Fecha de expedición',
      type: 'date',
      required: true,
      hint: () => 'Por default hoy — editable',
    },
  ],

  [TIPO_CONSTANCIA.PROMEDIO]: [
    { group: 'Datos del alumno' },
    {
      name: 'alumno',
      label: 'Nombre completo del alumno',
      type: 'text',
      placeholder: 'Ej. María García Ruiz',
      required: true,
    },
    { name: 'matricula', label: 'Matrícula', type: 'text', placeholder: 'Ej. 020837', required: true },
    {
      name: 'programa',
      label: 'Programa educativo',
      type: 'select',
      optionsSource: 'programas',
      required: true,
    },
    {
      name: 'reinscripcion',
      label: 'Número de reinscripción',
      type: 'number',
      min: 1,
      max: 20,
      required: true,
      hint: (value) =>
        value ? `Se escribirá como "${ordinalWord(Number(value))}"` : 'Se convierte a texto automáticamente',
    },
    {
      name: 'fechaConsulta',
      label: 'Fecha de consulta en SUCEWEB',
      type: 'date',
      required: true,
      hint: () => 'Por default hoy',
    },
    { group: 'Promedios' },
    {
      name: 'semestreCursado',
      label: 'Semestre cursado',
      type: 'text',
      placeholder: 'Ej. Febrero 2026',
      required: true,
    },
    {
      name: 'promedioSemestre',
      label: 'Promedio del semestre',
      type: 'number',
      min: 0,
      max: 100,
      step: '0.01',
      required: true,
    },
    {
      name: 'promedioGeneral',
      label: 'Promedio general',
      type: 'number',
      min: 0,
      max: 100,
      step: '0.01',
      required: true,
    },
    { group: 'Periodo y expedición', calendario: true },
    {
      name: 'periodo',
      label: 'Periodo de reinscripción',
      type: 'date-range',
      startKey: 'periodoInicio',
      endKey: 'periodoFin',
      required: true,
    },
    {
      name: 'fechaExpedicion',
      label: 'Fecha de expedición',
      type: 'date',
      required: true,
      hint: () => 'Por default hoy — editable',
    },
  ],
};

/** Junta los nombres de los campos obligatorios de un tipo, expandiendo los rangos de fecha. */
export function requiredKeys(tipo) {
  const fields = FORM_FIELDS[tipo] || [];
  return fields
    .filter((f) => f.name && f.required)
    .flatMap((f) => (f.type === 'date-range' ? [f.startKey, f.endKey] : [f.name]));
}
