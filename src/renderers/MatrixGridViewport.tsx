import React, { useMemo } from 'react';
import {
  Calculator,
  CheckCircle2,
  Package,
  ArrowLeft,
  ArrowUp,
  ArrowUpLeft,
  Table2,
} from 'lucide-react';
import { FormattedMathText } from '../components/common/FormattedMathText';
import type {
  MatrixGridAlgorithmState,
  ActiveAction,
  MatrixCellData,
  MatrixRowHeader,
  MatrixColHeader,
} from '../core/types';

export interface MatrixGridViewportProps {
  matrixState?: MatrixGridAlgorithmState;
  activeAction?: ActiveAction;
  className?: string;
}

/**
 * MatrixGridViewport
 *
 * Lienzo interactivo para matrices bidimensionales y Programación Dinámica (DP)
 * con estética de cuaderno de cálculo técnico de ingeniería.
 *
 * Características:
 * - Textura y bordes de papel técnico con rejilla táctil.
 * - Barra superior de recurrencia activa y estado de evaluación.
 * - Tabla con encabezados adhesivos (sticky) para navegación fluida.
 * - Celdas con tamaño uniforme (mínimo 44x44px) y estados semánticos:
 *   * computing: celda en evaluación (amarillo pastel, aro pulsante).
 *   * dependent: celdas de las que depende el cálculo (lavanda, borde punteado, flechas de referencia).
 *   * optimal: ruta de reconstrucción de la solución óptima (verde menta, badge check).
 *   * computed: celdas con valores ya consolidados.
 *   * default: celdas aún no calculadas (muestra em-dash '—').
 * - Bandeja inferior táctil estilo post-it para reconstrucción de ítems seleccionados.
 */
