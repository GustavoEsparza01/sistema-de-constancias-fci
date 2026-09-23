import App from './App';
import LoginView from './views/LoginView';
import Icon from './components/atoms/Icon';
import { useAuth, AUTH } from './hooks/useAuth';

/** Muestra la pantalla de login hasta que haya sesión; después, la aplicación. */
export default function Root() {
  const { status, user, error, configurada, activada, login, logout } = useAuth();

  if (status === AUTH.CHECKING) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-space-xs bg-background font-sans text-on-surface-variant">
        <Icon name="progress_activity" className="animate-spin text-[20px]" />
        Verificando sesión…
      </div>
    );
  }

  if (status === AUTH.ANON) {
    return <LoginView onLogin={login} error={error} configurada={configurada} activada={activada} />;
  }

  return <App user={user} onLogout={logout} />;
}
