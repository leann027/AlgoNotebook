/**
 * AlgoNotebook — Cambio de Monedas (Coin Change DP) Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Demostración pedagógica del fallo de la estrategia voraz (Greedy):
 *   Para monedas [1, 3, 4] y monto 6:
 *   Greedy = 4 + 1 + 1 (3 monedas).
 *   Programación Dinámica = 3 + 3 (2 monedas, ¡solución óptima!).
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  MatrixGridAlgorithmState,
  MatrixRowHeader,
  MatrixColHeader,
  MatrixCellData,
} from '../../../core/types';

export const CANONICAL_COINS = [1, 3, 4];
export const TARGET_AMOUNT = 6;
const INF = 99;

export const COIN_ROW_HEADERS: MatrixRowHeader[] = [
  { index: 0, label: 'Ø', subLabel: 'Base' },
  { index: 1, label: '1¢', subLabel: 'c=1' },
  { index: 2, label: '3¢', subLabel: 'c=3' },
  { index: 3, label: '4¢', subLabel: 'c=4' },
];

export const COIN_COL_HEADERS: MatrixColHeader[] = [
  { index: 0, label: '0¢' },
  { index: 1, label: '1¢' },
  { index: 2, label: '2¢' },
  { index: 3, label: '3¢' },
  { index: 4, label: '4¢' },
  { index: 5, label: '5¢' },
  { index: 6, label: '6¢' },
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
  explanation: {
    stepLabel: string;
    text: string;
    subNote?: string;
  };
  metrics: {
    comparisons: number;
    swaps: number;
    passNumber: number;
  };
}

function cloneGridCells(grid: MatrixCellData[][]): MatrixCellData[][] {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

export function generateCoinChangeTrace(_initialInput?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];
  const coins = CANONICAL_COINS;
  const numRows = coins.length + 1; // 4
  const numCols = TARGET_AMOUNT + 1; // 7

  const dp: number[][] = Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => INF)
  );

  const gridCells: MatrixCellData[][] = Array.from({ length: numRows }, (_, r) =>
    Array.from({ length: numCols }, (_, c) => ({
      row: r,
      col: c,
      value: null,
      state: 'default' as const,
    }))
  );

  let comparisonsCount = 0;

  const pushFrame = (params: {
    highlightLines: { c: number[]; python: number[] };
    activeAction: ActiveAction;
    activeCell: { row: number; col: number } | null;
    dependentCells: Array<{ row: number; col: number }>;
    optimalPathCells: Array<{ row: number; col: number }>;
    currentFormula?: string;
    currentRow: number;
    currentCol: number;
    explanation: { stepLabel: string; text: string; subNote?: string };
  }) => {
    const currentCells = cloneGridCells(gridCells);

    if (params.activeCell) {
      currentCells[params.activeCell.row][params.activeCell.col].state = 'computing';
    }
    params.dependentCells.forEach((d) => {
      if (
        currentCells[d.row]?.[d.col] &&
        (!params.activeCell || params.activeCell.row !== d.row || params.activeCell.col !== d.col)
      ) {
        currentCells[d.row][d.col].state = 'dependent';
      }
    });
    params.optimalPathCells.forEach((opt) => {
      if (currentCells[opt.row]?.[opt.col]) {
        currentCells[opt.row][opt.col].state = 'optimal';
      }
    });

    rawFrames.push({
      highlightLines: params.highlightLines,
      arrayState: currentCells.map((row) =>
        row[params.currentCol]?.value !== null ? Number(row[params.currentCol].value) : 0
      ),
      elementStates: {},
      pointers: {
        i: params.currentRow,
        amount: params.currentCol,
      },
      activeAction: params.activeAction,
      matrixState: {
        cells: currentCells,
        numRows,
        numCols,
        activeCell: params.activeCell,
        dependentCells: params.dependentCells,
        optimalPathCells: params.optimalPathCells,
        currentFormula: params.currentFormula,
        rowHeaders: COIN_ROW_HEADERS,
        colHeaders: COIN_COL_HEADERS,
      },
      explanation: params.explanation,
      metrics: {
        comparisons: comparisonsCount,
        swaps: 0,
        passNumber: params.currentRow,
      },
    });
  };

  // 1. Inicio
  pushFrame({
    highlightLines: { c: [11, 12], python: [1, 2] },
    activeAction: 'idle',
    activeCell: null,
    dependentCells: [],
    optimalPathCells: [],
    currentFormula: 'CoinChange(monedas=[1, 3, 4], monto=6)',
    currentRow: 0,
    currentCol: 0,
    explanation: {
      stepLabel: 'Inicio — Problema del Cambio Mínimo de Monedas',
      text: 'Se busca formar el monto objetivo de 6¢ con la mínima cantidad de monedas posibles entre [1¢, 3¢, 4¢].',
      subNote: 'La estrategia voraz tomaría 4¢ + 1¢ + 1¢ = 3 monedas. Veremos cómo DP encuentra la combinación óptima de 2 monedas.',
    },
  });

  // 2. Base: monto 0 requiere 0 monedas
  for (let r = 0; r < numRows; r++) {
    dp[r][0] = 0;
    gridCells[r][0] = { row: r, col: 0, value: 0, state: 'computed' };
  }
  // Base fila 0: con 0 monedas, montos > 0 son imposibles (inf)
  for (let c = 1; c < numCols; c++) {
    dp[0][c] = INF;
    gridCells[0][c] = { row: 0, col: c, value: '∞', state: 'computed' };
  }

  pushFrame({
    highlightLines: { c: [13, 14, 15], python: [2, 3] },
    activeAction: 'idle',
    activeCell: null,
    dependentCells: [],
    optimalPathCells: [],
    currentFormula: 'dp[i][0] = 0, dp[0][j] = ∞ (Base)',
    currentRow: 0,
    currentCol: 0,
    explanation: {
      stepLabel: 'Inicialización de Casos Base',
      text: 'Para monto 0¢ se requieren 0 monedas (columna 0 en 0). Con 0 tipos de moneda disponibles, formar cualquier monto > 0¢ es imposible (fila 0 en ∞).',
      subNote: 'Caso base establecido en la tabla de tabulación bidimensional.',
    },
  });

  // 3. Tabulación
  for (let i = 1; i <= coins.length; i++) {
    const coin = coins[i - 1];
    for (let j = 1; j <= TARGET_AMOUNT; j++) {
      comparisonsCount++;
      const excludeVal = dp[i - 1][j];

      if (j < coin) {
        dp[i][j] = excludeVal;
        gridCells[i][j] = {
          row: i,
          col: j,
          value: dp[i][j] >= INF ? '∞' : dp[i][j],
          state: 'computed',
        };

        pushFrame({
          highlightLines: { c: [20, 21], python: [5, 6] },
          activeAction: 'compare',
          activeCell: { row: i, col: j },
          dependentCells: [{ row: i - 1, col: j }],
          optimalPathCells: [],
          currentFormula: `monto ${j}¢ < moneda ${coin}¢ ⟹ dp[${i}][${j}] = dp[${i - 1}][${j}] = ${excludeVal >= INF ? '∞' : excludeVal}`,
          currentRow: i,
          currentCol: j,
          explanation: {
            stepLabel: `Celda dp[${i}][${j}]: Moneda ${coin}¢ supera el monto ${j}¢`,
            text: `El monto ${j}¢ es menor que la moneda actual (${coin}¢). No es posible usar esta moneda; se hereda el valor de la fila superior: ${excludeVal >= INF ? '∞' : excludeVal}.`,
            subNote: `dp[${i}][${j}] = dp[${i - 1}][${j}].`,
          },
        });
      } else {
        const includeVal = dp[i][j - coin] + 1;
        const chosenVal = Math.min(excludeVal, includeVal);
        dp[i][j] = chosenVal;
        gridCells[i][j] = {
          row: i,
          col: j,
          value: chosenVal >= INF ? '∞' : chosenVal,
          state: 'computed',
        };

        pushFrame({
          highlightLines: { c: [21, 22, 23], python: [7, 8] },
          activeAction: 'swap',
          activeCell: { row: i, col: j },
          dependentCells: [
            { row: i - 1, col: j },
            { row: i, col: j - coin },
          ],
          optimalPathCells: [],
          currentFormula: `dp[${i}][${j}] = min(arriba:${excludeVal >= INF ? '∞' : excludeVal}, 1 + dp[${i}][${j - coin}]:${includeVal}) = ${chosenVal}`,
          currentRow: i,
          currentCol: j,
          explanation: {
            stepLabel: `Evaluando dp[${i}][${j}]: Monto ${j}¢ con moneda ${coin}¢`,
            text: `Comparando: excluir moneda ${coin}¢ cuesta ${excludeVal >= INF ? '∞' : excludeVal} monedas vs incluirla cuesta 1 + dp[${i}][${j - coin}] = ${includeVal} monedas. Mínimo elegido: ${chosenVal}.`,
            subNote: includeVal < excludeVal ? `¡Mejora encontrada usando la moneda de ${coin}¢!` : 'Se mantiene el óptimo previo.',
          },
        });
      }
    }
  }

  // 4. Reconstrucción de la solución óptima (Backtracking)
  const optimalCells: Array<{ row: number; col: number }> = [];
  const chosenCoins: number[] = [];
  let curI = coins.length;
  let curJ = TARGET_AMOUNT;

  while (curI > 0 && curJ > 0) {
    optimalCells.push({ row: curI, col: curJ });
    const coin = coins[curI - 1];

    if (curJ >= coin && dp[curI][curJ] === dp[curI][curJ - coin] + 1) {
      chosenCoins.push(coin);
      curJ -= coin;
    } else {
      curI -= 1;
    }
  }
  optimalCells.push({ row: curI, col: 0 });

  optimalCells.forEach((opt) => {
    if (gridCells[opt.row]?.[opt.col]) {
      gridCells[opt.row][opt.col].state = 'optimal';
    }
  });

  // 5. Fotograma final consolidado
  const optimalResult = dp[coins.length][TARGET_AMOUNT];
  pushFrame({
    highlightLines: { c: [26], python: [10] },
    activeAction: 'locked',
    activeCell: null,
    dependentCells: [],
    optimalPathCells: [...optimalCells],
    currentFormula: `Monto 6¢ = 3¢ + 3¢  (${optimalResult} Monedas Óptimas) vs Greedy = 4¢ + 1¢ + 1¢ (3 Monedas)`,
    currentRow: coins.length,
    currentCol: TARGET_AMOUNT,
    explanation: {
      stepLabel: 'Solución Óptima Confirmada — Victoria de Programación Dinámica',
      text: `¡Monto 6¢ alcanzado con exactamente ${optimalResult} monedas: [${chosenCoins.join('¢, ')}¢]! La estrategia voraz requería 3 monedas (4+1+1), mientras que DP descubrió la combinación óptima de 2 monedas (3+3).`,
      subNote: 'Camino óptimo resaltado en verde menta en la matriz de tabulación.',
    },
  });

  const totalSteps = rawFrames.length;
  return rawFrames.map((frame, index) => ({
    stepIndex: index + 1,
    totalSteps,
    highlightLines: frame.highlightLines,
    arrayState: frame.arrayState,
    elementStates: frame.elementStates,
    pointers: frame.pointers,
    activeAction: frame.activeAction,
    matrixState: frame.matrixState,
    explanation: {
      stepLabel: `Paso ${index + 1} de ${totalSteps}:`,
      text: frame.explanation.text,
      subNote: frame.explanation.subNote,
    },
    metrics: {
      comparisons: frame.metrics.comparisons,
      swaps: frame.metrics.swaps,
      passNumber: frame.metrics.passNumber,
      totalPasses: coins.length,
      maxComparisons: coins.length * TARGET_AMOUNT,
    },
  }));
}