export const MatrixGridViewport: React.FC<MatrixGridViewportProps> = ({
  matrixState,
  activeAction: _activeAction,
  className = '',
}) => {
  const cells = matrixState?.cells ?? [];
  const numRows = matrixState?.numRows ?? cells.length;
  const numCols = matrixState?.numCols ?? (cells[0]?.length ?? 0);

  const activeCell = matrixState?.activeCell;
  const rowHeadersProp = matrixState?.rowHeaders;
  const colHeadersProp = matrixState?.colHeaders;
  const optimalPathCellsProp = matrixState?.optimalPathCells;
  const dependentCellsProp = matrixState?.dependentCells;

  const dependentCells = useMemo(
    () => dependentCellsProp ?? [],
    [dependentCellsProp]
  );
  const optimalPathCells = useMemo(
    () => optimalPathCellsProp ?? [],
    [optimalPathCellsProp]
  );
  const reconstructedItems = matrixState?.reconstructedItems;

  // Encabezados normalizados de filas
  const rowHeaders: MatrixRowHeader[] = useMemo(() => {
    if (rowHeadersProp && rowHeadersProp.length >= numRows && numRows > 0) {
      return rowHeadersProp;
    }
    const result: MatrixRowHeader[] = [];
    for (let r = 0; r < numRows; r++) {
      const existing = rowHeadersProp?.[r];
      if (existing) {
        result.push(existing);
      } else {
        result.push({
          index: r,
          label: r === 0 ? 'Ø (Base)' : `Item ${r}`,
          subLabel: r === 0 ? 'w=0, v=0' : undefined,
        });
      }
    }
    return result;
  }, [rowHeadersProp, numRows]);

  // Encabezados normalizados de columnas
  const colHeaders: MatrixColHeader[] = useMemo(() => {
    if (colHeadersProp && colHeadersProp.length >= numCols && numCols > 0) {
      return colHeadersProp;
    }
    const result: MatrixColHeader[] = [];
    for (let c = 0; c < numCols; c++) {
      const existing = colHeadersProp?.[c];
      if (existing) {
        result.push(existing);
      } else {
        result.push({
          index: c,
          label: `w = ${c}`,
        });
      }
    }
    return result;
  }, [colHeadersProp, numCols]);

  // Obtiene los datos seguros de una celda
  const getCellData = (r: number, c: number): MatrixCellData => {
    const row = cells[r];
    if (row && row[c]) {
      return row[c];
    }
    return {
      row: r,
      col: c,
      value: null,
      state: 'default',
    };
  };

  // Determina el estado semántico prioritario de la celda
  const getCellEffectiveState = (
    cell: MatrixCellData,
    r: number,
    c: number
  ): 'computing' | 'dependent' | 'optimal' | 'computed' | 'default' => {
    if (activeCell && activeCell.row === r && activeCell.col === c) {
      return 'computing';
    }
    if (optimalPathCells.some((p) => p.row === r && p.col === c)) {
      return 'optimal';
    }
    if (dependentCells.some((d) => d.row === r && d.col === c)) {
      return 'dependent';
    }
    if (cell.state) {
      return cell.state;
    }
    if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
      return 'computed';
    }
    return 'default';
  };

  // Información direccional de dependencia relativa a activeCell
  const getDependencyInfo = (r: number, c: number) => {
    if (!activeCell) return null;
    const isAbove = r < activeCell.row;
    const isLeft = c < activeCell.col;
    const isSameCol = c === activeCell.col;
    const isSameRow = r === activeCell.row;

    // 1. Izquierda (← inserción): misma fila r == activeCell.row, columna c < activeCell.col
    if (isSameRow && isLeft) {
      return {
        type: 'insertion',
        label: 'Inserción',
        tooltip: `dp[${r}][${c}]: Inserción / Dependencia izquierda (←)`,
        icon: 'left' as const,
      };
    }

    // 2. Superior (↑ eliminación): misma columna c == activeCell.col, fila r < activeCell.row
    if (isAbove && isSameCol) {
      return {
        type: 'deletion',
        label: 'Eliminación',
        tooltip: `dp[${r}][${c}]: Eliminación / Excluir (↑)`,
        icon: 'top' as const,
      };
    }

    // 3. Diagonal (↖ coincidencia / sustitución / incluir): r < activeCell.row && c < activeCell.col
    if (isAbove && isLeft) {
      return {
        type: 'diagonal',
        label: 'Diagonal',
        tooltip: `dp[${r}][${c}]: Coincidencia / Sustitución / Incluir (↖)`,
        icon: 'diagonal' as const,
      };
    }

    return {
      type: 'ref',
      label: 'Ref',
      tooltip: `dp[${r}][${c}]: Celda referenciada`,
      icon: 'ref' as const,
    };
  };

  // Cálculo de totales para la bandeja de reconstrucción
  const reconstructionSummary = useMemo(() => {
    if (!reconstructedItems) return null;
    const totalWeight = reconstructedItems.reduce((acc, it) => acc + (it.weight ?? 0), 0);
    const totalValue = reconstructedItems.reduce((acc, it) => acc + (it.value ?? 0), 0);
    const capacityDisplay = matrixState?.capacity ?? totalWeight;
    return {
      totalWeight,
      totalValue,
      capacityDisplay,
    };
  }, [reconstructedItems, matrixState?.capacity]);

  const isEmpty = !matrixState || numRows === 0 || numCols === 0;

  return (
    <div
      className={`relative w-full h-full flex flex-col gap-3 select-none ${className}`}
      aria-label="Visualizador de Matriz de Programación Dinámica"
    >
      {/* 1. TÍTULO SUPERIOR DE FÓRMULA / ESTADO TÉCNICO */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-paper-surface rounded-lg border border-paper-border shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-ink-secondary uppercase whitespace-nowrap">
            <Calculator className="w-3.5 h-3.5 text-ink-primary" />
            <span>Recurrencia:</span>
          </span>
          <div className="inline-flex items-center px-2.5 py-1 rounded bg-surface-container-low border border-paper-border font-mono text-xs font-bold text-ink-primary shadow-xs">
            <FormattedMathText
              text={(() => {
                const raw = matrixState?.currentFormula || 'dp[i][w] = \\max(dp[i-1][w], dp[i-1][w - wt] + val)';
                return raw.includes('$') ? raw : `$${raw}$`;
              })()}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeCell && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-highlighter-compare border border-ink-primary font-mono text-xs font-bold text-ink-primary shadow-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-ink-primary" />
              <span>
                Calculando: dp[{activeCell.row}][{activeCell.col}]
              </span>
            </span>
          )}

          {!activeCell && optimalPathCells.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-highlighter-success border border-ink-primary font-mono text-xs font-bold text-ink-primary shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-ink-primary" />
              <span>Ruta Óptima Trazada</span>
            </span>
          )}

          {matrixState?.capacity !== undefined && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container-low border border-paper-border font-mono text-xs text-ink-secondary">
              W = <strong className="ml-1 text-ink-primary">{matrixState.capacity}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 2. CUADRÍCULA / TABLA DP RESPONSIVA */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-paper-border rounded-lg bg-surface-container-low/50 min-h-[300px]">
          <Table2 className="w-10 h-10 text-ink-muted mb-3" />
          <h4 className="font-mono text-sm font-bold text-ink-primary uppercase tracking-wide">
            Matriz DP no inicializada
          </h4>
          <p className="font-mono text-xs text-ink-secondary mt-1">
            Esperando inicialización de datos de la tabla...
          </p>
        </div>
      ) : (
        <div className="flex-1 w-full overflow-auto rounded-lg border border-paper-border bg-paper-surface shadow-inner max-h-[460px] relative scrollbar-thin">
          <table className="border-separate border-spacing-0 text-center font-mono text-sm min-w-full">
            {/* Encabezados superiores de columnas */}
            <thead>
              <tr>
                {/* Celda de esquina adhesiva */}
                <th
                  scope="col"
                  className="sticky top-0 left-0 z-30 bg-[#EFEEEA] border-b-2 border-r-2 border-paper-border p-2 text-xs font-bold text-ink-primary shadow-[1px_1px_0_0_#E5E0D8]"
                >
                  <div className="flex flex-col items-center justify-center text-[10px] text-ink-secondary leading-tight min-w-[70px]">
                    <span className="font-bold text-ink-primary">
                      {matrixState?.capacity !== undefined ? 'i \\ w' : 'S₁ \\ S₂'}
                    </span>
                    <span className="text-[9px] text-ink-muted">
                      {matrixState?.capacity !== undefined ? 'Item \\ Cap' : 'Fila \\ Col'}
                    </span>
                  </div>
                </th>

                {/* Columnas w = 0, 1, 2, ..., W */}
                {colHeaders.map((col, cIdx) => {
                  const isColActive = activeCell?.col === cIdx;
                  const isColDependent = dependentCells.some((d) => d.col === cIdx);
                  const isColOptimal = optimalPathCells.some((p) => p.col === cIdx);

                  return (
                    <th
                      key={col.index ?? cIdx}
                      scope="col"
                      className={`sticky top-0 z-20 border-b-2 border-paper-border p-2 text-xs font-mono font-bold transition-colors min-w-[48px] sm:min-w-[56px] text-center ${
                        isColActive
                          ? 'bg-highlighter-compare text-ink-primary border-b-ink-primary shadow-xs'
                          : isColDependent
                          ? 'bg-highlighter-pointer/70 text-ink-primary'
                          : isColOptimal
                          ? 'bg-highlighter-success/70 text-ink-primary'
                          : 'bg-[#EFEEEA] text-ink-primary'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span>{col.label}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Filas i = 0, 1, ..., n y Celdas cells[row][col] */}
            <tbody>
              {rowHeaders.map((row, rIdx) => {
                const isRowActive = activeCell?.row === rIdx;
                const isRowDependent = dependentCells.some((d) => d.row === rIdx);
                const isRowOptimal = optimalPathCells.some((p) => p.row === rIdx);

                return (
                  <tr key={row.index ?? rIdx} className="hover:bg-surface-container-low/20">
                    {/* Encabezado lateral de fila adhesivo */}
                    <th
                      scope="row"
                      className={`sticky left-0 z-10 border-r-2 border-paper-border p-2 text-xs font-mono font-bold transition-colors text-left min-w-[120px] max-w-[170px] ${
                        isRowActive
                          ? 'bg-highlighter-compare text-ink-primary border-r-ink-primary shadow-xs'
                          : isRowDependent
                          ? 'bg-highlighter-pointer/70 text-ink-primary'
                          : isRowOptimal
                          ? 'bg-highlighter-success/70 text-ink-primary'
                          : 'bg-[#EFEEEA] text-ink-primary'
                      }`}
                    >
                      <div className="flex flex-col pr-1">
                        <span className="truncate">{row.label}</span>
                        {row.subLabel && (
                          <span className="text-[10px] font-normal text-ink-secondary truncate">
                            {row.subLabel}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Celdas de la fila */}
                    {colHeaders.map((_, cIdx) => {
                      const cellData = getCellData(rIdx, cIdx);
                      const effectiveState = getCellEffectiveState(cellData, rIdx, cIdx);
                      const depInfo =
                        effectiveState === 'dependent' ? getDependencyInfo(rIdx, cIdx) : null;

                      const isComputing = effectiveState === 'computing';
                      const isDependent = effectiveState === 'dependent';
                      const isOptimal = effectiveState === 'optimal';
                      const isComputed = effectiveState === 'computed';

                      const displayValue =
                        cellData.value !== null &&
                        cellData.value !== undefined &&
                        cellData.value !== ''
                          ? cellData.value
                          : isComputing
                          ? '?'
                          : '—';

                      return (
                        <td
                          key={cIdx}
                          className="border border-paper-border p-0.5 w-12 h-12 min-w-[48px] min-h-[48px] sm:w-14 sm:h-14 sm:min-w-[56px] sm:min-h-[56px] text-center"
                        >
                          <div
                            className={`w-full h-full min-w-[44px] min-h-[44px] flex items-center justify-center relative rounded transition-all select-none ${
                              isComputing
                                ? 'bg-highlighter-compare border-2 border-ink-primary ring-4 ring-highlighter-compare/70 ring-offset-1 ring-offset-paper-surface animate-pulse z-10 shadow-md font-black text-ink-primary scale-[1.03]'
                                : isDependent
                                ? 'bg-highlighter-pointer border-2 border-dashed border-ink-primary/70 z-1 font-bold text-ink-primary'
                                : isOptimal
                                ? 'bg-highlighter-success border-2 border-ink-primary shadow-xs z-1 font-black text-ink-primary'
                                : isComputed
                                ? 'bg-paper-surface hover:bg-surface-container-low border border-paper-border/80 font-bold text-ink-primary'
                                : 'bg-surface-container-low/40 border border-paper-border/50 text-ink-muted/50 font-normal'
                            }`}
                          >
                            {/* Badges e indicadores semánticos */}
                            {isComputing && (
                              <span className="absolute top-0.5 left-1 text-[8px] font-mono font-black text-ink-primary bg-amber-300 px-0.5 rounded leading-none shadow-2xs">
                                CALC
                              </span>
                            )}

                            {isDependent && (
                              <>
                                <span className="absolute top-0.5 left-1 text-[8px] font-mono font-bold text-purple-900 bg-purple-200/90 px-0.5 rounded leading-none">
                                  REF
                                </span>
                                {depInfo?.icon === 'left' && (
                                  <span
                                    className="absolute bottom-0.5 right-1 text-purple-900"
                                    title={depInfo.tooltip}
                                  >
                                    <ArrowLeft className="w-2.5 h-2.5" />
                                  </span>
                                )}
                                {depInfo?.icon === 'top' && (
                                  <span
                                    className="absolute bottom-0.5 right-1 text-purple-900"
                                    title={depInfo.tooltip}
                                  >
                                    <ArrowUp className="w-2.5 h-2.5" />
                                  </span>
                                )}
                                {depInfo?.icon === 'diagonal' && (
                                  <span
                                    className="absolute bottom-0.5 right-1 text-purple-900"
                                    title={depInfo.tooltip}
                                  >
                                    <ArrowUpLeft className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </>
                            )}

                            {isOptimal && (
                              <span
                                className="absolute -top-1 -right-1 bg-ink-primary text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold shadow-xs ring-1 ring-white"
                                title="Camino Óptimo de Reconstrucción"
                              >
                                ✓
                              </span>
                            )}

                            {/* Valor numérico en JetBrains Mono */}
                            <span className="font-mono text-sm leading-none">
                              {displayValue}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. BANDEJA ESTILO POST-IT DE RECONSTRUCCIÓN DE ÍTEMS */}
      {reconstructionSummary && (
        <div className="relative mt-1 p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-md shadow-tactile-card overflow-hidden">
          {/* Cinta adhesiva semitransparente */}
          <div className="absolute -top-1.5 left-8 w-14 h-3.5 bg-white/70 border-x border-paper-border rotate-1 backdrop-blur-[1px]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            <div className="flex items-start sm:items-center gap-2">
              <span className="text-base select-none" role="img" aria-label="mochila">
                🎒
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-green-900">
                  Solución Óptima Reconstruida
                </span>
                <div className="font-mono text-xs text-ink-primary font-semibold mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>
                    Objetos Seleccionados:{' '}
                    <strong className="text-green-950">
                      {reconstructedItems && reconstructedItems.length > 0
                        ? `[${reconstructedItems.map((it) => `Item ${it.index}`).join(', ')}]`
                        : '[Ninguno]'}
                    </strong>
                  </span>
                  <span className="text-paper-border">|</span>
                  <span>
                    Peso Total:{' '}
                    <strong className="text-green-950">
                      {reconstructionSummary.totalWeight}/{reconstructionSummary.capacityDisplay}
                    </strong>
                  </span>
                  <span className="text-paper-border">|</span>
                  <span>
                    Valor Total:{' '}
                    <strong className="text-green-950">
                      ${reconstructionSummary.totalValue}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Etiquetas individuales de cada objeto seleccionado */}
            {reconstructedItems && reconstructedItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
                {reconstructedItems.map((it) => (
                  <span
                    key={it.index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-green-300 font-mono text-[11px] text-ink-primary shadow-2xs"
                  >
                    <Package className="w-3 h-3 text-green-700" />
                    <strong>Item {it.index}</strong>
                    <span className="text-ink-secondary text-[10px]">
                      (wt: {it.weight}, val: {it.value})
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
