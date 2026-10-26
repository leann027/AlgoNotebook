import React from 'react';
import { FileText } from 'lucide-react';

export interface StudyCanvasHeaderProps {
  figureId?: string;
  title: string;
  stepIndex: number;
  passNumber?: number;
  category: string;
  elementCount?: number;
  elementCountLabel?: string;
  comparisons: number;
  swaps: number;
  timeComplexity: string | { worst: string; best?: string };
  spaceComplexity: string;
  onOpenTechSheet?: () => void;
  className?: string;
}

export const StudyCanvasHeader: React.FC<StudyCanvasHeaderProps> = ({
  figureId = 'FIG 3.1',
  title,
  stepIndex,
  passNumber = 0,
  category,
  elementCount = 0,
  elementCountLabel,
  comparisons,
  swaps,
  timeComplexity,
  spaceComplexity,
  onOpenTechSheet,
  className = '',
}) => {
  const displayElementCount = elementCountLabel || `N = ${elementCount} Elementos`;
  const timeComplexityWorst = typeof timeComplexity === 'string' ? timeComplexity : timeComplexity.worst;
  const timeComplexityBest = typeof timeComplexity === 'string' ? undefined : timeComplexity.best;

  return (
    <div className={`flex flex-wrap items-center justify-between border-b border-paper-border px-4 py-2.5 bg-paper-surface z-10 gap-2 ${className}`}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="font-mono text-xs font-bold tracking-wider text-ink-primary uppercase">
          {figureId}: {title} — PASO #{stepIndex}
          {passNumber > 0 ? ` · PASADA #${passNumber}` : ''}
        </span>
        <span className="h-3 w-px bg-paper-border hidden sm:inline-block" />
        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface-container-low border border-paper-border text-ink-muted">
          {category}
        </span>
        <span className="font-mono text-xs text-ink-secondary">
          {displayElementCount}
        </span>
        {(comparisons > 0 || swaps > 0) && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container border border-paper-border text-ink-secondary">
            Comp: {comparisons} · Swaps: {swaps}
          </span>
        )}
      </div>

      {/* Metric and Time Complexity Pills + Ficha Técnica Trigger */}
      <div className="flex items-center gap-2">
        {onOpenTechSheet && (
          <button
            type="button"
            onClick={onOpenTechSheet}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low font-mono text-xs text-ink-primary transition-all shadow-xs cursor-pointer active:translate-y-0.5 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none"
            title="Abrir Ficha Técnica y Fundamentos Teóricos (Ventana Flotante)"
          >
            <FileText className="w-3.5 h-3.5 text-ink-secondary" />
            <span className="font-semibold">Ficha Técnica</span>
          </button>
        )}

        <span
          className="px-2 py-0.5 rounded bg-surface-container-low border border-paper-border font-mono text-xs text-ink-primary font-medium"
          title="Complejidad Temporal Teórica"
        >
          <span className="text-ink-muted">Tiempo:</span> {timeComplexityWorst}
          {timeComplexityBest ? ` / ${timeComplexityBest} Mejor` : typeof timeComplexity !== 'string' && timeComplexityWorst ? ' Peor' : ''}
        </span>
        <span
          className="px-2 py-0.5 rounded bg-surface-container-low border border-paper-border font-mono text-xs text-ink-primary font-medium"
          title="Espacio Auxiliar en Memoria"
        >
          <span className="text-ink-muted">Espacio:</span> {spaceComplexity}
        </span>
      </div>
    </div>
  );
};
