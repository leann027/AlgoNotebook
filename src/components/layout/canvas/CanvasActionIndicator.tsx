import React from 'react';
import {
  ArrowLeftRight,
  Calculator,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';
import type {
  ActiveAction,
  ComparisonDetails,
  ViewportType,
  MatrixGridAlgorithmState,
  GraphAlgorithmState,
  TreeAlgorithmState,
} from '../../../core/types';

export interface CanvasActionIndicatorProps {
  action?: ActiveAction;
  comparison?: ComparisonDetails | string;
  formula?: string;
  viewportType?: ViewportType;
  matrixState?: MatrixGridAlgorithmState;
  graphState?: GraphAlgorithmState;
  treeState?: TreeAlgorithmState;
  className?: string;
}

export const CanvasActionIndicator: React.FC<CanvasActionIndicatorProps> = ({
  action,
  comparison,
  formula,
  viewportType = 'linear',
  matrixState,
  graphState,
  treeState,
  className = '',
}) => {
  const isTree = viewportType === 'tree';
  const isGraph = viewportType === 'graph';
  const isMatrix = viewportType === 'matrix';

  return (
    <div className={`flex justify-center my-2 ${className}`}>
      {comparison && typeof comparison !== 'string' ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-surface border border-ink-primary shadow-sm text-ink-primary font-mono text-xs animate-pulse">
          <ArrowLeftRight className="w-3.5 h-3.5 text-ink-primary" />
          <span className="font-bold">
            {comparison.leftValue} &gt; {comparison.rightValue} ?{' '}
            {comparison.conditionMet ? 'SÍ' : 'NO'}
          </span>
          <span className="text-ink-secondary">
            →{' '}
            {isTree
              ? comparison.conditionMet
                ? 'Rama Derecha (>)'
                : 'Rama Izquierda (≤)'
              : isGraph
              ? comparison.conditionMet
                ? 'Criterio Cumplido'
                : 'Descartado'
              : isMatrix
              ? comparison.conditionMet
                ? 'Criterio Seleccionado'
                : 'Alternativa Descartada'
              : comparison.conditionMet
              ? 'Intercambio requerido'
              : 'Ya en orden'}
          </span>
        </div>
      ) : typeof comparison === 'string' ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-surface border border-ink-primary shadow-sm text-ink-primary font-mono text-xs animate-pulse">
          <ArrowLeftRight className="w-3.5 h-3.5 text-ink-primary" />
          <span className="font-bold">{comparison}</span>
        </div>
      ) : isMatrix && matrixState?.activeCell ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-compare/60 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
          <Calculator className="w-3.5 h-3.5 text-ink-primary" />
          <span className="font-bold">
            dp[{matrixState.activeCell.row}][{matrixState.activeCell.col}]
          </span>
          <span className="text-ink-secondary">
            {matrixState.currentFormula || formula
              ? `→ ${matrixState.currentFormula || formula}`
              : '→ Evaluando celda'}
          </span>
        </div>
      ) : isMatrix && (matrixState?.optimalPathCells?.length ?? 0) > 0 ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-success/40 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-ink-primary" />
          <span className="font-bold">Reconstrucción Óptima</span>
          <span className="text-ink-secondary">→ Solución final</span>
        </div>
      ) : isGraph && graphState?.currentNodeId ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-compare/60 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
          <GitBranch className="w-3.5 h-3.5 text-ink-primary" />
          <span className="font-bold">Nodo Actual ({graphState.currentNodeId})</span>
          <span className="text-ink-secondary">→ Explorando adyacencias</span>
        </div>
      ) : isTree && treeState?.insertedNodeId ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-success/40 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-ink-primary" />
          <span className="font-bold">Nodo Insertado</span>
          <span className="text-ink-secondary">→ Estructura balanceada</span>
        </div>
      ) : isTree && treeState?.activeNodeId ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-compare/60 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
          <GitBranch className="w-3.5 h-3.5 text-ink-primary" />
          <span className="font-bold">Nodo Inspeccionado</span>
          <span className="text-ink-secondary">→ Evaluando clave</span>
        </div>
      ) : action === 'swap' ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-surface border border-ink-primary shadow-sm text-ink-primary font-mono text-xs animate-pulse">
          <ArrowLeftRight className="w-3.5 h-3.5 text-ink-primary" />
          <span className="font-bold">Intercambiando valores en memoria</span>
          <span className="text-ink-secondary">→ Mutación activa</span>
        </div>
      ) : action === 'locked' ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlighter-success/40 border border-ink-primary shadow-sm text-ink-primary font-mono text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-ink-primary" />
          <span className="font-bold">Elemento fijado</span>
          <span className="text-ink-secondary">→ Posición final</span>
        </div>
      ) : action === 'pivot' ? (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDD6FE] border border-[#7C3AED] shadow-sm text-[#7C3AED] font-mono text-xs">
          <span className="font-bold">Elemento Pivote Seleccionado</span>
          <span className="text-[#7C3AED]/80">→ Partición activa</span>
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
  );
};
