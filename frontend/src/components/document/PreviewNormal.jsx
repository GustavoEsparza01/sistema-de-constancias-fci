import DocumentShell from './DocumentShell';
import Runs from './Runs';
import { getConstanciaContent } from '../../utils/constanciaText';
import { TIPO_CONSTANCIA } from '../../constants/tipos';

/** Vista previa de la Constancia Normal (reinscripción) — texto en utils/constanciaText.js. */
export default function PreviewNormal({ data, folio }) {
  const { addressLines, paragraphs } = getConstanciaContent(TIPO_CONSTANCIA.NORMAL, data);

  return (
    <DocumentShell folio={folio} titulo="Constancia de reinscripción">
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
