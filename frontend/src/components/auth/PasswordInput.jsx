import { useState } from 'react';
import Icon from '../atoms/Icon';

export const inputClass =
  'h-11 w-full rounded-lg bg-surface-container-low px-space-sm text-on-surface text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary';

/** Campo de contraseña con botón para mostrarla u ocultarla. */
export default function PasswordInput({ value, onChange, autoComplete = 'current-password', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        required
        className={`${inputClass} pr-11`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-outline hover:text-secondary"
      >
        <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-[20px]" />
      </button>
    </div>
  );
}
