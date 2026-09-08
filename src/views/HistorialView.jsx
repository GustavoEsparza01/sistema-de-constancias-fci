import { useState } from 'react';
import HistorialTable from '../components/history/HistorialTable';
import DocumentModal from '../components/history/DocumentModal';
import Icon from '../components/atoms/Icon';
import { downloadHistorialBackup, readHistorialBackupFile } from '../utils/historialBackup';

export default function HistorialView({
  historial,
  query,
  onQueryChange,
  onDuplicate,
  onAnular,
  onReactivar,
  onRegistrarDescarga,
  onImportar,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = historial.find((e) => e.id === selectedId) ?? null;

  function handleDuplicate(item) {
    setSelectedId(null);
    onDuplicate(item);
  }

  async function handleImportFile(file) {
    if (!file) return;
    try {
      const entradas = await readHistorialBackupFile(file);
      onImportar(entradas);
    } catch (error) {
      console.error('No se pudo importar el respaldo:', error);
      onImportar([]);
    }
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex justify-end gap-space-sm">
        <button
          type="button"
          onClick={() => downloadHistorialBackup(historial)}
          className="flex items-center gap-space-2xs rounded border border-outline-variant px-space-sm py-space-xs text-on-surface-variant text-label-md hover:bg-surface-container-low"
        >
          <Icon name="download" className="text-[16px]" />
          Exportar respaldo
        </button>
        <label className="relative flex cursor-pointer items-center gap-space-2xs rounded border border-outline-variant px-space-sm py-space-xs text-on-surface-variant text-label-md hover:bg-surface-container-low">
          <input
            type="file"
            accept="application/json"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              handleImportFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Icon name="upload" className="text-[16px]" />
          Importar respaldo
        </label>
      </div>

      <HistorialTable
        historial={historial}
        query={query}
        onQueryChange={onQueryChange}
        onView={setSelectedId}
      />

      <DocumentModal
        item={selected}
        onClose={() => setSelectedId(null)}
        onDuplicate={handleDuplicate}
        onAnular={onAnular}
        onReactivar={onReactivar}
        onRegistrarDescarga={onRegistrarDescarga}
      />
    </div>
  );
}
