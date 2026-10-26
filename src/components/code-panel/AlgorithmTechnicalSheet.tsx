import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import type { AlgorithmTechnicalSheet as ITechnicalSheet } from '../../core/types';

export interface AlgorithmTechnicalSheetProps {
  sheet?: ITechnicalSheet;
  className?: string;
  onClick?: () => void;
}

/**
 * AlgorithmTechnicalSheet — Botón Táctil de Ficha Técnica
 *
 * Reemplaza la tarjeta expandida invasiva por un botón compacto estilo libreta
 * que abre la pestaña flotante de ficha técnica por encima, maximizando el espacio
 * disponible para el visualizador, código fuente y call stack.
 */
export const AlgorithmTechnicalSheet: React.FC<AlgorithmTechnicalSheetProps> = ({
  sheet,
  className = '',
  onClick,
}) => {
  if (!sheet) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-2.5 sm:p-3 rounded-lg bg-paper-surface border border-paper-border hover:bg-surface-container-low transition-all shadow-tactile-card flex items-center justify-between text-left group cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${className}`.trim()}
      title="Abrir Ficha Técnica y Fundamentos Teóricos (Ventana Flotante)"
      aria-label="Abrir Ficha Técnica y Fundamentos Teóricos"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-surface-container border border-paper-border flex items-center justify-center text-ink-primary group-hover:bg-ink-primary group-hover:text-paper-surface transition-colors shadow-xs shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-ink-primary leading-none">
              Ficha Técnica
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-container text-ink-secondary border border-paper-border uppercase font-semibold">
              {sheet.properties.paradigm}
            </span>
          </div>
          <p className="text-[11px] text-ink-secondary mt-0.5 line-clamp-1">
            Intuición, invariante, pasos y complejidad Big-O
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-ink-muted group-hover:text-ink-primary transition-colors shrink-0 pl-2">
        <span className="font-mono text-[10px] font-semibold hidden sm:inline">Ver Ficha</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </div>
    </button>
  );
};
