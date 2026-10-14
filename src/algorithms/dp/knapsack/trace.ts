/**
 * AlgoNotebook — 0/1 Knapsack Dynamic Programming Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Dataset canónico de 4 objetos y capacidad W = 7:
 *   * Objeto 1: peso = 2, valor = 3
 *   * Objeto 2: peso = 3, valor = 4
 *   * Objeto 3: peso = 4, valor = 5
 *   * Objeto 4: peso = 5, valor = 8
 * - Matriz DP bidimensional de (N+1) x (W+1) = 5 x 8 celdas.
 * - Fase 1: Inicialización base (i=0, w=0).
 * - Fase 2: Tabulación bottom-up con celdas dependientes y fórmulas de Bellman.
 * - Fase 3: Reconstrucción por retroceso (backtracking) de la combinación óptima.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  MatrixGridAlgorithmState,
  MatrixRowHeader,
  MatrixColHeader,
  MatrixCellData,
  TraceEvent,
  TraceSnapshot,
} from '../../../core/types';

export interface KnapsackItem {
  index: number; // 1-based (1 a 4)
  id: string;
  name: string;
  weight: number;
  value: number;
}

export const CANONICAL_KNAPSACK_ITEMS: readonly KnapsackItem[] = [
  { index: 1, id: 'item-1', name: 'Objeto 1', weight: 2, value: 3 },
  { index: 2, id: 'item-2', name: 'Objeto 2', weight: 3, value: 4 },
  { index: 3, id: 'item-3', name: 'Objeto 3', weight: 4, value: 5 },
  { index: 4, id: 'item-4', name: 'Objeto 4', weight: 5, value: 8 },
];

export const CANONICAL_CAPACITY = 7;
export const NUM_ITEMS = 4;
export const NUM_ROWS = NUM_ITEMS + 1; // 5 filas (0 a 4)
export const NUM_COLS = CANONICAL_CAPACITY + 1; // 8 columnas (0 a 7)

export const KNAPSACK_ROW_HEADERS: readonly MatrixRowHeader[] = [
  { index: 0, label: 'i = 0', subLabel: '∅ (Base)' },
  { index: 1, label: 'i = 1', subLabel: 'Obj 1 (p:2, v:3)' },
  { index: 2, label: 'i = 2', subLabel: 'Obj 2 (p:3, v:4)' },
  { index: 3, label: 'i = 3', subLabel: 'Obj 3 (p:4, v:5)' },
  { index: 4, label: 'i = 4', subLabel: 'Obj 4 (p:5, v:8)' },
];

export const KNAPSACK_COL_HEADERS: readonly MatrixColHeader[] = [
  { index: 0, label: 'w = 0' },
  { index: 1, label: 'w = 1' },
  { index: 2, label: 'w = 2' },
  { index: 3, label: 'w = 3' },
  { index: 4, label: 'w = 4' },
  { index: 5, label: 'w = 5' },
  { index: 6, label: 'w = 6' },
  { index: 7, label: 'w = 7' },
];

interface RawFrame {
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  matrixState: MatrixGridAlgorithmState;
  comparison?: {
    leftIndex: number;
    rightIndex: number;
    leftValue: number;
    rightValue: number;
    conditionMet: boolean;
  };
  explanation: {
    stepLabel: string;
    text: string;
    subNote?: string;
  };
  metrics: {
    comparisons: number;
    swaps: number;
    passNumber: number;
    totalPasses?: number;
    maxComparisons?: number;
  };
  event?: TraceEvent;
  snapshot?: TraceSnapshot;
}

/**
 * Clona profundamente la cuadrícula de celdas para garantizar inmutabilidad.
 */
