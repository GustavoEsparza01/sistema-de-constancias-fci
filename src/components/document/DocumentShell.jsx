import VarField from '../atoms/VarField';
import logoUnacar from '../../assets/logo-unacar.png';
import logoFci from '../../assets/logo-fci.png';

/**
 * Membrete, folio y cierre/firma — el texto fijo de la plantilla
 * (Regla PDF1) que es idéntico en ambos tipos de constancia. Los
 * párrafos variables se pasan como children. Tipografía serif a
 * propósito: es la misma que se usa en el PDF real generado con
 * @react-pdf/renderer, para que esta vista previa no prometa un
 * documento distinto del que se descarga.
 */
export default function DocumentShell({ folio, titulo, children }) {
  return (
    <div className="doc-paper w-full max-w-[680px] rounded-sm bg-surface-container-lowest px-10 py-11 text-on-surface shadow-xl">
      <div className="mb-space-lg flex items-center justify-between gap-space-sm">
        <img src={logoUnacar} alt="Escudo UNACAR" className="h-[70px] w-auto shrink-0" />
        <div className="text-center">
          <div className="uppercase tracking-[0.04em] text-[15px]">Universidad Autónoma del Carmen</div>
          <div className="mt-1 text-[13.5px] font-bold">Facultad de Ciencias de la Información</div>
        </div>
        <img src={logoFci} alt="Logo FCI" className="h-[70px] w-auto shrink-0" />
      </div>

      <div className="mb-space-md flex items-center justify-between border-b border-outline-variant pb-space-xs font-mono text-outline text-label-sm">
        <span className="uppercase tracking-wide">{titulo}</span>
        <span className="font-bold text-primary">
          FCI-
          <VarField value={folio} placeholder="‹folio›" />
        </span>
      </div>

      {children}

      <p className="mt-[26px] text-center">A t e n t a m e n t e</p>
      <p className="text-center italic">&ldquo;Por la Grandeza de México&rdquo;</p>
      <div className="mt-space-xl text-center">
        <div className="mx-auto mb-space-2xs w-[230px] border-t border-on-surface" />
        <div className="text-[13.5px] font-bold">Mtra. Saide Dariola Duran Martin</div>
        <div className="text-on-surface-variant text-label-md">
          Secretaria Administrativa de la Facultad de Ciencias de la Información
        </div>
        <div className="mt-space-2xs text-on-surface-variant text-label-sm">sduran@delfin.unacar.mx</div>
      </div>
    </div>
  );
}
