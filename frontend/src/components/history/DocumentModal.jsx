import { useState } from 'react';
import PreviewDocument from '../document/PreviewDocument';
import Icon from '../atoms/Icon';

export default function DocumentModal({
  item,
  onClose,
  onDuplicate,
  onAnular,
  onReactivar,
  onRegistrarDescarga,
}) {
  const [downloading, setDownloading] = useState(false);

  if (!item) return null;

  const folioSuffix = item.folio.replace('FCI-', '');
  const anulada = item.estado === 'anulada';

  async function handleDownload() {
    setDownloading(true);
    try {
      const { downloadConstanciaPdf } = await import('../../pdf/downloadConstanciaPdf');
      await downloadConstanciaPdf({ tipo: item.tipo, data: item.data, folio: folioSuffix });
      onRegistrarDescarga(item.id);
    } catch (error) {
      console.error('No se pudo generar el PDF:', error);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/55 p-space-xl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] overflow-hidden rounded-2xl bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/60 px-space-md py-space-sm">
          <div className="flex items-center gap-space-sm">
            <h3 className="font-semibold text-primary text-title-md">{item.folio}</h3>
            {anulada && (
              <span className="rounded-full bg-error-container px-space-xs py-space-2xs font-bold uppercase text-on-error-container text-label-sm">
                Anulada
              </span>
            )}
            {!item.isExample && (
              <span className="text-outline text-label-sm">
                {item.descargas || 0} descarga{item.descargas === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded p-space-2xs text-outline hover:bg-surface-container-low hover:text-on-surface"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="flex justify-center bg-surface-container-low p-space-lg">
          <PreviewDocument tipo={item.tipo} data={item.data} folio={folioSuffix} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-space-sm border-t border-outline-variant/60 px-space-md py-space-sm">
          {anulada ? (
            <button
              type="button"
              onClick={() => onReactivar(item.id)}
              className="flex items-center gap-space-2xs rounded border border-outline-variant px-space-sm py-space-xs text-on-surface text-label-md hover:bg-surface-container-low"
            >
              <Icon name="restart_alt" className="text-[16px]" />
              Reactivar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAnular(item.id)}
              className="flex items-center gap-space-2xs rounded border border-outline-variant px-space-sm py-space-xs text-error text-label-md hover:bg-error-container"
            >
              <Icon name="block" className="text-[16px]" />
              Anular constancia
            </button>
          )}
          <button
            type="button"
            onClick={() => onDuplicate(item)}
            className="flex items-center gap-space-2xs rounded border border-outline-variant px-space-sm py-space-xs text-on-surface text-label-md hover:bg-surface-container-low"
          >
            <Icon name="content_copy" className="text-[16px]" />
            Duplicar para nueva emisión
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-space-2xs rounded border border-outline-variant px-space-sm py-space-xs text-on-surface text-label-md hover:bg-surface-container-low"
          >
            <Icon name="print" className="text-[16px]" />
            Imprimir
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-space-2xs rounded bg-primary px-space-md py-space-xs font-semibold text-on-primary shadow-sm text-label-md hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="download" className="text-[16px]" />
            {downloading ? 'Generando PDF…' : 'Descargar PDF'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-space-sm py-space-xs text-on-surface-variant text-label-md hover:bg-surface-container-low"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
