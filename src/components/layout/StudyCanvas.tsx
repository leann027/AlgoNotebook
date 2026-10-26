import React from 'react';
import type { TraceFrame, AlgorithmMetadata } from '../../core/types';
import {
  ArrayViewport,
  TreeHierarchyViewport,
  GraphViewport,
  MatrixGridViewport,
  LinkedListViewport,
} from '../../renderers';
import { CustomInputBar } from '../controls/CustomInputBar';
import { StudyCanvasHeader } from './canvas/StudyCanvasHeader';
import { StickyExplanationNote } from './canvas/StickyExplanationNote';
import { CanvasActionIndicator } from './canvas/CanvasActionIndicator';

export interface StudyCanvasProps {
  frame: TraceFrame;
  metadata: AlgorithmMetadata;
  currentValues?: number[];
  onApplyInput?: (values: number[]) => void;
  onOpenTechnicalSheet?: () => void;
  isPlaying?: boolean;
  playbackSpeed?: number;
  className?: string;
}

export const StudyCanvas = React.memo<StudyCanvasProps>(({
  frame,
  metadata,
  currentValues,
  onApplyInput,
  onOpenTechnicalSheet,
  isPlaying = false,
  playbackSpeed = 1.0,
  className = 'lg:col-span-8',
}) => {
  const isTree = metadata.viewportType === 'tree';
  const isGraph = metadata.viewportType === 'graph';
  const isMatrix = metadata.viewportType === 'matrix';
  const isLinkedList = metadata.viewportType === 'linked-list';
  const array = frame.arrayState ?? [];
  const elementCount = array.length;
  const treeNodeCount = frame.treeState?.nodes ? Object.keys(frame.treeState.nodes).length : 0;
  const graphNodeCount = frame.graphState?.nodes ? Object.keys(frame.graphState.nodes).length : 0;
  const matrixRows = frame.matrixState?.numRows ?? (frame.matrixState?.cells?.length ?? 0);
  const matrixCols = frame.matrixState?.numCols ?? (frame.matrixState?.cells?.[0]?.length ?? 0);
  const linkedListNodeCount = frame.linkedListState?.nodes?.length ?? array.length;

  const delayMs = Math.round(1000 / playbackSpeed);
  const transitionDurationMs = isPlaying ? Math.min(200, Math.round(delayMs * 0.55)) : 200;

  const isBinarySearch =
    metadata.id.includes('binary-search') ||
    (metadata.category.toLowerCase().includes('búsqueda') && frame.pointers?.low !== undefined);

  const elementCountLabel = isTree
    ? `${treeNodeCount} Nodos`
    : isGraph
    ? `${graphNodeCount} Nodos`
    : isMatrix
    ? `${matrixRows}×${matrixCols} Matriz DP`
    : isLinkedList
    ? `${linkedListNodeCount} Nodos Enlazados`
    : `N = ${elementCount} Elementos`;

  const figureId =
    metadata.figureId ||
    (isTree
      ? 'FIG 4.1'
      : isGraph
      ? 'FIG 5.1'
      : isMatrix
      ? 'FIG 6.1'
      : isLinkedList
      ? 'FIG 7.1'
      : 'FIG 3.1');

  return (
    <section className={`flex flex-col bg-paper-surface rounded-lg border border-paper-border shadow-tactile-card overflow-hidden relative ${className}`}>
      {/* Canvas Top Instrument Bar / Header */}
      <StudyCanvasHeader
        figureId={figureId}
        title={metadata.name}
        stepIndex={frame.stepIndex}
        passNumber={frame.metrics.passNumber}
        category={metadata.category}
        elementCountLabel={elementCountLabel}
        comparisons={frame.metrics.comparisons}
        swaps={frame.metrics.swaps}
        timeComplexity={metadata.timeComplexity}
        spaceComplexity={metadata.spaceComplexity}
        onOpenTechSheet={onOpenTechnicalSheet}
      />

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
        <StickyExplanationNote
          step={frame.stepIndex}
          totalSteps={frame.totalSteps}
          explanation={frame.explanation.text}
          stepLabel={frame.explanation.stepLabel}
          subNote={frame.explanation.subNote}
        />

        {/* Mathematical Comparison Callout Bracket / Indicator */}
        <CanvasActionIndicator
          action={frame.activeAction}
          comparison={frame.comparison}
          viewportType={metadata.viewportType}
          matrixState={frame.matrixState}
          graphState={frame.graphState}
          treeState={frame.treeState}
        />

        {/* CONDITIONAL VIEWPORT: TREE VS GRAPH VS MATRIX VS LINKED LIST VS LINEAR ARRAY */}
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
          /* ARRAY VISUALIZER BARS (Extracted to ArrayViewport) */
          <ArrayViewport
            array={array}
            elementStates={frame.elementStates}
            pointers={frame.pointers}
            activeAction={frame.activeAction}
            isBinarySearch={isBinarySearch}
            transitionDurationMs={transitionDurationMs}
          />
        )}
      </div>
    </section>
  );
});

StudyCanvas.displayName = 'StudyCanvas';
