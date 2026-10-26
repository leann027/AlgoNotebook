import React, { useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-python';
import { FileEdit, ArrowLeftRight, CheckCircle2, GitBranch, Calculator } from 'lucide-react';
import type { SupportedLang, TraceFrame } from '../../core/types';

export interface CodeNotebookCardProps {
  activeLang: SupportedLang;
  onSelectLang: (lang: SupportedLang) => void;
  frame: TraceFrame;
  sourceCode: {
    c: string;
    python: string;
  };
  className?: string;
}

export const CodeNotebookCard: React.FC<CodeNotebookCardProps> = ({
  activeLang,
  onSelectLang,
  frame,
  sourceCode,
  className = 'lg:col-span-4',
}) => {
  const currentCode = sourceCode[activeLang] || '';
  const lines = useMemo(() => currentCode.split('\n'), [currentCode]);
  const activeLines = frame.highlightLines?.[activeLang] ?? [];

  // Syntax highlighting with PrismJS
  const highlightedLines = useMemo(() => {
    try {
      const grammar = activeLang === 'c' ? Prism.languages.c : Prism.languages.python;
      if (!grammar) return lines;
      const html = Prism.highlight(currentCode, grammar, activeLang);
      return html.split('\n');
    } catch {
      return lines;
    }
  }, [currentCode, activeLang, lines]);

  // Adaptive live variables tailored to the active algorithm's paradigm
  const liveVariables = useMemo(() => {
    const vars: Array<{ label: string; value: string | number; isHighlight?: boolean }> = [];

    // Pointer values
    for (const [key, val] of Object.entries(frame.pointers)) {
      const label =
        key === 'pivot' ? 'Pivote' :
        key === 'i' ? 'Índice i' :
        key === 'j' ? 'Puntero j' :
        key === 'low' ? 'Puntero low' :
        key === 'high' ? 'Puntero high' :
        key === 'mid' ? 'Puntero mid' :
        key;
      vars.push({ label, value: `${key} = ${val}`, isHighlight: key === 'pivot' || key === 'j' });
    }

    // Active comparisons
    if (frame.comparison) {
      vars.push({
        label: `arr[${frame.comparison.leftIndex}]`,
        value: frame.comparison.leftValue,
        isHighlight: true,
      });
      vars.push({
        label: `arr[${frame.comparison.rightIndex}]`,
        value: frame.comparison.rightValue,
        isHighlight: true,
      });
    }

    // DP Matrix active cell
    if (frame.matrixState?.activeCell) {
      vars.push({
        label: 'Celda DP',
        value: `dp[${frame.matrixState.activeCell.row}][${frame.matrixState.activeCell.col}]`,
        isHighlight: true,
      });
    }

    // Graph active node
    if (frame.graphState?.currentNodeId) {
      vars.push({
        label: 'Nodo Actual',
        value: frame.graphState.currentNodeId,
        isHighlight: true,
      });
    }

    // Tree active node
    if (frame.treeState?.activeNodeId) {
      vars.push({
        label: 'Nodo Árbol',
        value: frame.treeState.activeNodeId,
        isHighlight: true,
      });
    }

    // Linked List pointers
    if (frame.linkedListState?.pointers) {
      if (frame.linkedListState.pointers.curr) {
        vars.push({ label: 'curr', value: frame.linkedListState.pointers.curr, isHighlight: true });
      }
      if (frame.linkedListState.pointers.top) {
        vars.push({ label: 'top', value: frame.linkedListState.pointers.top, isHighlight: true });
      }
      if (frame.linkedListState.pointers.prev) {
        vars.push({ label: 'prev', value: frame.linkedListState.pointers.prev });
      }
      if (frame.linkedListState.pointers.next) {
        vars.push({ label: 'next', value: frame.linkedListState.pointers.next });
      }
    }

    return vars.slice(0, 4);
  }, [frame]);

  const totalSteps = Math.max(1, frame.totalSteps);
  const stepProgress = Math.min(100, Math.round((frame.stepIndex / totalSteps) * 100));

  return (
    <aside className={`flex flex-col bg-paper-surface rounded-lg border border-paper-border shadow-tactile-card overflow-hidden ${className}`}>
      {/* Archival Folder Tabs (Folder Index Header) */}
      <div className="flex items-center justify-between border-b border-paper-border bg-surface-container-high px-2 pt-2 select-none">
        <div className="flex items-center gap-1">
          {/* Python Tab */}
          <button
            type="button"
            onClick={() => onSelectLang('python')}
            className={`px-3.5 py-1.5 font-mono text-xs transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeLang === 'python'
                ? 'bg-paper-surface text-ink-primary border-t border-l border-r border-paper-border rounded-t font-bold flex items-center gap-1.5 shadow-sm -mb-px z-10'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            {activeLang === 'python' && (
              <span className="w-2 h-2 rounded-full bg-ink-primary" />
            )}
            <span>Python</span>
          </button>

          {/* C Tab */}
          <button
            type="button"
            onClick={() => onSelectLang('c')}
            className={`px-3.5 py-1.5 font-mono text-xs transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeLang === 'c'
                ? 'bg-paper-surface text-ink-primary border-t border-l border-r border-paper-border rounded-t font-bold flex items-center gap-1.5 shadow-sm -mb-px z-10'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            {activeLang === 'c' && (
              <span className="w-2 h-2 rounded-full bg-ink-primary" />
            )}
            <span>C</span>
          </button>

          {/* Pseudocode Tab (Educational view) */}
          <button
            type="button"
            className="px-3 py-1.5 text-ink-muted hover:text-ink-secondary font-mono text-xs transition-colors cursor-not-allowed"
            title="Especificación de pseudocódigo (Disponible en próxima versión)"
          >
            <span>Pseudocódigo</span>
          </button>
        </div>

        {/* Execution Status Chip */}
        <div className="pb-1.5 pr-2">
          <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">
            {activeLines.length > 0 ? `Línea ${activeLines.join(', ')} activa` : 'En espera'}
          </span>
        </div>
      </div>

      {/* Code Inspection Pane with Monospace Typography, Line Numbering & Prism Token Colors */}
      <div className="p-3 bg-paper-surface border-b border-paper-border overflow-x-auto min-h-[220px]">
        <div className="font-mono text-xs leading-relaxed select-text font-medium text-ink-primary">
          {lines.map((lineText, index) => {
            const lineNum = index + 1;
            const isLineActive = activeLines.includes(lineNum);

            return (
              <div
                key={lineNum}
                className={`flex items-center px-1 py-0.5 rounded transition-colors ${
                  isLineActive
                    ? 'bg-highlighter-compare border-l-4 border-ink-primary'
                    : 'border-l-4 border-transparent hover:bg-surface-container-low'
                }`}
              >
                {/* Line number / Active arrow marker */}
                {isLineActive ? (
                  <span className="w-6 text-center text-ink-primary font-bold select-none text-xs">
                    ▶
                  </span>
                ) : (
                  <span className="w-6 text-right pr-2 text-ink-muted select-none text-[11px]">
                    {lineNum}
                  </span>
                )}

                {/* Code text with Prism token styling */}
                <pre
                  className={`pl-2 font-mono whitespace-pre overflow-x-auto ${
                    isLineActive ? 'font-bold' : ''
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: highlightedLines[index] ?? (lineText || '&nbsp;'),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Margin Notes Panel with Millimeter Graph Paper Backing */}
      <div className="flex-1 bg-graph-grid p-4 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-paper-border pb-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary flex items-center gap-1.5">
              <FileEdit className="w-3.5 h-3.5 text-ink-primary" />
              Notas al Margen: Estado en Vivo
            </span>
            <span className="font-mono text-[11px] text-ink-muted">
              {frame.metrics.passNumber > 0 ? `PASADA #${frame.metrics.passNumber}` : `PASO #${frame.stepIndex}`}
            </span>
          </div>

          {/* Live Variable Badges */}
          {liveVariables.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {liveVariables.map((v, i) => (
                <div
                  key={`${v.label}-${i}`}
                  className="p-2 rounded bg-paper-surface border border-paper-border shadow-sm flex items-center justify-between"
                >
                  <span className="font-mono text-[11px] text-ink-secondary truncate max-w-[90px]" title={v.label}>
                    {v.label}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${
                      v.isHighlight
                        ? 'bg-highlighter-compare text-ink-primary border-ink-primary'
                        : 'bg-surface-container-low border-paper-border text-ink-primary'
                    }`}
                  >
                    {v.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 rounded bg-paper-surface border border-dashed border-paper-border text-center font-mono text-[11px] text-ink-muted">
              Estado de ejecución en reposo
            </div>
          )}

          {/* Dynamic Paradigm Metric Badge */}
          {frame.metrics.swaps > 0 ? (
            <div className="p-2.5 rounded bg-paper-surface border border-paper-border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-ink-secondary" />
                <span className="text-xs text-ink-primary">Intercambios Acumulados</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-highlighter-swap text-ink-primary border border-ink-primary rounded">
                swaps = {frame.metrics.swaps}
              </span>
            </div>
          ) : frame.matrixState?.optimalPathCells && frame.matrixState.optimalPathCells.length > 0 ? (
            <div className="p-2.5 rounded bg-paper-surface border border-paper-border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-ink-secondary" />
                <span className="text-xs text-ink-primary">Solución Óptima DP</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-highlighter-success text-ink-primary border border-ink-primary rounded">
                {frame.matrixState.optimalPathCells.length} celdas
              </span>
            </div>
          ) : frame.graphState?.queue ? (
            <div className="p-2.5 rounded bg-paper-surface border border-paper-border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-ink-secondary" />
                <span className="text-xs text-ink-primary">Cola FIFO de Vértices</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-highlighter-pointer text-ink-primary border border-ink-primary rounded">
                {frame.graphState.queue.length} en espera
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded bg-paper-surface border border-paper-border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-ink-secondary" />
                <span className="text-xs text-ink-primary">Acción Semántica</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-surface-container-low text-ink-primary border border-paper-border rounded uppercase">
                {frame.activeAction}
              </span>
            </div>
          )}
        </div>

        {/* Universal Progress Meter */}
        <div className="mt-4 pt-3 border-t border-paper-border bg-paper-surface/90 backdrop-blur-sm p-2.5 rounded border border-paper-border">
          <div className="flex justify-between items-center font-mono text-[11px] text-ink-primary mb-1">
            <span>
              Paso:{' '}
              <strong className="font-bold">
                {frame.stepIndex} / {totalSteps}
              </strong>
            </span>
            <span>
              Progreso:{' '}
              <strong className="font-bold">
                {stepProgress}%
              </strong>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex border border-paper-border">
            <div
              className="bg-ink-primary h-full rounded-full transition-all duration-200"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <p className="font-mono text-[10px] text-ink-muted mt-1.5 text-right">
            Línea de tiempo algorítmica
          </p>
        </div>
      </div>
    </aside>
  );
};


