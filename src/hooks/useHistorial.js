import { useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';
import { seedHistorial } from '../data/seedHistorial';

const STORAGE_KEY = 'constancias-fci-historial-v1';

/** Entradas antiguas (antes de anulación/reimpresión) no traen estos campos. */
function withDefaults(entry) {
  return { estado: 'vigente', descargas: 1, ...entry };
}

/**
 * Estado del historial de constancias generadas, respaldado en
 * localStorage (ver utils/storage.js). Expone el folio siguiente y
 * funciones para registrar, anular/reactivar, contar descargas, e
 * importar/reemplazar el historial completo (respaldo), para que los
 * componentes de UI no toquen el almacenamiento directamente.
 */
export function useHistorial() {
  const [historial, setHistorial] = useState(() => {
    const stored = loadJSON(STORAGE_KEY);
    return (stored || seedHistorial()).map(withDefaults);
  });

  useEffect(() => {
    saveJSON(STORAGE_KEY, historial);
  }, [historial]);

  // Folio simulado (Regla F1): consecutivo compartido entre tipos, año fijo
  // en 2026 para este maquetado. El backend real decide el esquema final.
  const nextFolio = `FCI-2026-${100 + historial.length + 1}`;

  function registrarConstancia({ tipo, data }) {
    const entry = {
      id: `c-${Date.now()}`,
      folio: nextFolio,
      tipo,
      isExample: false,
      estado: 'vigente',
      descargas: 1,
      fechaGeneracion: new Date().toISOString().slice(0, 10),
      data,
    };
    setHistorial((prev) => [entry, ...prev]);
    return entry;
  }

  function anularConstancia(id) {
    setHistorial((prev) => prev.map((e) => (e.id === id ? { ...e, estado: 'anulada' } : e)));
  }

  function reactivarConstancia(id) {
    setHistorial((prev) => prev.map((e) => (e.id === id ? { ...e, estado: 'vigente' } : e)));
  }

  function registrarDescarga(id) {
    setHistorial((prev) => prev.map((e) => (e.id === id ? { ...e, descargas: (e.descargas || 0) + 1 } : e)));
  }

  /**
   * Importa un respaldo (ver utils/historialBackup.js): agrega las
   * entradas cuyo folio no exista ya, sin tocar las existentes.
   */
  function importarHistorial(entradas) {
    let agregadas = 0;
    setHistorial((prev) => {
      const foliosExistentes = new Set(prev.map((e) => e.folio));
      const nuevas = entradas.map(withDefaults).filter((e) => !foliosExistentes.has(e.folio));
      agregadas = nuevas.length;
      return [...nuevas, ...prev];
    });
    return agregadas;
  }

  // Orden por fecha de generación (más reciente primero) — así un respaldo
  // importado con constancias más viejas no desordena "más recientes" en
  // el historial ni en el panel de Inicio.
  const historialOrdenado = [...historial].sort(
    (a, b) => (b.fechaGeneracion || '').localeCompare(a.fechaGeneracion || '') || b.id.localeCompare(a.id),
  );

  return {
    historial: historialOrdenado,
    nextFolio,
    registrarConstancia,
    anularConstancia,
    reactivarConstancia,
    registrarDescarga,
    importarHistorial,
  };
}
