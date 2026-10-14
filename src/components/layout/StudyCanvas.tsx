import React from 'react';
import {
  ArrowLeftRight,
  ArrowUpDown,
  Calculator,
  CheckCircle2,
  GitBranch,
  FileText,
} from 'lucide-react';
import type { TraceFrame, AlgorithmMetadata, ElementState } from '../../core/types';
import {
  TreeHierarchyViewport,
  GraphViewport,
  MatrixGridViewport,
  LinkedListViewport,
} from '../../renderers';
import { CustomInputBar } from '../controls/CustomInputBar';

export interface StudyCanvasProps {
  frame: TraceFrame;
  metadata: AlgorithmMetadata;
  currentValues?: number[];
  onApplyInput?: (values: number[]) => void;
  onOpenTechnicalSheet?: () => void;
  className?: string;
}

export const StudyCanvas: React.FC<StudyCanvasProps> = ({
  frame,
  metadata,
  currentValues,
  onApplyInput,
  onOpenTechnicalSheet,
  className = 'lg:col-span-8',
}) => {
  const isTree = metadata.viewportType === 'tree';
  const isGraph = metadata.viewportType === 'graph';
  const isMatrix = metadata.viewportType === 'matrix';
  const isLinkedList = metadata.viewportType === 'linked-list';
  const array = frame.arrayState ?? [];
  const maxVal = Math.max(...array, 1);
  const elementCount = array.length;
  const treeNodeCount = frame.treeState?.nodes ? Object.keys(frame.treeState.nodes).length : 0;
  const graphNodeCount = frame.graphState?.nodes ? Object.keys(frame.graphState.nodes).length : 0;
  const matrixRows = frame.matrixState?.numRows ?? (frame.matrixState?.cells?.length ?? 0);
  const matrixCols = frame.matrixState?.numCols ?? (frame.matrixState?.cells?.[0]?.length ?? 0);
  const linkedListNodeCount = frame.linkedListState?.nodes?.length ?? array.length;

  // Determine pointers associated with each index
  const getPointersForIndex = (index: number): string[] => {
    if (!frame.pointers) return [];
    return Object.entries(frame.pointers)
      .filter(([, val]) => val === index)
      .map(([key]) => key);
  };

  return (
    <section className={`flex flex-col bg-paper-surface rounded-lg border border-paper-border shadow-tactile-card overflow-hidden relative ${className}`}>
      {/* Canvas Top Instrument Bar / Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-paper-border px-4 py-2.5 bg-paper-surface z-10 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-xs font-bold tracking-wider text-ink-primary uppercase">
            {metadata.figureId || (isTree ? 'FIG 4.1' : isGraph ? 'FIG 5.1' : isMatrix ? 'FIG 6.1' : isLinkedList ? 'FIG 7.1' : 'FIG 3.1')}:{' '}
            {metadata.name} — PASO #{frame.stepIndex}
            {frame.metrics.passNumber > 0 ? ` · PASADA #${frame.metrics.passNumber}` : ''}
          </span>
          <span className="h-3 w-px bg-paper-border hidden sm:inline-block" />
          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface-container-low border border-paper-border text-ink-muted">
            {metadata.category}
          </span>
          <span className="font-mono text-xs text-ink-secondary">
            {isTree
              ? `${treeNodeCount} Nodos`
              : isGraph
              ? `${graphNodeCount} Nodos`
              : isMatrix
              ? `${matrixRows}×${matrixCols} Matriz DP`
              : isLinkedList
              ? `${linkedListNodeCount} Nodos Enlazados`
              : `N = ${elementCount} Elementos`}
          </span>
          {(frame.metrics.comparisons > 0 || frame.metrics.swaps > 0) && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container border border-paper-border text-ink-secondary">
              Comp: {frame.metrics.comparisons} · Swaps: {frame.metrics.swaps}
            </span>
          )}
        </div>

        {/* Metric and Time Complexity Pills + Ficha Técnica Trigger */}
        <div className="flex items-center gap-2">
          {onOpenTechnicalSheet && (
            <button
              type="button"
              onClick={onOpenTechnicalSheet}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low font-mono text-xs text-ink-primary transition-all shadow-xs cursor-pointer active:translate-y-0.5"
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
            <span className="text-ink-muted">Tiempo:</span> {metadata.timeComplexity.worst} Peor
            {metadata.timeComplexity.best ? ` / ${metadata.timeComplexity.best} Mejor` : ''}
          </span>
          <span
            className="px-2 py-0.5 rounded bg-surface-container-low border border-paper-border font-mono text-xs text-ink-primary font-medium"
            title="Espacio Auxiliar en Memoria"
          >
            <span className="text-ink-muted">Espacio:</span> {metadata.spaceComplexity}
          </span>
        </div>
      </div>

      {/* Dynamic Data Custom Input Bar */}
      {onApplyInput && (
        <CustomInputBar
          currentValues={currentValues ?? array}
          onApplyInput={onApplyInput}
        />
      )}

      {/* Interactive Visualization Drawing Canvas with Subtle Engineering Graph Paper Grid */}
      <div className="relative flex-1 p-4 lg:p-6 flex flex-col justify-between subtle-graph-grid min-h-[440px]">
        {/* Realistic Yellow Sticky Callout Note pinned to top-left of canvas */}
        <div className="self-start relative max-w-md min-h-[64px] bg-[#FFFBEA] border border-[#FDE047] rounded-sm p-3 shadow-postit transform -rotate-1 transition-all duration-150 hover:rotate-0 z-20">
          {/* Sticky Tape Visual at top center */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-white/70 border-t border-b border-paper-border rotate-2 backdrop-blur-[1px]" />
          <div className="flex items-start gap-2 pt-1">
            <span className="text-sm select-none" role="img" aria-label="pin">
              📌
            </span>
            <div className="text-xs text-ink-primary leading-snug">
              <span className="font-bold font-mono uppercase tracking-wide mr-1.5">
                {frame.explanation.stepLabel || `Paso ${frame.stepIndex} de ${frame.totalSteps}:`}
              </span>
              <span>{frame.explanation.text}</span>
              {frame.explanation.subNote && (
                <div className="mt-1 text-ink-secondary italic text-[11px]">
                  {frame.explanation.subNote}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mathematical Comparison Callout Bracket / Indicator */}
        <div className="flex justify-center my-2">
          {frame.comparison ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-surface border border-ink-primary shadow-sm text-ink-primary font-mono text-xs animate-pulse">
              <ArrowLeftRight className="w-3.5 h-3.5 text-ink-primary" />
              <span className="font-bold">
                {frame.comparison.leftValue} &gt; {frame.comparison.rightValue} ?{' '}
                {frame.comparison.conditionMet ? 'SÍ' : 'NO'}
              </span>
              <span className="text-ink-secondary">
                → {isTree
                    ? (frame.comparison.conditionMet ? 'Rama Derecha (>)' : 'Rama Izquierda (≤)')
                    : isGraph
                    ? (frame.comparison.conditionMet ? 'Criterio Cumplido' : 'Descartado')
                    : isMatrix
                    ? (frame.comparison.conditionMet ? 'Criterio Seleccionado' : 'Alternativa Descartada')
                    : (frame.comparison.conditionMet ? 'Intercambio requerido' : 'Ya en orden')}
              </span>
            </div>
          ) : isMatrix && frame.matrixState?.activeCell ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-compare/60 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
              <Calculator className="w-3.5 h-3.5 text-ink-primary" />
              <span className="font-bold">
                dp[{frame.matrixState.activeCell.row}][{frame.matrixState.activeCell.col}]
              </span>
              <span className="text-ink-secondary">
                {frame.matrixState.currentFormula
                  ? `→ ${frame.matrixState.currentFormula}`
                  : '→ Evaluando celda'}
              </span>
            </div>
          ) : isMatrix && (frame.matrixState?.optimalPathCells?.length ?? 0) > 0 ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-success/40 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-ink-primary" />
              <span className="font-bold">Reconstrucción Óptima</span>
              <span className="text-ink-secondary">→ Solución final</span>
            </div>
          ) : isGraph && frame.graphState?.currentNodeId ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-compare/60 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
              <GitBranch className="w-3.5 h-3.5 text-ink-primary" />
              <span className="font-bold">Nodo Actual ({frame.graphState.currentNodeId})</span>
              <span className="text-ink-secondary">→ Explorando adyacencias</span>
            </div>
          ) : isTree && frame.treeState?.insertedNodeId ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-success/40 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-ink-primary" />
              <span className="font-bold">Nodo Insertado</span>
              <span className="text-ink-secondary">→ Estructura balanceada</span>
            </div>
          ) : isTree && frame.treeState?.activeNodeId ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-compare/60 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
              <GitBranch className="w-3.5 h-3.5 text-ink-primary" />
              <span className="font-bold">Nodo Inspeccionado</span>
              <span className="text-ink-secondary">→ Evaluando clave</span>
            </div>
          ) : frame.activeAction === 'swap' ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-surface border border-ink-primary shadow-sm text-ink-primary font-mono text-xs animate-pulse">
              <ArrowLeftRight className="w-3.5 h-3.5 text-ink-primary" />
              <span className="font-bold">Intercambiando valores en memoria</span>
              <span className="text-ink-secondary">→ Mutación activa</span>
            </div>
          ) : frame.activeAction === 'locked' ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-success/40 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-ink-primary" />
              <span className="font-bold">Elemento fijado</span>
              <span className="text-ink-secondary">→ Posición final</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-surface border border-paper-border text-ink-secondary font-mono text-xs">
              <span>
                {isTree
                  ? 'Árbol Listo para Inspección'
                  : isGraph
                  ? 'Grafo Listo para Exploración'
                  : isMatrix
                  ? 'Matriz DP Lista para Inspección'
                  : 'Listo para Inspección'}
              </span>
            </div>
          )}
        </div>

        {/* CONDITIONAL VIEWPORT: TREE VS GRAPH VS MATRIX VS LINEAR ARRAY */}
        {isTree ? (
          /* TREE HIERARCHY VIEWPORT */
          <div className="w-full flex-1 flex flex-col justify-between pt-2 pb-2">
            <div className="flex-1 w-full flex items-center justify-center min-h-[360px] overflow-hidden">
              <TreeHierarchyViewport
                treeState={frame.treeState}
                activeAction={frame.activeAction}
              />
            </div>

            {/* Tree Baseline Legend */}
            <div className="flex flex-wrap items-center justify-between pt-2 px-4 border-t border-paper-border text-ink-muted font-mono text-xs gap-2">
              <span>← Recorrido y Estructura Jerárquica del Árbol</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-highlighter-compare border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">Nodo Comparado</span>
                <span className="w-2.5 h-2.5 rounded-full bg-highlighter-success border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">Nodo Insertado</span>
                <span className="w-2.5 h-2.5 rounded-full bg-paper-surface border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">Estructura</span>
                <span className="w-3.5 h-1 bg-ink-primary inline-block rounded-sm" />
                <span className="text-ink-secondary">Camino Trazado</span>
              </div>
            </div>
          </div>
        ) : isGraph ? (
          /* GRAPH VIEWPORT */
          <div className="w-full flex-1 flex flex-col justify-between pt-2 pb-2">
            <div className="flex-1 w-full flex items-center justify-center min-h-[360px] overflow-hidden">
              <GraphViewport
                graphState={frame.graphState}
                activeAction={frame.activeAction}
              />
            </div>

            {/* Graph Baseline Legend */}
            <div className="flex flex-wrap items-center justify-between pt-2 px-4 border-t border-paper-border text-ink-muted font-mono text-xs gap-2">
              <span>← Topología de Red y Recorrido de Grafos</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-highlighter-compare border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">Nodo Actual</span>
                <span className="w-2.5 h-2.5 rounded-full bg-highlighter-pointer border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">En Frontera</span>
                <span className="w-2.5 h-2.5 rounded-full bg-highlighter-success border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">Procesado / Visitado</span>
                <span className="w-3.5 h-1 bg-highlighter-compare border border-ink-primary inline-block rounded-sm" />
                <span className="text-ink-secondary">Arista Activa</span>
              </div>
            </div>
          </div>
        ) : isMatrix ? (
          /* MATRIX GRID VIEWPORT */
          <div className="w-full flex-1 flex flex-col justify-between pt-2 pb-2">
            <div className="flex-1 w-full flex items-center justify-center min-h-[360px] overflow-hidden">
              <MatrixGridViewport
                matrixState={frame.matrixState}
                activeAction={frame.activeAction}
              />
            </div>

            {/* Matrix Baseline Legend */}
            <div className="flex flex-wrap items-center justify-between pt-2 px-4 border-t border-paper-border text-ink-muted font-mono text-xs gap-2">
              <span>← Matriz de Programación Dinámica y Recurrencia</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-compare border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">Celda en Cálculo</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-pointer border border-ink-primary border-dashed inline-block" />
                <span className="text-ink-secondary mr-2">Celda Dependiente</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-success border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">Reconstrucción Óptima</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-paper-surface border border-paper-border inline-block" />
                <span className="text-ink-secondary">Calculada</span>
              </div>
            </div>
          </div>
        ) : isLinkedList ? (
          /* LINKED LIST VIEWPORT */
          <div className="w-full flex-1 flex flex-col justify-between pt-2 pb-2">
            <div className="flex-1 w-full flex items-center justify-center min-h-[360px] overflow-x-auto scrollbar-thin">
              <LinkedListViewport
                linkedListState={frame.linkedListState}
                activeAction={frame.activeAction}
              />
            </div>

            {/* Linked List Baseline Legend */}
            <div className="flex flex-wrap items-center justify-between pt-2 px-4 border-t border-paper-border text-ink-muted font-mono text-xs gap-2">
              <span>← Lista Enlazada: Topología de Memoria y Punteros C</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-compare border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">curr (Actual)</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-success border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">prev (Invertido)</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-pointer border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">next (Resguardo)</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-paper-surface border border-ink-primary inline-block" />
                <span className="text-ink-secondary">Nodo Normal</span>
              </div>
            </div>
          </div>
        ) : (
          /* ARRAY VISUALIZER BARS */
          <div className="w-full flex-1 flex flex-col justify-end pt-4 pb-2">
            {array.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-ink-muted font-mono text-xs gap-2 select-none">
                <span>No hay elementos cargados en el arreglo.</span>
                <span className="text-[11px] text-ink-secondary">
                  Ingresa números en la barra superior o presiona "Aleatorio" para inicializar.
                </span>
              </div>
            ) : (
              <div className="h-64 w-full flex items-end justify-center px-2 md:px-8 border-b-2 border-ink-primary relative">
                {/* Y-Axis Grid reference lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="w-full border-b border-dashed border-ink-primary" />
                  <div className="w-full border-b border-dashed border-ink-primary" />
                  <div className="w-full border-b border-dashed border-ink-primary" />
                  <div className="w-full border-b border-dashed border-ink-primary" />
                </div>

                {/* Contenedor centralizado de barras proporcionales */}
                <div
                  className="w-full flex items-end justify-center gap-2 sm:gap-3.5 h-full relative z-10"
                  style={{ maxWidth: `${Math.min(760, Math.max(300, array.length * 75))}px` }}
                >
                  {/* BARS */}
                  {array.map((val, idx) => {
                    const state: ElementState = frame.elementStates[idx] || 'default';
                    const pointersAtIdx = getPointersForIndex(idx);
                    const heightPercent = Math.max(16, Math.round((val / maxVal) * 100));

                    const isComparing = state === 'comparing';
                    const isSwapping = state === 'swapping';
                    const isSorted = state === 'sorted';

                    return (
                      <div
                        key={idx}
                        className={`flex-1 max-w-[64px] flex flex-col items-center h-full justify-end ${
                          isComparing || isSwapping ? 'z-20' : 'z-10 group'
                        }`}
                      >
                        {/* Top Value Label */}
                        <div className="mb-1 flex flex-col items-center">
                          {isComparing ? (
                            <span className="px-1.5 py-0.5 rounded bg-highlighter-compare border border-ink-primary font-mono text-xs font-bold text-ink-primary shadow-sm">
                              {val}
                            </span>
                          ) : isSwapping ? (
                            <span className="px-1.5 py-0.5 rounded bg-highlighter-swap border border-ink-primary font-mono text-xs font-bold text-ink-primary shadow-sm">
                              {val}
                            </span>
                          ) : isSorted ? (
                            <span className="px-1.5 py-0.5 rounded bg-highlighter-success border border-ink-primary font-mono text-xs font-bold text-ink-primary">
                              {val}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-ink-primary font-semibold">
                              {val}
                            </span>
                          )}
                        </div>

                        {/* Vertical Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[56px] rounded-t transition-all duration-300 ease-out ${
                            isComparing
                              ? 'bg-highlighter-compare border-[2.5px] border-ink-primary ring-2 ring-highlighter-compare/50 flex flex-col justify-between items-center py-2'
                              : isSwapping
                              ? 'bg-highlighter-swap border-[2.5px] border-ink-primary ring-2 ring-highlighter-swap/50 flex flex-col justify-between items-center py-2'
                              : isSorted
                              ? 'bg-highlighter-success border-[2px] border-ink-primary flex flex-col justify-start items-center pt-2'
                              : 'bg-paper-surface border-[2px] border-ink-primary group-hover:bg-surface-container-low'
                          }`}
                        >
                          {isComparing && (
                            <>
                              <ArrowUpDown className="w-3 h-3 text-ink-primary" />
                              <span className="font-mono text-[10px] font-bold text-ink-primary">
                                CMP
                              </span>
                            </>
                          )}
                          {isSwapping && (
                            <>
                              <ArrowLeftRight className="w-3 h-3 text-ink-primary" />
                              <span className="font-mono text-[10px] font-bold text-ink-primary">
                                SWP
                              </span>
                            </>
                          )}
                          {isSorted && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-ink-primary" />
                          )}
                        </div>

                        {/* Index and Pointer badges below baseline */}
                        <div className="w-full flex flex-col items-center mt-1">
                          <span
                            className={`font-mono text-xs ${
                              isComparing || isSwapping
                                ? 'font-bold text-ink-primary'
                                : isSorted
                                ? 'font-semibold text-ink-primary'
                                : 'text-ink-muted'
                            }`}
                          >
                            {idx}
                          </span>

                          {/* Sorted Chip */}
                          {isSorted && (
                            <span className="mt-0.5 px-1 bg-highlighter-success text-ink-primary font-mono text-[8px] rounded border border-ink-primary">
                              Ordenado
                            </span>
                          )}

                          {/* Pointer Cursor Chips */}
                          {pointersAtIdx.map((ptrName) => (
                            <span
                              key={ptrName}
                              className="mt-0.5 px-1 py-0.2 bg-highlighter-pointer text-ink-primary font-mono text-[9px] rounded border border-ink-primary uppercase tracking-tighter"
                            >
                              {ptrName}={idx}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Baseline Sub-Axis Legend */}
            <div className="flex items-center justify-between pt-2 px-4 text-ink-muted font-mono text-xs">
              <span>← Recorrido de Índices y Punteros</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-compare border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">Comparar</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-swap border border-ink-primary inline-block" />
                <span className="text-ink-secondary mr-2">Intercambiar</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-success border border-ink-primary inline-block" />
                <span className="text-ink-secondary">Fijado / Ordenado</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
