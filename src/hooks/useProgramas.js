import { useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';
import { PROGRAMAS_INICIALES } from '../data/programas';

const STORAGE_KEY = 'constancias-fci-programas-v1';

/**
 * Catálogo de programas educativos (Regla P1), ahora editable desde el
 * panel "Catálogo de Programas" y respaldado en localStorage — antes era
 * una lista fija en data/programas.js. Renombrar un programa no cambia el
 * texto de constancias ya generadas (el historial guarda el nombre tal
 * como estaba al generarse, no una referencia al catálogo).
 */
export function useProgramas() {
  const [programas, setProgramas] = useState(() => loadJSON(STORAGE_KEY) || PROGRAMAS_INICIALES);

  useEffect(() => {
    saveJSON(STORAGE_KEY, programas);
  }, [programas]);

  function agregarPrograma(nombre) {
    const limpio = nombre.trim();
    if (!limpio || programas.includes(limpio)) return false;
    setProgramas((prev) => [...prev, limpio]);
    return true;
  }

  function renombrarPrograma(anterior, nuevo) {
    const limpio = nuevo.trim();
    if (!limpio || (programas.includes(limpio) && limpio !== anterior)) return false;
    setProgramas((prev) => prev.map((p) => (p === anterior ? limpio : p)));
    return true;
  }

  function eliminarPrograma(nombre) {
    setProgramas((prev) => prev.filter((p) => p !== nombre));
  }

  return { programas, agregarPrograma, renombrarPrograma, eliminarPrograma };
}
