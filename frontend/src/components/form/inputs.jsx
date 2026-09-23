/** Controles de formulario mínimos, sin librería externa — el proyecto es lo bastante chico para no necesitarla todavía. */

const inputClass =
  'h-[38px] w-full rounded bg-surface-container-lowest px-space-sm text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary';

export function TextInput({ value, placeholder, onChange }) {
  return (
    <input
      type="text"
      className={inputClass}
      value={value ?? ''}
      placeholder={placeholder ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function NumberInput({ value, min, max, step = 1, onChange }) {
  return (
    <input
      type="number"
      className={`${inputClass} font-mono`}
      value={value ?? ''}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function DateInput({ value, onChange }) {
  return (
    <input
      type="date"
      className={`${inputClass} font-mono`}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SelectInput({ value, options, onChange }) {
  return (
    <select className={inputClass} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecciona...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function DateRangeInput({ startValue, endValue, onChangeStart, onChangeEnd }) {
  return (
    <div className="grid grid-cols-2 gap-space-sm">
      <DateInput value={startValue} onChange={onChangeStart} />
      <DateInput value={endValue} onChange={onChangeEnd} />
    </div>
  );
}
