import { TIPO_CONSTANCIA } from '../../constants/tipos';
import PreviewNormal from './PreviewNormal';
import PreviewPromedio from './PreviewPromedio';

/** Elige la plantilla de texto según el tipo de constancia. */
export default function PreviewDocument({ tipo, data, folio }) {
  if (tipo === TIPO_CONSTANCIA.PROMEDIO) return <PreviewPromedio data={data} folio={folio} />;
  return <PreviewNormal data={data} folio={folio} />;
}
