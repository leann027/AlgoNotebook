/**
 * AlgoNotebook — Levenshtein Distance Pure Trace Generator
 *
 * Traza completa paso a paso de Programación Dinámica Matricial bidimensional.
 * Cadenas canónicas:
 * - S1 = "KITTEN" (M = 6)
 * - S2 = "SITTING" (N = 7)
 * Matriz DP de (M+1) x (N+1) = 7 x 8 celdas.
 *
 * Fases:
 * 1. Inicialización de casos base en fila 0 y columna 0.
 * 2. Tabulación ascendente celda por celda con dependencias (diagonal, arriba, izquierda).
 * 3. Reconstrucción por retroceso (backtracking) del camino de edición óptimo.
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

export const CANONICAL_LEV_S1 = 'KITTEN';
export const CANONICAL_LEV_S2 = 'SITTING';

export const LEV_NUM_ROWS = CANONICAL_LEV_S1.length + 1; // 7
export const LEV_NUM_COLS = CANONICAL_LEV_S2.length + 1; // 8

export const LEV_ROW_HEADERS: readonly MatrixRowHeader[] = [
  { index: 0, label: 'Ø', subLabel: 'Base (i=0)' },
  { index: 1, label: 'K', subLabel: 'S1[0]' },
  { index: 2, label: 'I', subLabel: 'S1[1]' },
  { index: 3, label: 'T', subLabel: 'S1[2]' },
  { index: 4, label: 'T', subLabel: 'S1[3]' },
  { index: 5, label: 'E', subLabel: 'S1[4]' },
  { index: 6, label: 'N', subLabel: 'S1[5]' },
];

export const LEV_COL_HEADERS: readonly MatrixColHeader[] = [
  { index: 0, label: 'Ø' },
  { index: 1, label: 'S' },
  { index: 2, label: 'I' },
  { index: 3, label: 'T' },
  { index: 4, label: 'T' },
  { index: 5, label: 'I' },
  { index: 6, label: 'N' },
  { index: 7, label: 'G' },
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
  return grid.map((row) => row.map((c) => ({ ...c })));
}

function initializeBlankGrid(): MatrixCellData[][] {
  const grid: MatrixCellData[][] = [];
  for (let r = 0; r < LEV_NUM_ROWS; r++) {
    const row: MatrixCellData[] = [];
    for (let c = 0; c < LEV_NUM_COLS; c++) {
      row.push({
        row: r,
        col: c,
        value: null,
        state: 'default',
      });
    }
    grid.push(row);
  }
  return grid;
}

export function generateLevenshteinTrace(_initialInput?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];
  const grid = initializeBlankGrid();

  const m = CANONICAL_LEV_S1.length;
  const n = CANONICAL_LEV_S2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  let operationsCount = 0;
  let stepIndex = 0;

  // Frame 1: Inicialización
  rawFrames.push({
    highlightLines: { c: [16, 17], python: [11, 12] },
    arrayState: [],
    elementStates: {},
    pointers: {},
    activeAction: 'idle',
    matrixState: {
      numRows: LEV_NUM_ROWS,
      numCols: LEV_NUM_COLS,
      rowHeaders: [...LEV_ROW_HEADERS],
      colHeaders: [...LEV_COL_HEADERS],
      cells: cloneGridCells(grid),
      activeCell: null,
      currentFormula: 'D[i, j]: costo mínimo para transformar S1[0..i-1] en S2[0..j-1]',
    },
    explanation: {
      text: `Iniciando Distancia de Levenshtein. Cadenas: S1="${CANONICAL_LEV_S1}" (M=${m}) vs S2="${CANONICAL_LEV_S2}" (N=${n}).`,
      subNote: 'La matriz calculará el mínimo número de inserciones, eliminaciones y sustituciones unitarias.',
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
    },
  });

  // Casos base: fila 0 y col 0
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
    grid[i][0].value = i;
    grid[i][0].state = 'computed';
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
    grid[0][j].value = j;
    grid[0][j].state = 'computed';
  }

  rawFrames.push({
    highlightLines: { c: [20, 21], python: [15, 16, 17, 18] },
    arrayState: [0],
    elementStates: {},
    pointers: {},
    activeAction: 'locked',
    matrixState: {
      numRows: LEV_NUM_ROWS,
      numCols: LEV_NUM_COLS,
      rowHeaders: [...LEV_ROW_HEADERS],
      colHeaders: [...LEV_COL_HEADERS],
      cells: cloneGridCells(grid),
      activeCell: { row: 0, col: 0 },
      currentFormula: 'Casos base: D[i, 0] = i (i eliminaciones) y D[0, j] = j (j inserciones)',
    },
    explanation: {
      text: 'Casos base inicializados: transformar cualquier cadena desde o hacia la cadena vacía Ø requiere |longitud| operaciones.',
      subNote: 'Fila 0 rellena de 0 a 7 y Columna 0 rellena de 0 a 6.',
    },
    metrics: {
      comparisons: m + n + 1,
      swaps: 0,
      passNumber: 1,
    },
  });

  // Relleno tabular
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      stepIndex++;
      operationsCount++;

      const char1 = CANONICAL_LEV_S1[i - 1];
      const char2 = CANONICAL_LEV_S2[j - 1];
      const isMatch = char1 === char2;

      grid[i][j].state = 'computing';

      const delCost = dp[i - 1][j];
      const insCost = dp[i][j - 1];
      const subCost = dp[i - 1][j - 1];

      let cellVal: number;
      let formula: string;

      if (isMatch) {
        cellVal = subCost;
        formula = `S1[${i-1}] ('${char1}') == S2[${j-1}] ('${char2}'): Coincidencia exacta -> D[${i}, ${j}] = D[${i-1}, ${j-1}] = ${cellVal}`;
      } else {
        cellVal = 1 + Math.min(delCost, insCost, subCost);
        formula = `S1[${i-1}] ('${char1}') != S2[${j-1}] ('${char2}'): 1 + min(Del:${delCost}, Ins:${insCost}, Sub:${subCost}) = ${cellVal}`;
      }

      dp[i][j] = cellVal;

      const dependentCells = isMatch
        ? [{ row: i - 1, col: j - 1 }]
        : [
            { row: i - 1, col: j },
            { row: i, col: j - 1 },
            { row: i - 1, col: j - 1 },
          ];

      // Marcar dependencias en grid
      const previewGrid = cloneGridCells(grid);
      for (const d of dependentCells) {
        previewGrid[d.row][d.col].state = 'dependent';
      }

      previewGrid[i][j].value = cellVal;
      previewGrid[i][j].state = 'computing';

      rawFrames.push({
        highlightLines: isMatch
          ? { c: [25, 26], python: [22, 23] }
          : { c: [27, 28, 29, 30, 31, 32], python: [24, 25, 26, 27, 28] },
        arrayState: [cellVal],
        elementStates: {},
        pointers: { row: i, col: j },
        activeAction: isMatch ? 'locked' : 'compare',
        matrixState: {
          numRows: LEV_NUM_ROWS,
          numCols: LEV_NUM_COLS,
          rowHeaders: [...LEV_ROW_HEADERS],
          colHeaders: [...LEV_COL_HEADERS],
          cells: previewGrid,
          activeCell: { row: i, col: j },
          dependentCells,
          currentFormula: formula,
        },
        explanation: {
          text: `Evaluando celda D[${i}, ${j}] ('${char1}' vs '${char2}'). ${isMatch ? '¡COINCIDENCIA!' : 'DISCREPANCIA'}.`,
          subNote: formula,
        },
        metrics: {
          comparisons: operationsCount,
          swaps: 0,
          passNumber: stepIndex,
        },
      });

      grid[i][j].value = cellVal;
      grid[i][j].state = 'computed';
    }
  }

  // Backtracking del camino óptimo
  const optimalPath: Array<{ row: number; col: number }> = [];
  let currR = m;
  let currC = n;

  while (currR > 0 || currC > 0) {
    optimalPath.push({ row: currR, col: currC });
    if (currR > 0 && currC > 0 && CANONICAL_LEV_S1[currR - 1] === CANONICAL_LEV_S2[currC - 1]) {
      currR--;
      currC--;
    } else {
      const del = currR > 0 ? dp[currR - 1][currC] : INF;
      const ins = currC > 0 ? dp[currR][currC - 1] : INF;
      const sub = currR > 0 && currC > 0 ? dp[currR - 1][currC - 1] : INF;

      const minVal = Math.min(del, ins, sub);
      if (minVal === sub) {
        currR--;
        currC--;
      } else if (minVal === del) {
        currR--;
      } else {
        currC--;
      }
    }
  }
  optimalPath.push({ row: 0, col: 0 });

  const finalGrid = cloneGridCells(grid);
  for (const p of optimalPath) {
    finalGrid[p.row][p.col].state = 'optimal';
  }

  // Frame Final
  rawFrames.push({
    highlightLines: { c: [37], python: [30] },
    arrayState: [dp[m][n]],
    elementStates: { 0: 'sorted' },
    pointers: { finalDistance: dp[m][n] },
    activeAction: 'locked',
    matrixState: {
      numRows: LEV_NUM_ROWS,
      numCols: LEV_NUM_COLS,
      rowHeaders: [...LEV_ROW_HEADERS],
      colHeaders: [...LEV_COL_HEADERS],
      cells: finalGrid,
      activeCell: { row: m, col: n },
      optimalPathCells: optimalPath,
      currentFormula: `Distancia de Levenshtein mínima = ${dp[m][n]} operaciones`,
    },
    explanation: {
      text: `Distancia de Levenshtein calculada con éxito: ${dp[m][n]} operaciones mínimas de edición.`,
      subNote: `Para transformar "${CANONICAL_LEV_S1}" en "${CANONICAL_LEV_S2}": sustitución K→S, sustitución E→I e inserción de 'G'. Complejidad O(M · N).`,
    },
    metrics: {
      comparisons: operationsCount,
      swaps: 0,
      passNumber: stepIndex,
    },
  });

  const totalSteps = rawFrames.length;

  return rawFrames.map((rf, idx) => ({
    stepIndex: idx + 1,
    totalSteps,
    highlightLines: rf.highlightLines,
    arrayState: rf.arrayState,
    elementStates: rf.elementStates,
    pointers: rf.pointers,
    activeAction: rf.activeAction,
    matrixState: rf.matrixState,
    explanation: {
      stepLabel: `Paso ${idx + 1} de ${totalSteps}:`,
      text: rf.explanation.text,
      subNote: rf.explanation.subNote,
    },
    metrics: {
      comparisons: rf.metrics.comparisons,
      swaps: rf.metrics.swaps,
      passNumber: rf.metrics.passNumber,
      totalPasses: stepIndex,
      maxComparisons: m * n,
    },
  }));
}
const INF = 999999;
