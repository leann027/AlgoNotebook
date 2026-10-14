/**
 * AlgoNotebook — Longest Common Subsequence (LCS) Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Cadenas canónicas:
 *   * S1 = "AGGTAB" (longitud m = 6)
 *   * S2 = "GXTXAYB" (longitud n = 7)
 * - Matriz DP bidimensional de (m+1) x (n+1) = 7 x 8 celdas.
 * - Fase 1: Inicialización base (i=0 fila 0, j=0 columna 0 en 0).
 * - Fase 2: Tabulación bottom-up con celdas dependientes (diagonal para coincidencia,
 *   arriba/izquierda para no coincidencia) y fórmulas de recurrencia.
 * - Fase 3: Reconstrucción por retroceso (backtracking) de la subsecuencia óptima ("GTAB").
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

export const CANONICAL_S1 = 'AGGTAB';
export const CANONICAL_S2 = 'GXTXAYB';

export const NUM_ROWS = CANONICAL_S1.length + 1; // 7 (0..6)
export const NUM_COLS = CANONICAL_S2.length + 1; // 8 (0..7)

export const LCS_ROW_HEADERS: readonly MatrixRowHeader[] = [
  { index: 0, label: 'Ø', subLabel: 'Base (i=0)' },
  { index: 1, label: 'A', subLabel: 'S1[0]' },
  { index: 2, label: 'G', subLabel: 'S1[1]' },
  { index: 3, label: 'G', subLabel: 'S1[2]' },
  { index: 4, label: 'T', subLabel: 'S1[3]' },
  { index: 5, label: 'A', subLabel: 'S1[4]' },
  { index: 6, label: 'B', subLabel: 'S1[5]' },
];

export const LCS_COL_HEADERS: readonly MatrixColHeader[] = [
  { index: 0, label: 'Ø' },
  { index: 1, label: 'G' },
  { index: 2, label: 'X' },
  { index: 3, label: 'T' },
  { index: 4, label: 'X' },
  { index: 5, label: 'A' },
  { index: 6, label: 'Y' },
  { index: 7, label: 'B' },
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
 * Clona profundamente la matriz de celdas para asegurar inmutabilidad entre fotogramas.
 */
