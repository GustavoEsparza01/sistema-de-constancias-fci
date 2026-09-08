/** Tipos de constancia soportados y las vistas del panel principal. */
export const TIPO_CONSTANCIA = {
  NORMAL: 'normal',
  PROMEDIO: 'promedio',
};

export const VISTA = {
  INICIO: 'inicio',
  HISTORIAL: 'historial',
  NUEVA_NORMAL: 'nueva-normal',
  NUEVA_PROMEDIO: 'nueva-promedio',
};

/** Tipo de constancia correspondiente a cada vista "Nueva", si aplica. */
export const TIPO_POR_VISTA = {
  [VISTA.NUEVA_NORMAL]: TIPO_CONSTANCIA.NORMAL,
  [VISTA.NUEVA_PROMEDIO]: TIPO_CONSTANCIA.PROMEDIO,
};

export const TIPO_LABEL = {
  [TIPO_CONSTANCIA.NORMAL]: 'Normal',
  [TIPO_CONSTANCIA.PROMEDIO]: 'Promedio',
};
