import { requiredKeys } from '../data/formFields';

/** True si todos los campos obligatorios de ese tipo de constancia tienen valor. */
export function isComplete(tipo, data) {
  return requiredKeys(tipo).every((key) => {
    const value = data[key];
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
}