function cloneGridCells(grid: MatrixCellData[][]): MatrixCellData[][] {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

/**
 * Generador puro y síncrono de fotogramas de ejecución para la Mochila 0/1 (Knapsack DP).
 *
 * @param _initialInput Parámetro opcional para cumplir con la interfaz AlgorithmDefinition.
 * @returns Lista inmutable de fotogramas paso a paso (TraceFrame[]).
 */
export function generateKnapsackTrace(_initialInput?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];
  const W = CANONICAL_CAPACITY;
  const n = NUM_ITEMS;

  // 1. Matriz de valores numéricos dp[n+1][W+1]
  const dp: number[][] = Array.from({ length: NUM_ROWS }, () =>
    Array.from({ length: NUM_COLS }, () => 0)
  );

  // 2. Estado visual de la cuadrícula de celdas (inicialmente todas en null)
  const gridCells: MatrixCellData[][] = Array.from({ length: NUM_ROWS }, (_, r) =>
    Array.from({ length: NUM_COLS }, (_, c) => ({
      row: r,
      col: c,
      value: null,
      state: 'default' as const,
    }))
  );

  let computedCellsCount = 0;
  let maxValAchieved = 0;

  // Función auxiliar inmutable para registrar fotogramas
  const pushFrame = (params: {
    highlightLines: { c: number[]; python: number[] };
    activeAction: ActiveAction;
    activeCell?: { row: number; col: number } | null;
    dependentCells?: Array<{ row: number; col: number }>;
    optimalPathCells?: Array<{ row: number; col: number }>;
    reconstructedItems?: Array<{ index: number; weight: number; value: number }>;
    currentFormula?: string;
    currentRow: number;
    currentCapacity?: number;
    comparison?: {
      leftIndex: number;
      rightIndex: number;
      leftValue: number;
      rightValue: number;
      conditionMet: boolean;
    };
    explanation: {
      stepLabel: string;
      text: string;
      subNote?: string;
    };
    event?: TraceEvent;
  }) => {
    const clonedCells = cloneGridCells(gridCells);

    // Aplicar estados temporales de animación a las celdas del snapshot
    if (params.dependentCells) {
      for (const dep of params.dependentCells) {
        if (clonedCells[dep.row]?.[dep.col]) {
          clonedCells[dep.row][dep.col].state = 'dependent';
        }
      }
    }

    if (params.activeCell) {
      const act = params.activeCell;
      if (clonedCells[act.row]?.[act.col]) {
        clonedCells[act.row][act.col].state = 'computing';
      }
    }

    if (params.optimalPathCells) {
      for (const opt of params.optimalPathCells) {
        if (clonedCells[opt.row]?.[opt.col]) {
          clonedCells[opt.row][opt.col].state = 'optimal';
        }
      }
    }

    const currentMatrixState: MatrixGridAlgorithmState = {
      numRows: NUM_ROWS,
      numCols: NUM_COLS,
      rowHeaders: [...KNAPSACK_ROW_HEADERS],
      colHeaders: [...KNAPSACK_COL_HEADERS],
      cells: clonedCells,
      activeCell: params.activeCell ? { ...params.activeCell } : null,
      dependentCells: params.dependentCells?.map((c) => ({ ...c })) ?? [],
      optimalPathCells: params.optimalPathCells?.map((c) => ({ ...c })) ?? [],
      reconstructedItems: params.reconstructedItems?.map((it) => ({ ...it })) ?? [],
      capacity: W,
      currentFormula: params.currentFormula,
    };

    // Arreglo representativo de la fila actual para compatibilidad con renderers lineales
    const arrayState = dp[params.currentRow].slice();

    const pointers: Record<string, number> = {
      i: params.currentRow,
    };
    if (params.currentCapacity !== undefined) {
      pointers['w'] = params.currentCapacity;
    }

    const elementStates: Record<number, ElementState> = {};
    if (params.currentCapacity !== undefined) {
      elementStates[params.currentCapacity] =
        params.activeAction === 'swap'
          ? 'swapping'
          : params.activeAction === 'locked'
          ? 'sorted'
          : 'comparing';
    }

    rawFrames.push({
      highlightLines: params.highlightLines,
      arrayState,
      elementStates,
      pointers,
      activeAction: params.activeAction,
      matrixState: currentMatrixState,
      comparison: params.comparison,
      explanation: params.explanation,
      metrics: {
        comparisons: computedCellsCount,
        swaps: maxValAchieved,
        passNumber: params.currentRow,
        totalPasses: NUM_ITEMS,
        maxComparisons: NUM_ITEMS * NUM_COLS,
      },
      event: params.event,
    });
  };

  // ==========================================================================
  // PASO 1: Inicialización de Caso Base (Fila 0 y Columna 0 en 0)
  // ==========================================================================
  for (let w = 0; w <= W; w++) {
    dp[0][w] = 0;
    gridCells[0][w] = {
      row: 0,
      col: w,
      value: 0,
      state: 'computed',
    };
  }

  pushFrame({
    highlightLines: {
      c: [8, 9, 10, 11],
      python: [2],
    },
    activeAction: 'idle',
    activeCell: null,
    dependentCells: [],
    optimalPathCells: [],
    reconstructedItems: [],
    currentFormula: 'dp[0][w] = 0 \\quad (\\forall w \\in [0, 7])',
    currentRow: 0,
    currentCapacity: 0,
    explanation: {
      stepLabel: 'Inicialización de Caso Base (Fila i = 0)',
      text: 'Se inicializa la fila 0 en 0. Al considerar 0 objetos disponibles (i=0), el valor máximo acumulable para cualquier capacidad de mochila (w = 0..7) es estrictamente 0.',
      subNote: 'Dimensiones de la tabla: 5 filas (objetos 0 a 4) × 8 columnas (capacidades 0 a 7).',
    },
    event: { type: 'idle' },
  });

  // ==========================================================================
  // PASO 2: Tabulación Dinámica Bottom-Up (i = 1..4, w = 0..7)
  // ==========================================================================
  for (let i = 1; i <= n; i++) {
    const item = CANONICAL_KNAPSACK_ITEMS[i - 1];
    const itemWt = item.weight;
    const itemVal = item.value;

    for (let w = 0; w <= W; w++) {
      computedCellsCount++;

      if (itemWt <= w) {
        // El objeto cabe en la capacidad w
        const withoutVal = dp[i - 1][w];
        const withVal = itemVal + dp[i - 1][w - itemWt];
        const bestVal = Math.max(withoutVal, withVal);
        const included = withVal > withoutVal;

        dp[i][w] = bestVal;
        gridCells[i][w] = {
          row: i,
          col: w,
          value: bestVal,
          state: 'computed',
        };

        if (bestVal > maxValAchieved) {
          maxValAchieved = bestVal;
        }

        const formulaStr = `\\max(dp[${i - 1}][${w}], dp[${i - 1}][${w - itemWt}] + ${itemVal}) = \\max(${withoutVal}, ${dp[i - 1][w - itemWt]} + ${itemVal}) = ${bestVal}`;

        pushFrame({
          highlightLines: {
            c: [12, 13, 14],
            python: [6, 7, 8, 9, 10],
          },
          activeAction: included ? 'swap' : 'compare',
          activeCell: { row: i, col: w },
          dependentCells: [
            { row: i - 1, col: w },
            { row: i - 1, col: w - itemWt },
          ],
          optimalPathCells: [],
          reconstructedItems: [],
          currentFormula: formulaStr,
          currentRow: i,
          currentCapacity: w,
          comparison: {
            leftIndex: w - itemWt,
            rightIndex: w,
            leftValue: withVal,
            rightValue: withoutVal,
            conditionMet: included,
          },
          explanation: {
            stepLabel: `Paso (i=${i}, w=${w}): Decisión ${item.name} (p:${itemWt}, v:${itemVal})`,
            text: included
              ? `¡Conviene incluir ${item.name}! Al seleccionarlo se obtiene un valor de ${withVal} (valor ${itemVal} + dp[${i - 1}][${w - itemWt}]=${dp[i - 1][w - itemWt]}), superior a no incluirlo (${withoutVal}). Asignamos dp[${i}][${w}] = ${bestVal}.`
              : `No conviene incluir ${item.name}. Conservar la solución previa (${withoutVal}) es ${withVal === withoutVal ? 'igual o ' : ''}superior a incluir este objeto (${withVal}). Asignamos dp[${i}][${w}] = ${bestVal}.`,
            subNote: `Ecuación de Bellman: max(dp[${i - 1}][${w}], dp[${i - 1}][${w - itemWt}] + ${itemVal}) = max(${withoutVal}, ${withVal}) = ${bestVal}.`,
          },
          event: {
            type: 'compare',
            leftIndex: w - itemWt,
            rightIndex: w,
            leftValue: withVal,
            rightValue: withoutVal,
            conditionMet: included,
          },
        });
      } else {
        // El objeto no cabe en la capacidad w
        const inheritedVal = dp[i - 1][w];
        dp[i][w] = inheritedVal;
        gridCells[i][w] = {
          row: i,
          col: w,
          value: inheritedVal,
          state: 'computed',
        };

        const formulaStr = `wt[${i - 1}]=${itemWt} > w=${w} \\implies dp[${i}][${w}] = dp[${i - 1}][${w}] = ${inheritedVal}`;

        pushFrame({
          highlightLines: {
            c: [15, 16],
            python: [11, 12],
          },
          activeAction: 'compare',
          activeCell: { row: i, col: w },
          dependentCells: [{ row: i - 1, col: w }],
          optimalPathCells: [],
          reconstructedItems: [],
          currentFormula: formulaStr,
          currentRow: i,
          currentCapacity: w,
          comparison: {
            leftIndex: w,
            rightIndex: w,
            leftValue: itemWt,
            rightValue: w,
            conditionMet: false,
          },
          explanation: {
            stepLabel: `Paso (i=${i}, w=${w}): ${item.name} Excede Capacidad`,
            text: `El peso de ${item.name} (${itemWt}) excede la capacidad disponible de la mochila (${w}). No es posible incluirlo; hereda directamente el valor de la fila previa: dp[${i - 1}][${w}] = ${inheritedVal}.`,
            subNote: `Sin espacio para este objeto: dp[${i}][${w}] = dp[${i - 1}][${w}] = ${inheritedVal}.`,
          },
          event: {
            type: 'compare',
            leftIndex: w,
            rightIndex: w,
            leftValue: itemWt,
            rightValue: w,
            conditionMet: false,
          },
        });
      }
    }
  }

  // ==========================================================================
  // PASO 3: Tabla Completa y Preparación para Backtracking
  // ==========================================================================
  pushFrame({
    highlightLines: {
      c: [22, 23],
      python: [15, 16],
    },
    activeAction: 'locked',
    activeCell: { row: n, col: W },
    dependentCells: [],
    optimalPathCells: [{ row: n, col: W }],
    reconstructedItems: [],
    currentFormula: `dp[${n}][${W}] = ${dp[n][W]} \\quad (\\text{Valor Máximo Global Encontrado})`,
    currentRow: n,
    currentCapacity: W,
    explanation: {
      stepLabel: 'Llenado de Tabla Completo — Inicio de Backtracking',
      text: `Se han calculado las 32 celdas de la tabla. El valor máximo posible con capacidad W=7 es dp[4][7] = ${dp[n][W]}. Iniciamos la fase de reconstrucción hacia atrás (backtracking) para identificar los objetos exactos seleccionados.`,
      subNote: 'Rastreamos desde dp[4][7] hacia la fila 0 para determinar qué transiciones aportaron valor.',
    },
    event: {
      type: 'locked',
      index: W,
      value: dp[n][W],
    },
  });

  // ==========================================================================
  // PASO 4: Fase de Reconstrucción de Ítems Óptimos (Backtracking)
  // ==========================================================================
  let currW = W;
  let currRes = dp[n][W];
  const optimalPath: Array<{ row: number; col: number }> = [{ row: n, col: W }];
  const reconstructedItems: Array<{ index: number; weight: number; value: number }> = [];

  for (let i = n; i > 0 && currRes > 0; i--) {
    const item = CANONICAL_KNAPSACK_ITEMS[i - 1];
    const prevRowVal = dp[i - 1][currW];
    const currentVal = dp[i][currW];

    if (currentVal !== prevRowVal) {
      // El objeto i fue incluido en la solución
      reconstructedItems.unshift({
        index: i,
        weight: item.weight,
        value: item.value,
      });

      currRes -= item.value;
      currW -= item.weight;
      optimalPath.push({ row: i - 1, col: currW });

      pushFrame({
        highlightLines: {
          c: [25, 27, 28],
          python: [18, 19, 20],
        },
        activeAction: 'locked',
        activeCell: { row: i, col: currW + item.weight },
        dependentCells: [{ row: i - 1, col: currW }],
        optimalPathCells: [...optimalPath],
        reconstructedItems: [...reconstructedItems],
        currentFormula: `dp[${i}][${currW + item.weight}]=${currentVal} ≠ dp[${i - 1}][${currW + item.weight}]=${prevRowVal} ⟹ ${item.name} INCLUIDO (w ← ${currW})`,
        currentRow: i,
        currentCapacity: currW,
        explanation: {
          stepLabel: `Backtracking: ${item.name} Incluido en Solución`,
          text: `dp[${i}][${currW + item.weight}] (${currentVal}) ≠ dp[${i - 1}][${currW + item.weight}] (${prevRowVal}): El valor cambió al considerar ${item.name}. Por lo tanto, forma parte de la mochila óptima (peso: ${item.weight}, valor: ${item.value}). Restamos su peso: nueva capacidad disponible = ${currW}.`,
          subNote: `Objetos seleccionados hasta ahora: ${reconstructedItems.map((it) => `Obj ${it.index}`).join(', ')} | Capacidad restante: ${currW}.`,
        },
        event: {
          type: 'locked',
          index: currW,
          value: item.value,
        },
      });
    } else {
      // El objeto i no fue incluido
      optimalPath.push({ row: i - 1, col: currW });

      pushFrame({
        highlightLines: {
          c: [24, 25],
          python: [17, 18],
        },
        activeAction: 'compare',
        activeCell: { row: i, col: currW },
        dependentCells: [{ row: i - 1, col: currW }],
        optimalPathCells: [...optimalPath],
        reconstructedItems: [...reconstructedItems],
        currentFormula: `dp[${i}][${currW}]=${currentVal} == dp[${i - 1}][${currW}]=${prevRowVal} ⟹ ${item.name} NO incluido (w = ${currW})`,
        currentRow: i,
        currentCapacity: currW,
        explanation: {
          stepLabel: `Backtracking: ${item.name} Omitido`,
          text: `dp[${i}][${currW}] (${currentVal}) == dp[${i - 1}][${currW}] (${prevRowVal}): El valor es idéntico a la fila anterior. ${item.name} no fue seleccionado para esta capacidad. El peso disponible permanece en ${currW}.`,
          subNote: `Avanzamos a la fila superior sin alterar la capacidad restante: w = ${currW}.`,
        },
        event: {
          type: 'compare',
          leftIndex: currW,
          rightIndex: currW,
          leftValue: currentVal,
          rightValue: prevRowVal,
          conditionMet: false,
        },
      });
    }
  }

  // ==========================================================================
  // PASO 5: Fotograma Final — Solución Óptima Confirmada
  // ==========================================================================
  const totalOptimalWeight = reconstructedItems.reduce((acc, it) => acc + it.weight, 0);
  const totalOptimalValue = reconstructedItems.reduce((acc, it) => acc + it.value, 0);

  pushFrame({
    highlightLines: {
      c: [32],
      python: [22],
    },
    activeAction: 'locked',
    activeCell: null,
    dependentCells: [],
    optimalPathCells: [...optimalPath],
    reconstructedItems: [...reconstructedItems],
    currentFormula: `Óptimo: { Obj 1 (p:2, v:3), Obj 4 (p:5, v:8) } ⟹ Peso=${totalOptimalWeight}/${W}, Valor=$${totalOptimalValue}`,
    currentRow: 0,
    currentCapacity: 0,
    explanation: {
      stepLabel: `Solución Óptima Final: Valor ${totalOptimalValue}`,
      text: `Mochila 0/1 resuelta exitosamente. Los objetos seleccionados son ${reconstructedItems.map((it) => `Objeto ${it.index} (peso ${it.weight}, valor ${it.value})`).join(' y ')}. Peso total exacto = ${totalOptimalWeight} / ${W} (100% capacidad), Valor total acumulado = ${totalOptimalValue}.`,
      subNote: 'El rastro en verde menta destaca el camino óptimo de decisiones reconstruido desde dp[4][7] hasta la base.',
    },
    event: {
      type: 'locked',
      index: 0,
      value: totalOptimalValue,
    },
  });

  // Numeración exacta y estricta de pasos
  const totalSteps = rawFrames.length;

  return rawFrames.map((frame, index) => {
    const stepIndex = index + 1;
    return {
      ...frame,
      stepIndex,
      totalSteps,
      explanation: {
        stepLabel: `Paso ${stepIndex} de ${totalSteps}: ${frame.explanation.stepLabel}`,
        text: frame.explanation.text,
        subNote: frame.explanation.subNote,
      },
    };
  });
}