function cloneGridCells(grid: MatrixCellData[][]): MatrixCellData[][] {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

/**
 * Generador puro y síncrono de fotogramas de ejecución para la Subsecuencia Común Más Larga (LCS).
 *
 * @param _initialInput Parámetro opcional para cumplir con el contrato AlgorithmDefinition.
 * @returns Lista inmutable de fotogramas paso a paso (TraceFrame[]).
 */
export function generateLCSTrace(_initialInput?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];
  const s1 = CANONICAL_S1;
  const s2 = CANONICAL_S2;
  const m = s1.length;
  const n = s2.length;

  // 1. Matriz de valores numéricos dp[m+1][n+1]
  const dp: number[][] = Array.from({ length: NUM_ROWS }, () =>
    Array.from({ length: NUM_COLS }, () => 0)
  );

  // 2. Estado visual de la cuadrícula de celdas (inicialmente en null)
  const gridCells: MatrixCellData[][] = Array.from({ length: NUM_ROWS }, (_, r) =>
    Array.from({ length: NUM_COLS }, (_, c) => ({
      row: r,
      col: c,
      value: null,
      state: 'default' as const,
    }))
  );

  let comparisonsCount = 0;
  let matchesCount = 0;

  const pushFrame = (params: {
    highlightLines: { c: number[]; python: number[] };
    activeAction: ActiveAction;
    activeCell: { row: number; col: number } | null;
    dependentCells: Array<{ row: number; col: number }>;
    optimalPathCells: Array<{ row: number; col: number }>;
    currentFormula?: string;
    currentRow: number;
    currentCol: number;
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
    // Clonamos las celdas aplicando estados transitorios para el fotograma
    const frameCells = cloneGridCells(gridCells);

    // Marcar celdas dependientes transitorias
    for (const dep of params.dependentCells) {
      if (frameCells[dep.row]?.[dep.col]) {
        frameCells[dep.row][dep.col].state = 'dependent';
      }
    }

    // Marcar celda activa en cálculo
    if (params.activeCell) {
      const { row, col } = params.activeCell;
      if (frameCells[row]?.[col]) {
        frameCells[row][col].state = 'computing';
      }
    }

    // Marcar celdas del camino óptimo
    for (const opt of params.optimalPathCells) {
      if (frameCells[opt.row]?.[opt.col]) {
        frameCells[opt.row][opt.col].state = 'optimal';
      }
    }

    const matrixState: MatrixGridAlgorithmState = {
      numRows: NUM_ROWS,
      numCols: NUM_COLS,
      rowHeaders: [...LCS_ROW_HEADERS],
      colHeaders: [...LCS_COL_HEADERS],
      cells: frameCells,
      activeCell: params.activeCell,
      dependentCells: params.dependentCells,
      optimalPathCells: params.optimalPathCells,
      currentFormula: params.currentFormula,
    };

    const linearState = [
      params.currentRow,
      params.currentCol,
      dp[params.currentRow]?.[params.currentCol] ?? 0,
      matchesCount,
    ];

    rawFrames.push({
      highlightLines: params.highlightLines,
      arrayState: linearState,
      elementStates: {},
      pointers: {
        i: params.currentRow,
        j: params.currentCol,
      },
      activeAction: params.activeAction,
      matrixState,
      comparison: params.comparison,
      explanation: params.explanation,
      metrics: {
        comparisons: comparisonsCount,
        swaps: matchesCount,
        passNumber: params.currentRow,
        totalPasses: m,
        maxComparisons: m * n,
      },
      event: params.event,
    });
  };

  // ==========================================================================
  // FASE 0: Fotograma Inicial (Presentación del Problema)
  // ==========================================================================
  pushFrame({
    highlightLines: {
      c: [6, 7],
      python: [1, 2, 3],
    },
    activeAction: 'idle',
    activeCell: null,
    dependentCells: [],
    optimalPathCells: [],
    currentFormula: 'LCS(S1="AGGTAB", S2="GXTXAYB")',
    currentRow: 0,
    currentCol: 0,
    explanation: {
      stepLabel: 'Inicio — Problema de la Subsecuencia Común Más Larga',
      text: `Se configuran las cadenas S1 = "AGGTAB" (m = ${m}) y S2 = "GXTXAYB" (n = ${n}). La tabla de tabulación bidimensional dp[m+1][n+1] tiene dimensiones 7×8.`,
      subNote: 'El objetivo es hallar la subsecuencia común de máxima longitud preservando el orden relativo.',
    },
    event: { type: 'idle' },
  });

  // ==========================================================================
  // FASE 1: Inicialización de Casos Base (Fila 0 y Columna 0 en 0)
  // ==========================================================================
  for (let j = 0; j <= n; j++) {
    dp[0][j] = 0;
    gridCells[0][j] = {
      row: 0,
      col: j,
      value: 0,
      state: 'computed',
    };
  }
  for (let i = 1; i <= m; i++) {
    dp[i][0] = 0;
    gridCells[i][0] = {
      row: i,
      col: 0,
      value: 0,
      state: 'computed',
    };
  }

  pushFrame({
    highlightLines: {
      c: [9, 10, 11, 12],
      python: [3],
    },
    activeAction: 'idle',
    activeCell: null,
    dependentCells: [],
    optimalPathCells: [],
    currentFormula: 'dp[0][j] = 0,  dp[i][0] = 0  (Prefijos Vacíos Ø)',
    currentRow: 0,
    currentCol: 0,
    explanation: {
      stepLabel: 'Inicialización de Casos Base (Fila 0 y Columna 0)',
      text: 'Se inicializa la fila 0 y la columna 0 en 0. Una cadena vacía (longitud 0) tiene subsecuencia común de longitud 0 con cualquier prefijo de la otra cadena.',
      subNote: 'Caso base: dp[0][j] = 0 para todo j ∈ [0..7] y dp[i][0] = 0 para todo i ∈ [0..6].',
    },
    event: { type: 'idle' },
  });

  // ==========================================================================
  // FASE 2: Tabulación 2D Bottom-Up (i = 1..m, j = 1..n)
  // ==========================================================================
  for (let i = 1; i <= m; i++) {
    const char1 = s1[i - 1];

    for (let j = 1; j <= n; j++) {
      const char2 = s2[j - 1];
      comparisonsCount++;

      const isMatch = char1 === char2;

      if (isMatch) {
        matchesCount++;
        const prevDiag = dp[i - 1][j - 1];
        const computedVal = prevDiag + 1;
        dp[i][j] = computedVal;
        gridCells[i][j] = {
          row: i,
          col: j,
          value: computedVal,
          state: 'computed',
        };

        const formulaStr = `S_1[${i - 1}] == S_2[${j - 1}] \\; ('${char1}') \\implies dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${prevDiag} + 1 = ${computedVal}`;

        pushFrame({
          highlightLines: {
            c: [13, 14],
            python: [7, 8],
          },
          activeAction: 'swap',
          activeCell: { row: i, col: j },
          dependentCells: [{ row: i - 1, col: j - 1 }],
          optimalPathCells: [],
          currentFormula: formulaStr,
          currentRow: i,
          currentCol: j,
          comparison: {
            leftIndex: i,
            rightIndex: j,
            leftValue: char1.charCodeAt(0),
            rightValue: char2.charCodeAt(0),
            conditionMet: true,
          },
          explanation: {
            stepLabel: `Paso (i=${i}, j=${j}): Coincidencia '${char1}' == '${char2}'`,
            text: `¡Coincidencia encontrada! S1[${i - 1}] ('${char1}') coincide con S2[${j - 1}] ('${char2}'). Se incrementa en 1 el resultado óptimo del subproblema diagonal previo: dp[${i - 1}][${j - 1}] + 1 = ${computedVal}.`,
            subNote: `Dependencia diagonal: dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${computedVal}.`,
          },
          event: {
            type: 'compare',
            leftIndex: i,
            rightIndex: j,
            leftValue: char1.charCodeAt(0),
            rightValue: char2.charCodeAt(0),
            conditionMet: true,
          },
        });
      } else {
        const topVal = dp[i - 1][j];
        const leftVal = dp[i][j - 1];
        const maxVal = Math.max(topVal, leftVal);
        dp[i][j] = maxVal;
        gridCells[i][j] = {
          row: i,
          col: j,
          value: maxVal,
          state: 'computed',
        };

        const formulaStr = `S_1[${i - 1}] ('${char1}') \\neq S_2[${j - 1}] ('${char2}') \\implies \\max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = \\max(${topVal}, ${leftVal}) = ${maxVal}`;

        pushFrame({
          highlightLines: {
            c: [15, 16],
            python: [9, 10],
          },
          activeAction: 'compare',
          activeCell: { row: i, col: j },
          dependentCells: [
            { row: i - 1, col: j },
            { row: i, col: j - 1 },
          ],
          optimalPathCells: [],
          currentFormula: formulaStr,
          currentRow: i,
          currentCol: j,
          comparison: {
            leftIndex: i,
            rightIndex: j,
            leftValue: char1.charCodeAt(0),
            rightValue: char2.charCodeAt(0),
            conditionMet: false,
          },
          explanation: {
            stepLabel: `Paso (i=${i}, j=${j}): '${char1}' ≠ '${char2}'`,
            text: `Sin coincidencia: '${char1}' ≠ '${char2}'. Se toma el máximo entre la celda superior dp[${i - 1}][${j}] (${topVal}) y la celda izquierda dp[${i}][${j - 1}] (${leftVal}): max(${topVal}, ${leftVal}) = ${maxVal}.`,
            subNote: `Subproblemas solapados: se conserva el mayor valor acumulado previo (${maxVal}).`,
          },
          event: {
            type: 'compare',
            leftIndex: i,
            rightIndex: j,
            leftValue: char1.charCodeAt(0),
            rightValue: char2.charCodeAt(0),
            conditionMet: false,
          },
        });
      }
    }
  }

  // ==========================================================================
  // FASE 3: Tabla Completa y Preparación para Backtracking
  // ==========================================================================
  const lcsLength = dp[m][n];

  pushFrame({
    highlightLines: {
      c: [22, 23, 24, 25],
      python: [13, 14, 15],
    },
    activeAction: 'locked',
    activeCell: { row: m, col: n },
    dependentCells: [],
    optimalPathCells: [{ row: m, col: n }],
    currentFormula: `dp[${m}][${n}] = ${lcsLength}  (Longitud Máxima de LCS = ${lcsLength})`,
    currentRow: m,
    currentCol: n,
    explanation: {
      stepLabel: 'Tabulación Completa — Inicio de Reconstrucción (Backtracking)',
      text: `Se calcularon las 56 celdas de la cuadrícula. La celda destino dp[${m}][${n}] = ${lcsLength} confirma que la longitud máxima de la subsecuencia común es ${lcsLength}.`,
      subNote: 'Iniciamos el retroceso desde dp[6][7] para extraer los caracteres exactos de la LCS.',
    },
    event: {
      type: 'locked',
      index: n,
      value: lcsLength,
    },
  });

  // ==========================================================================
  // FASE 4: Reconstrucción por Retroceso (Backtracking)
  // ==========================================================================
  let backI = m;
  let backJ = n;
  const optimalCells: Array<{ row: number; col: number }> = [];
  const reconstructedChars: string[] = [];

  while (backI > 0 && backJ > 0) {
    const c1 = s1[backI - 1];
    const c2 = s2[backJ - 1];

    if (c1 === c2) {
      // Coincidencia en backtracking: esta celda diagonal forma parte de la solución óptima
      optimalCells.push({ row: backI, col: backJ });
      reconstructedChars.unshift(c1);

      pushFrame({
        highlightLines: {
          c: [28, 29, 30, 31, 32],
          python: [16, 17, 18, 19],
        },
        activeAction: 'locked',
        activeCell: { row: backI, col: backJ },
        dependentCells: [{ row: backI - 1, col: backJ - 1 }],
        optimalPathCells: [...optimalCells],
        currentFormula: `S1[${backI - 1}] == S2[${backJ - 1}] = '${c1}' ⟹ Incluir en LCS  [LCS: "${reconstructedChars.join('')}"]`,
        currentRow: backI,
        currentCol: backJ,
        explanation: {
          stepLabel: `Retroceso (i=${backI}, j=${backJ}): Carácter '${c1}' incluido`,
          text: `Los caracteres coinciden: S1[${backI - 1}] ('${c1}') == S2[${backJ - 1}] ('${c2}'). Este carácter pertenece a la LCS. Retrocedemos diagonalmente a dp[${backI - 1}][${backJ - 1}].`,
          subNote: `Subsecuencia acumulada hasta el momento: "${reconstructedChars.join('')}".`,
        },
        event: {
          type: 'locked',
          index: backJ,
          value: dp[backI][backJ],
        },
      });

      backI--;
      backJ--;
    } else if (dp[backI - 1][backJ] >= dp[backI][backJ - 1]) {
      // Rama superior mayor o igual
      const topVal = dp[backI - 1][backJ];
      const leftVal = dp[backI][backJ - 1];

      pushFrame({
        highlightLines: {
          c: [33, 34],
          python: [20, 21],
        },
        activeAction: 'compare',
        activeCell: { row: backI, col: backJ },
        dependentCells: [{ row: backI - 1, col: backJ }],
        optimalPathCells: [...optimalCells],
        currentFormula: `dp[${backI - 1}][${backJ}] (${topVal}) ≥ dp[${backI}][${backJ - 1}] (${leftVal}) ⟹ Retroceder hacia Arriba`,
        currentRow: backI,
        currentCol: backJ,
        explanation: {
          stepLabel: `Retroceso (i=${backI}, j=${backJ}): Desplazamiento hacia Arriba`,
          text: `Como dp[${backI - 1}][${backJ}] (${topVal}) ≥ dp[${backI}][${backJ - 1}] (${leftVal}), el valor óptimo provino de la fila superior. Retrocedemos i de ${backI} a ${backI - 1}.`,
          subNote: `Excluyendo carácter S1[${backI - 1}] ('${c1}') sin coincidencia.`,
        },
        event: {
          type: 'compare',
          leftIndex: backI,
          rightIndex: backJ,
          leftValue: topVal,
          rightValue: leftVal,
          conditionMet: true,
        },
      });

      backI--;
    } else {
      // Rama izquierda estrictamente mayor
      const topVal = dp[backI - 1][backJ];
      const leftVal = dp[backI][backJ - 1];

      pushFrame({
        highlightLines: {
          c: [35, 36],
          python: [22, 23],
        },
        activeAction: 'compare',
        activeCell: { row: backI, col: backJ },
        dependentCells: [{ row: backI, col: backJ - 1 }],
        optimalPathCells: [...optimalCells],
        currentFormula: `dp[${backI}][${backJ - 1}] (${leftVal}) > dp[${backI - 1}][${backJ}] (${topVal}) ⟹ Retroceder hacia la Izquierda`,
        currentRow: backI,
        currentCol: backJ,
        explanation: {
          stepLabel: `Retroceso (i=${backI}, j=${backJ}): Desplazamiento a la Izquierda`,
          text: `Como dp[${backI}][${backJ - 1}] (${leftVal}) > dp[${backI - 1}][${backJ}] (${topVal}), el valor óptimo provino de la columna izquierda. Retrocedemos j de ${backJ} a ${backJ - 1}.`,
          subNote: `Excluyendo carácter S2[${backJ - 1}] ('${c2}') sin coincidencia.`,
        },
        event: {
          type: 'compare',
          leftIndex: backI,
          rightIndex: backJ,
          leftValue: leftVal,
          rightValue: topVal,
          conditionMet: true,
        },
      });

      backJ--;
    }
  }

  // ==========================================================================
  // FASE 5: Fotograma Final — Solución Óptima Consolidada
  // ==========================================================================
  const finalLcsStr = reconstructedChars.join('');

  // Marcar todas las celdas óptimas en gridCells
  for (const opt of optimalCells) {
    if (gridCells[opt.row]?.[opt.col]) {
      gridCells[opt.row][opt.col].state = 'optimal';
    }
  }

  pushFrame({
    highlightLines: {
      c: [41],
      python: [25, 26],
    },
    activeAction: 'locked',
    activeCell: null,
    dependentCells: [],
    optimalPathCells: [...optimalCells],
    currentFormula: `LCS("${s1}", "${s2}") = "${finalLcsStr}"  (Longitud: ${lcsLength})`,
    currentRow: 0,
    currentCol: 0,
    explanation: {
      stepLabel: 'Finalización — Subsecuencia Común Óptima Reconstruida',
      text: `¡Proceso completado con éxito! La Subsecuencia Común Más Larga es "${finalLcsStr}" con una longitud de ${lcsLength} caracteres. Las 4 celdas diagonales óptimas están destacadas en verde menta.`,
      subNote: `Caracteres correspondientes: S1 = A-[G]-G-[T]-[A]-[B], S2 = [G]-X-[T]-X-[A]-Y-[B] → "${finalLcsStr}".`,
    },
    event: {
      type: 'locked',
      index: 0,
      value: lcsLength,
    },
  });

  const totalSteps = rawFrames.length;
  return rawFrames.map((frame, index) => ({
    ...frame,
    stepIndex: index + 1,
    totalSteps,
  }));
}

