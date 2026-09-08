/**
 * Marca un dato variable dentro de la vista previa del documento — el
 * equivalente al resaltado amarillo de los formatos de Word originales.
 * Vacío: caja ámbar con el nombre del campo. Lleno: texto normal con un
 * subrayado punteado sutil, para que siga siendo identificable como dato
 * capturado (no texto fijo de la plantilla).
 */
export default function VarField({ value, placeholder }) {
  const filled = value !== undefined && value !== null && String(value).trim() !== '';
  return (
    <span className={`var-field ${filled ? 'filled' : 'empty'}`}>{filled ? String(value) : placeholder}</span>
  );
}
