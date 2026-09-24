import { useState } from 'react';
import Icon from '../atoms/Icon';
import PasswordInput, { inputClass } from './PasswordInput';

const LONGITUD_MINIMA = 8;

const botonPrimario =
  'flex h-11 items-center justify-center gap-space-xs rounded-lg bg-primary font-bold text-on-primary shadow-md transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40';
const enlace = 'font-bold text-secondary hover:underline disabled:opacity-40';

/**
 * Crear la contraseña por primera vez, o cambiarla si se olvidó. Dos pasos:
 * 1) correo → la API manda un código a ese correo (solo si está autorizado);
 * 2) código + contraseña nueva → la API la guarda y deja la sesión iniciada.
 */
export default function CrearPasswordForm({ emailInicial, onPedirCodigo, onCrearPassword, onVolver }) {
  const [paso, setPaso] = useState('correo');
  const [email, setEmail] = useState(emailInicial);
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [error, setError] = useState(null);

  async function ejecutar(accion) {
    setEnviando(true);
    setError(null);
    try {
      await accion();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function pedirCodigo(e) {
    e?.preventDefault();
    ejecutar(async () => {
      const { mensaje } = await onPedirCodigo(email);
      setAviso(mensaje);
      setPaso('codigo');
    });
  }

  function guardar(e) {
    e.preventDefault();
    if (password.length < LONGITUD_MINIMA) {
      setError(`La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres.`);
      return;
    }
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    // Si sale bien, Root cambia a la aplicación y este formulario desaparece.
    ejecutar(() => onCrearPassword(email, codigo, password));
  }

  const mensajeError = error && (
    <p role="alert" className="flex items-start gap-space-2xs text-error text-label-md">
      <Icon name="error" className="mt-0.5 text-[16px]" />
      {error}
    </p>
  );

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-col gap-space-2xs">
        <h2 className="font-semibold text-on-surface text-body-md">Crear o cambiar mi contraseña</h2>
        <p className="text-on-surface-variant text-label-md">
          {paso === 'correo'
            ? 'Escribe tu correo institucional. Si está registrado en el sistema, te enviaremos un código para crear tu contraseña.'
            : `Escribe el código que enviamos a ${email} y elige tu contraseña.`}
        </p>
      </div>

      {paso === 'correo' ? (
        <form className="flex flex-col gap-space-md" onSubmit={pedirCodigo}>
          <label className="flex flex-col gap-space-2xs">
            <span className="font-bold text-label-md">Correo institucional</span>
            <input
              type="email"
              autoComplete="username"
              required
              autoFocus
              className={inputClass}
              placeholder="nombre@delfin.unacar.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {mensajeError}

          <button type="submit" disabled={enviando} className={botonPrimario}>
            <Icon name="mail" className="text-[18px]" />
            {enviando ? 'Enviando…' : 'Enviarme un código'}
          </button>
        </form>
      ) : (
        <form className="flex flex-col gap-space-md" onSubmit={guardar}>
          {aviso && (
            <p className="flex items-start gap-space-2xs rounded-lg bg-surface-container p-space-sm text-on-surface-variant text-label-sm">
              <Icon name="info" className="mt-0.5 text-[16px] text-secondary" />
              {aviso}
            </p>
          )}

          {/* Campo oculto para que el gestor de contraseñas asocie la nueva con este correo. */}
          <input type="email" autoComplete="username" value={email} readOnly hidden />

          <label className="flex flex-col gap-space-2xs">
            <span className="font-bold text-label-md">Código</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              maxLength={10}
              className={`${inputClass} tracking-[0.3em]`}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            />
          </label>

          <label className="flex flex-col gap-space-2xs">
            <span className="font-bold text-label-md">Contraseña nueva</span>
            <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
            <span className="text-outline text-label-sm">Al menos {LONGITUD_MINIMA} caracteres.</span>
          </label>

          <label className="flex flex-col gap-space-2xs">
            <span className="font-bold text-label-md">Confirmar contraseña</span>
            <PasswordInput value={confirmacion} onChange={setConfirmacion} autoComplete="new-password" />
          </label>

          {mensajeError}

          <button type="submit" disabled={enviando} className={botonPrimario}>
            <Icon name="lock_reset" className="text-[18px]" />
            {enviando ? 'Guardando…' : 'Guardar contraseña y entrar'}
          </button>

          <div className="flex justify-between text-label-sm">
            <button type="button" onClick={() => pedirCodigo()} disabled={enviando} className={enlace}>
              Reenviar código
            </button>
            <button
              type="button"
              onClick={() => {
                setPaso('correo');
                setError(null);
              }}
              disabled={enviando}
              className={enlace}
            >
              Usar otro correo
            </button>
          </div>
        </form>
      )}

      <button type="button" onClick={onVolver} className={`${enlace} self-center text-label-sm`}>
        Volver a iniciar sesión
      </button>
    </div>
  );
}
