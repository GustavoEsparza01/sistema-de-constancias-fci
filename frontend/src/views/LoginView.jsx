import { useState } from 'react';
import Icon from '../components/atoms/Icon';
import logoUnacar from '../assets/logo-unacar.png';
import logoFci from '../assets/logo-fci.png';

const inputClass =
  'h-11 w-full rounded-lg bg-surface-container-low px-space-sm text-on-surface text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary';

/**
 * Pantalla de inicio de sesión. Las cuentas las da de alta un
 * administrador (ver api/src/auth.js); por eso no hay "crear cuenta" ni
 * "olvidé mi contraseña": ambas cosas se piden a quien administra el sistema.
 */
export default function LoginView({ onLogin, error: errorInicial, configurada, activada }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(errorInicial);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-space-md py-space-lg font-sans text-on-surface antialiased">
      <div className="flex w-full max-w-[420px] flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
        <div className="flex flex-col items-center gap-space-sm text-center">
          <div className="flex items-center gap-space-md">
            <img src={logoUnacar} alt="UNACAR" className="h-14 w-auto" />
            <img src={logoFci} alt="Facultad de Ciencias de la Información" className="h-14 w-auto" />
          </div>
          <div className="flex flex-col gap-space-2xs">
            <h1 className="font-semibold text-primary text-title-md">Sistema de Constancias</h1>
            <p className="text-on-surface-variant text-label-md">
              Secretaría Académica · Facultad de Ciencias de la Información
            </p>
          </div>
        </div>

        {!activada && (
          <p className="flex items-start gap-space-2xs rounded-lg bg-surface-container p-space-sm text-on-surface-variant text-label-sm">
            <Icon name="info" className="mt-0.5 text-[16px] text-secondary" />
            Autenticación en preparación: por ahora se entra con cualquier correo y contraseña.
          </p>
        )}

        {!configurada && (
          <p className="flex items-start gap-space-2xs rounded-lg bg-warning-container p-space-sm text-on-warning-container text-label-sm">
            <Icon name="warning" className="mt-0.5 text-[16px]" />
            El sistema no tiene configurado el servidor (VITE_API_URL), así que no se puede iniciar sesión.
            Avisa a quien lo administra.
          </p>
        )}

        <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
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

          <label className="flex flex-col gap-space-2xs">
            <span className="font-bold text-label-md">Contraseña</span>
            <div className="relative">
              <input
                type={verPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className={`${inputClass} pr-11`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-outline hover:text-secondary"
              >
                <Icon name={verPassword ? 'visibility_off' : 'visibility'} className="text-[20px]" />
              </button>
            </div>
          </label>

          {error && (
            <p role="alert" className="flex items-start gap-space-2xs text-error text-label-md">
              <Icon name="error" className="mt-0.5 text-[16px]" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando || !configurada}
            className="flex h-11 items-center justify-center gap-space-xs rounded-lg bg-primary font-bold text-on-primary shadow-md transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="login" className="text-[18px]" />
            {enviando ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-outline text-label-sm">
          ¿No tienes cuenta u olvidaste tu contraseña? Pídela a quien administra el sistema.
        </p>
      </div>
    </div>
  );
}
