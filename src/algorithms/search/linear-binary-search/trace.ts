/**
 * AlgoNotebook — Linear vs Binary Search Pure Trace Generator
 *
 * Comparador interactivo directo de orden asintótico:
 * - Búsqueda Lineal O(N): Escaneo secuencial elemento por elemento.
 * - Búsqueda Binaria O(log N): Reducción logarítmica a la mitad en cada paso.
 *
 * Función 100% pura y síncrona, sin dependencias de UI ni estado mutante.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  ComparisonDetails,
} from '../../../core/types';

interface RawFrame {
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  comparison?: ComparisonDetails;
  explanation: {
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
}

export function generateLinearBinarySearchTrace(initialArray: number[]): TraceFrame[] {
  if (!Array.isArray(initialArray) || initialArray.length === 0) {
    return [];
  }

  // Ordenamos para permitir la búsqueda binaria sobre el mismo conjunto ordenado
  const sorted = [...initialArray].sort((a, b) => a - b);
  const n = sorted.length;
  const rawFrames: RawFrame[] = [];

  // Elegimos un target en la segunda mitad para contrastar la aceleración logarítmica
  const targetIndex = sorted.includes(42)
    ? sorted.indexOf(42)
    : Math.min(n - 1, Math.max(0, Math.floor(n * 0.75)));
  const target = sorted[targetIndex];

  let linIdx = 0;
  let linDone = false;
  let linComparisons = 0;

  let low = 0;
  let high = n - 1;
  let binDone = false;
  let binComparisons = 0;
  let mid = Math.floor(low + (high - low) / 2);

  let round = 0;

  // Frame 1: Introducción y planteamiento del experimento comparativo
  rawFrames.push({
    highlightLines: { c: [7, 8, 20, 21], python: [6, 7, 16, 17] },
    arrayState: [...sorted],
    elementStates: Object.fromEntries(sorted.map((_, i) => [i, 'default'])),
    pointers: { lin: 0, low: 0, high: n - 1 },
    activeAction: 'idle',
    explanation: {
      text: `Comparador Asintótico: Búsqueda Lineal O(N) vs Búsqueda Binaria O(log N). Clave objetivo: target = ${target}.`,
      subNote: `Arreglo ordenado con N = ${n} elementos. La búsqueda lineal examinará elemento a elemento; la búsqueda binaria dividirá el rango por la mitad en cada paso.`,
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
    },
  });

  // Bucle interactivo comparando paso a paso
  while (!linDone || !binDone) {
    round++;

    // Paso de Búsqueda Binaria (si aún no terminó)
    if (!binDone) {
      mid = Math.floor(low + (high - low) / 2);
      const midVal = sorted[mid];
      binComparisons++;

      const isBinMatch = midVal === target;

      rawFrames.push({
        highlightLines: { c: [25, 26, 27], python: [20, 21, 22] },
        arrayState: [...sorted],
        elementStates: Object.fromEntries(
          sorted.map((_, i) => [
            i,
            i === mid
              ? isBinMatch ? 'sorted' : 'comparing'
              : i === linIdx && !linDone
              ? 'pointer'
              : 'default',
          ])
        ),
        pointers: {
          mid,
          low,
          high,
          ...(linDone ? {} : { lin: linIdx }),
        },
        activeAction: isBinMatch ? 'locked' : 'compare',
        comparison: {
          leftIndex: mid,
          rightIndex: targetIndex,
          leftValue: midVal,
          rightValue: target,
          conditionMet: isBinMatch,
        },
        explanation: {
          text: `[Binaria #${binComparisons}]: Evaluando punto medio mid = ${mid} (valor ${midVal}). ¿${midVal} == ${target}? ${isBinMatch ? '¡COINCIDENCIA!' : 'NO'}.`,
          subNote: isBinMatch
            ? `Búsqueda binaria encontró el objetivo en solo ${binComparisons} comparaciones (O(log N)).`
            : `Rango activo: [low=${low} .. high=${high}]. ${midVal < target ? 'Como ' + midVal + ' < ' + target + ', descarta mitad izquierda.' : 'Como ' + midVal + ' > ' + target + ', descarta mitad derecha.'}`,
        },
        metrics: {
          comparisons: linComparisons + binComparisons,
          swaps: 0,
          passNumber: round,
        },
      });

      if (isBinMatch) {
        binDone = true;
      } else if (midVal < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }

      if (low > high && !binDone) {
        binDone = true; // Rango agotado
      }
    }

    // Paso de Búsqueda Lineal (si aún no terminó)
    if (!linDone) {
      linComparisons++;
      const linVal = sorted[linIdx];
      const isLinMatch = linVal === target;

      rawFrames.push({
        highlightLines: { c: [11, 12, 13], python: [9, 10, 11] },
        arrayState: [...sorted],
        elementStates: Object.fromEntries(
          sorted.map((_, i) => [
            i,
            i === linIdx
              ? isLinMatch ? 'sorted' : 'comparing'
              : binDone && i === targetIndex
              ? 'sorted'
              : 'default',
          ])
        ),
        pointers: {
          lin: linIdx,
          ...(binDone ? { binTarget: targetIndex } : { low, high, mid }),
        },
        activeAction: isLinMatch ? 'locked' : 'compare',
        comparison: {
          leftIndex: linIdx,
          rightIndex: targetIndex,
          leftValue: linVal,
          rightValue: target,
          conditionMet: isLinMatch,
        },
        explanation: {
          text: `[Lineal #${linComparisons}]: Inspeccionando índice secuencial ${linIdx} (valor ${linVal}). ¿${linVal} == ${target}? ${isLinMatch ? '¡COINCIDENCIA!' : 'No'}.`,
          subNote: isLinMatch
            ? `Búsqueda lineal encontró el objetivo tras ${linComparisons} inspecciones completas.`
            : `Debe avanzar linealmente al siguiente índice (i = ${linIdx + 1}). Progreso: ${linComparisons}/${n}.`,
        },
        metrics: {
          comparisons: linComparisons + binComparisons,
          swaps: 0,
          passNumber: round,
        },
      });

      if (isLinMatch || linIdx >= n - 1) {
        linDone = true;
      } else {
        linIdx++;
      }
    }
  }

  // Frame Final: Conclusión del comparador
  rawFrames.push({
    highlightLines: { c: [15, 36], python: [12, 27] },
    arrayState: [...sorted],
    elementStates: Object.fromEntries(
      sorted.map((_, i) => [i, i === targetIndex ? 'sorted' : 'default'])
    ),
    pointers: { targetIdx: targetIndex },
    activeAction: 'locked',
    explanation: {
      text: `Comparativa Asintótica Finalizada: Binaria requirió ${binComparisons} comparaciones (O(log N)) vs Lineal con ${linComparisons} comparaciones (O(N)).`,
      subNote: `Aceleración de factor ~${(linComparisons / Math.max(1, binComparisons)).toFixed(1)}x en arreglo de tamaño N=${n}. En N=1.000.000, Lineal requiere 10⁶ operaciones y Binaria solo 20.`,
    },
    metrics: {
      comparisons: linComparisons + binComparisons,
      swaps: 0,
      passNumber: round,
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
    comparison: rf.comparison,
    explanation: {
      stepLabel: `Paso ${idx + 1} de ${totalSteps}:`,
      text: rf.explanation.text,
      subNote: rf.explanation.subNote,
    },
    metrics: {
      comparisons: rf.metrics.comparisons,
      swaps: 0,
      passNumber: rf.metrics.passNumber,
      totalPasses: round,
      maxComparisons: n + Math.ceil(Math.log2(n + 1)),
    },
  }));
}
