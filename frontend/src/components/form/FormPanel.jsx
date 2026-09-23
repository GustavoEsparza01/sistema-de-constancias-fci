import { FORM_FIELDS } from '../../data/formFields';
import { TIPO_CONSTANCIA } from '../../constants/tipos';
import { isComplete } from '../../utils/validation';
import Field from './Field';
import Icon from '../atoms/Icon';
import KardexUpload from '../kardex/KardexUpload';
import { TextInput, NumberInput, SelectInput, DateInput, DateRangeInput } from './inputs';

const TITLES = {
  [TIPO_CONSTANCIA.NORMAL]: 'Constancia de Reinscripción (Normal)',
  [TIPO_CONSTANCIA.PROMEDIO]: 'Constancia de Promedio',
};

function renderControl(field, data, setValue, programas) {
  switch (field.type) {
    case 'text':
      return (
        <TextInput value={data[field.name]} placeholder={field.placeholder} onChange={setValue(field.name)} />
      );
    case 'number':
      return (
        <NumberInput
          value={data[field.name]}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={setValue(field.name)}
        />
      );
    case 'select': {
      const options = field.optionsSource === 'programas' ? programas : field.options;
      return <SelectInput value={data[field.name]} options={options} onChange={setValue(field.name)} />;
    }
    case 'date':
      return <DateInput value={data[field.name]} onChange={setValue(field.name)} />;
    case 'date-range':
      return (
        <DateRangeInput
          startValue={data[field.startKey]}
          endValue={data[field.endKey]}
          onChangeStart={setValue(field.startKey)}
          onChangeEnd={setValue(field.endKey)}
        />
      );
    default:
      return null;
  }
}

/** Agrupa la lista plana de FORM_FIELDS en bloques por su marcador `{ group }`. */
function groupFields(fields) {
  const groups = [];
  let current = null;
  for (const field of fields) {
    if (field.group) {
      current = { title: field.group, fields: [] };
      groups.push(current);
    } else if (current) {
      current.fields.push(field);
    }
  }
  return groups;
}

/**
 * Formulario de captura, dirigido por la configuración en data/formFields.js.
 * Agregar o modificar un campo es cuestión de editar esa configuración,
 * no este componente.
 */
export default function FormPanel({ tipo, data, onChange, nextFolio, onGenerate, programas }) {
  const fields = FORM_FIELDS[tipo] || [];
  const groups = groupFields(fields);
  const setValue = (key) => (value) => onChange({ ...data, [key]: value });
  const complete = isComplete(tipo, data);

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex items-center justify-between gap-space-md">
        <h2 className="font-semibold text-primary text-title-md">{TITLES[tipo]}</h2>
        <div className="flex flex-col items-end">
          <span className="uppercase font-semibold text-outline text-label-sm">Folio al generar</span>
          <span className="rounded bg-surface-container px-space-sm py-space-2xs font-mono font-bold text-primary text-tabular-code">
            {nextFolio}
          </span>
        </div>
      </div>

      <form
        className="flex flex-col gap-space-md"
        onSubmit={(e) => {
          e.preventDefault();
          if (complete) onGenerate();
        }}
      >
        <KardexUpload
          programas={programas}
          onExtracted={(extracted) => onChange({ ...data, ...extracted })}
        />

        {groups.map((group) => (
          <div
            key={group.title}
            className="flex flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-sm"
          >
            <span className="flex items-center gap-space-2xs font-bold text-on-surface text-label-md">
              <Icon name="tune" className="text-[16px] text-secondary" />
              {group.title}
            </span>
            {group.fields.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                hint={field.hint ? field.hint(data[field.name]) : null}
              >
                {renderControl(field, data, setValue, programas)}
              </Field>
            ))}
          </div>
        ))}

        <button
          type="submit"
          disabled={!complete}
          className="mt-space-xs flex h-11 items-center justify-center gap-space-xs rounded-lg bg-primary font-bold text-on-primary shadow-md transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="download_done" className="text-[18px]" />
          Generar y descargar PDF
        </button>
        <p className="text-center text-outline text-label-sm">
          {complete
            ? 'Todos los campos requeridos están completos.'
            : 'Completa los campos para habilitar la generación.'}
        </p>
      </form>
    </div>
  );
}
