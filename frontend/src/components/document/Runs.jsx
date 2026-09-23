import VarField from '../atoms/VarField';

/** Renderiza una lista de "runs" (texto fijo / dato variable) de utils/constanciaText.js. */
export default function Runs({ runs }) {
  return runs.map((run, i) =>
    'value' in run ? (
      <VarField key={i} value={run.value} placeholder={run.placeholder} />
    ) : (
      <span key={i}>{run.text}</span>
    ),
  );
}
