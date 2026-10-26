import React, { useState, useEffect, useId } from 'react';
import {
  FileText,
  X,
  Lightbulb,
  Cpu,
  Bookmark,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import type {
  AlgorithmTechnicalSheet as ITechnicalSheet,
  AlgorithmMetadata,
} from '../../core/types';
import {
  ALGORITHM_RECURRENCES,
  DEFAULT_RECURRENCE,
} from '../../data/algorithmRecurrences';
import {
  IntuitionTab,
  MechanismTab,
  InvariantTab,
  ComplexityTab,
  EdgeCasesTab,
} from './technical-sheet';

export interface AlgorithmTechnicalSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet?: ITechnicalSheet;
  metadata?: AlgorithmMetadata;
}

type SheetTab = 'intuition' | 'mechanism' | 'invariant' | 'complexity' | 'edgeCases';

/**
 * AlgorithmTechnicalSheetModal — Pestaña Flotante de Ficha Técnica y Fundamentos
 *
 * Muestra una tarjeta técnica flotante de alta resolución con estética de libreta de ingeniería,
 * explicando el propósito práctico, analogías del mundo real, mecánica paso a paso,
 * justificación asintótica Big-O e invariantes formales sin robar espacio de la pantalla principal.
 */
export const AlgorithmTechnicalSheetModal: React.FC<AlgorithmTechnicalSheetModalProps> = ({
  isOpen,
  onClose,
  sheet,
  metadata,
}) => {
  const [activeTab, setActiveTab] = useState<SheetTab>('intuition');
  const titleId = useId();

  // Capturar tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Si no está abierto o no hay ficha, no renderizar
  if (!isOpen || !sheet) return null;

  const complexityRecord = sheet.complexity as unknown as Record<string, string | undefined>;
  const bestComplexity =
    complexityRecord.timeBest ??
    sheet.complexity.best ??
    metadata?.timeComplexity?.best ??
    '—';
  const avgComplexity =
    complexityRecord.timeAverage ??
    sheet.complexity.average ??
    metadata?.timeComplexity?.average ??
    '—';
  const worstComplexity =
    complexityRecord.timeWorst ??
    sheet.complexity.worst ??
    metadata?.timeComplexity?.worst ??
    '—';
  const spaceComplexity =
    complexityRecord.space ??
    sheet.complexity.auxiliarySpace ??
    metadata?.spaceComplexity ??
    '—';

  const activeRecInfo =
    (metadata?.id && ALGORITHM_RECURRENCES[metadata.id])
      ? ALGORITHM_RECURRENCES[metadata.id]
      : DEFAULT_RECURRENCE;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink-primary/50 backdrop-blur-xs animate-fade-in select-none overscroll-contain"
      onClick={onClose}
    >
      <div
        className="bg-paper-surface border-2 border-paper-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col text-ink-primary overflow-hidden relative animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Cabecera estilo Ficha de Cuaderno de Ingeniería */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-border bg-paper-surface shrink-0 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-surface-container border border-paper-border flex items-center justify-center text-ink-primary shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  {metadata?.figureId || 'FICHA TÉCNICA'}
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-surface-container-low border border-paper-border text-ink-secondary">
                  {sheet.properties.paradigm}
                </span>
              </div>
              <h2 id={titleId} className="font-headline font-bold text-base sm:text-lg text-ink-primary leading-tight mt-0.5 truncate">
                {metadata?.name ?? 'Algoritmo de Ingeniería'} — Fundamentos y Mecánica
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0 ml-2 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none"
            title="Cerrar Ficha Técnica (Esc)"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Barra de Navegación Rápida por Pestañas */}
        <div className="flex items-center gap-1 px-5 pt-2.5 pb-2 border-b border-paper-border bg-surface-container-high/40 overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('intuition')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeTab === 'intuition'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Intuición & Metáfora</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mechanism')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeTab === 'mechanism'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mecánica Paso a Paso</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invariant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeTab === 'invariant'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
            <span>Invariante Formal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('complexity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeTab === 'complexity'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Complejidad Big-O</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edgeCases')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeTab === 'edgeCases'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Casos Borde</span>
          </button>
        </div>

        {/* 3. Contenedor de Contenido con Scroll Suave */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5 bg-paper-base/30">
          {activeTab === 'intuition' && <IntuitionTab sheet={sheet} />}
          {activeTab === 'mechanism' && (
            <MechanismTab sheet={sheet} activeRecInfo={activeRecInfo} />
          )}
          {activeTab === 'invariant' && <InvariantTab sheet={sheet} />}
          {activeTab === 'complexity' && (
            <ComplexityTab
              sheet={sheet}
              activeRecInfo={activeRecInfo}
              bestComplexity={bestComplexity}
              avgComplexity={avgComplexity}
              worstComplexity={worstComplexity}
              spaceComplexity={spaceComplexity}
            />
          )}
          {activeTab === 'edgeCases' && <EdgeCasesTab sheet={sheet} />}
        </div>

        {/* 4. Pie de la Ficha Flotante */}
        <div className="px-5 py-3 border-t border-paper-border bg-paper-surface flex items-center justify-between shrink-0">
          <span className="font-mono text-[11px] text-ink-muted hidden sm:inline">
            Presiona <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-paper-border font-bold">Esc</kbd> para cerrar
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-ink-primary text-paper-surface hover:bg-ink-primary/90 font-mono text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98] focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none"
              aria-label="Cerrar modal"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
