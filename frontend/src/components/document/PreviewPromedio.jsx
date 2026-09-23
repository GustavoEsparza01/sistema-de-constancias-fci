import DocumentShell from './DocumentShell';
import Runs from './Runs';
import { getConstanciaContent } from '../../utils/constanciaText';
import { TIPO_CONSTANCIA } from '../../constants/tipos';

/** Vista previa de la Constancia de Promedio — texto en utils/constanciaText.js. */
export default function PreviewPromedio({ data, folio }) {
  const { addressLines, paragraphs } = getConstanciaContent(TIPO_CONSTANCIA.PROMEDIO, data);

  return (
    <DocumentShell folio={folio} titulo="Constancia de promedio">
      <p className="mb-4 text-left font-semibold tracking-wide">
        {addressLines[0]}
        <br />
        {addressLines[1]}
      </p>
      {paragraphs.map((runs, i) => (
        <p key={i} className="text-justify leading-[1.85]">
          <Runs runs={runs} />
        </p>
      ))}
    </DocumentShell>
  );
}
