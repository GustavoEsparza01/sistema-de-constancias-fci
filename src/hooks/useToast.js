import { useEffect, useState } from 'react';

const AUTO_HIDE_MS = 3200;

/** Mensaje transitorio en la esquina inferior; se oculta solo tras un momento. */
export function useToast() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(null), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return { message, showToast: setMessage };
}
