import { TIPO_CONSTANCIA } from '../constants/tipos';
import { ordinalWord, formatDateRange, formatDateNumeric, dateWordParts } from './spanishText';

/**
 * Fuente única del texto legal de cada tipo de constancia: tanto la vista
 * previa en HTML (PreviewNormal/PreviewPromedio) como el PDF real
 * (src/pdf/ConstanciaPdfDocument.jsx) arman sus párrafos a partir de este
 * módulo, para que el documento descargado nunca pueda quedar desalineado
 * de lo que la Secretaría ya revisó en pantalla.
 *
 * Cada párrafo es una lista de "runs": texto fijo (`{ text }`) o dato
 * variable (`{ value, placeholder }`), en el mismo orden en que deben
 * concatenarse.
 */

function v(value, placeholder) {
  return { value, placeholder };
}

function getNormalContent(data) {
  const periodo = formatDateRange(data.periodoInicio, data.periodoFin);
  const vacaciones = formatDateRange(data.vacacionesInicio, data.vacacionesFin);
  const expedicion = dateWordParts(data.fechaExpedicion);

  return {
    addressLines: ['A QUIEN CORRESPONDA', 'P R E S E N T E.'],
    paragraphs: [
      [
        {
          text: 'La Facultad de Ciencias de la Información de la Universidad Autónoma del Carmen, con número de registro 04USU0018T ante la Secretaria de Educación Pública, hace constar que:',
        },
      ],
      [{ text: 'El alumno (a): ' }, v(data.alumno, '‹nombre del alumno›')],
      [
        { text: 'Con matrícula No.' },
        v(data.matricula, '‹matrícula›'),
        { text: ', ha realizado su ' },
        v(data.reinscripcion ? ordinalWord(Number(data.reinscripcion)) : '', '‹reinscripción›'),
        {
          text: ' reinscripción semestral como alumno ordinario regular del Programa Educativo de Licenciatura en ',
        },
        v(data.programa, '‹programa educativo›'),
        { text: '. Cabe mencionar que dicha reinscripción comprende el periodo del ' },
        v(periodo, '‹periodo del semestre›'),
        { text: ', que considera el periodo vacacional ' },
        v(vacaciones, '‹periodo vacacional›'),
        { text: '.' },
      ],
      [
        {
          text: 'A petición de la parte interesada y para los efectos legales correspondientes, se expide la presente constancia en la Ciudad y Puerto del Carmen, Estado de Campeche, a los ',
        },
        v(expedicion?.dia, '‹día›'),
        { text: ' días del mes de ' },
        v(expedicion?.mes, '‹mes›'),
        { text: ' del dos mil ' },
        v(expedicion?.anioSuf, '‹año›'),
        { text: '.' },
      ],
    ],
  };
}

function getPromedioContent(data) {
  const periodo = formatDateRange(data.periodoInicio, data.periodoFin);
  const consulta = formatDateNumeric(data.fechaConsulta);
  const expedicion = dateWordParts(data.fechaExpedicion);

  return {
    addressLines: ['A QUIEN CORRESPONDA', 'P R E S E N T E'],
    paragraphs: [
      [
        {
          text: 'La Facultad de Ciencias de la Información de la Universidad Autónoma del Carmen, con número de registro 04USU0018T ante la Secretaria de Educación Pública, hace constar que:',
        },
      ],
      [{ text: 'El alumno (a): ' }, v(data.alumno, '‹nombre del alumno›')],
      [
        { text: 'Con matrícula No.' },
        v(data.matricula, '‹matrícula›'),
        {
          text: ', de acuerdo con la consulta realizada de su historial académico en el sistema SUCEWEB con fecha ',
        },
        v(consulta, '‹fecha de consulta›'),
        { text: ', el estudiante realizó su ' },
        v(data.reinscripcion ? ordinalWord(Number(data.reinscripcion)) : '', '‹reinscripción›'),
        { text: ' reinscripción semestral como alumno ordinario regular del Programa Educativo de ' },
        v(data.programa, '‹programa educativo›'),
        { text: ', obteniendo en el semestre ' },
        v(data.semestreCursado, '‹semestre›'),
        { text: ' un promedio de ' },
        v(data.promedioSemestre, '‹XX›'),
        { text: ' y actualmente cuenta con un promedio general de ' },
        v(data.promedioGeneral, '‹XX›'),
        { text: '.' },
      ],
      [
        { text: 'Cabe mencionar que su reinscripción comprende el periodo del ' },
        v(periodo, '‹periodo de reinscripción›'),
        { text: '.' },
      ],
      [
        {
          text: 'A petición de la parte interesada y para los efectos legales correspondientes, se expide la presente constancia en la Ciudad y Puerto del Carmen, Estado de Campeche, a los ',
        },
        v(expedicion?.dia, '‹día›'),
        { text: ' días del mes de ' },
        v(expedicion?.mes, '‹mes›'),
        { text: ' del dos mil ' },
        v(expedicion?.anioSuf, '‹año›'),
        { text: '.' },
      ],
    ],
  };
}

/** Arma el contenido (encabezado de dirección + párrafos) del tipo de constancia dado. */
export function getConstanciaContent(tipo, data) {
  if (tipo === TIPO_CONSTANCIA.PROMEDIO) return getPromedioContent(data);
  return getNormalContent(data);
}
