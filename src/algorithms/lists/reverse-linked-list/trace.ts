/**
 * AlgoNotebook — Inversión de Lista Enlazada (Reverse Linked List) Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Manejo de tres punteros de memoria (prev, curr, next) y direcciones hexadecimales.
 * - Inversión dinámica de flechas y enlaces en tiempo real.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  LinkedListAlgorithmState,
  LinkedListNodeData,
} from '../../../core/types';

export const DEFAULT_LINKED_LIST_VALUES: readonly number[] = [12, 25, 42, 68, 88];

const BASE_ADDRESS = 0x7ffee0;

function formatHexAddress(index: number): string {
  const addr = BASE_ADDRESS + index * 0x18;
  return `0x${addr.toString(16)}`;
}

interface RawTraceFrame {
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  linkedListState: LinkedListAlgorithmState;
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

/**
 * Generador puro y síncrono de fotogramas de ejecución para la inversión de una lista enlazada.
 *
 * @param initialValues Array numérico opcional (por defecto [12, 25, 42, 68, 88]).
 * @returns Lista inmutable de fotogramas paso a paso (TraceFrame[]).
 */
export function generateReverseListTrace(initialValues?: number[]): TraceFrame[] {
  const values =
    Array.isArray(initialValues) && initialValues.length >= 2
      ? initialValues
      : Array.from(DEFAULT_LINKED_LIST_VALUES);

  const n = values.length;
  const rawFrames: RawTraceFrame[] = [];

  // 1. Estructura inicial de nodos
  // Cada nodo apunta originalmente al siguiente: nextId = `node-${i + 1}`, excepto el último que apunta a null
  const nodes: LinkedListNodeData[] = values.map((val, idx) => ({
    id: `node-${idx}`,
    value: val,
    address: formatHexAddress(idx),
    nextId: idx < n - 1 ? `node-${idx + 1}` : null,
    state: 'default',
  }));

  let prevId: string | null = null;
  let currId: string | null = nodes[0].id;
  let nextId: string | null = null;

  let pointerInversions = 0;
  let loopChecks = 0;

  const cloneNodes = (): LinkedListNodeData[] => nodes.map((nd) => ({ ...nd }));

  // Helper para registrar un fotograma
  const recordFrame = (
    cLines: number[],
    pyLines: number[],
    action: ActiveAction,
    text: string,
    subNote: string
  ) => {
    // Calcular elementStates y punteros numéricos
    const elemStates: Record<number, ElementState> = {};
    const numPointers: Record<string, number> = {};

    nodes.forEach((nd, idx) => {
      if (nd.id === currId) {
        elemStates[idx] = 'comparing';
        numPointers.curr = idx;
      } else if (nd.id === prevId) {
        elemStates[idx] = 'sorted';
        numPointers.prev = idx;
      } else if (nd.id === nextId) {
        elemStates[idx] = 'pointer';
        numPointers.next = idx;
      } else {
        elemStates[idx] = nd.state;
      }
    });

    rawFrames.push({
      highlightLines: {
        c: cLines,
        python: pyLines,
      },
      arrayState: values,
      elementStates: elemStates,
      pointers: numPointers,
      activeAction: action,
      linkedListState: {
        nodes: cloneNodes(),
        headId: prevId ?? nodes[0].id,
        pointers: {
          prev: prevId,
          curr: currId,
          next: nextId,
        },
      },
      explanation: {
        text,
        subNote,
      },
      metrics: {
        comparisons: loopChecks,
        swaps: pointerInversions,
        passNumber: pointerInversions + 1,
      },
    });
  };

  // ==========================================================================
  // PASO 1: Inicialización de punteros de memoria
  // ==========================================================================
  recordFrame(
    [10, 11, 12],
    [7, 8],
    'idle',
    'Inicialización de punteros: prev = NULL, curr = head (nodo 0, dir: ' +
      nodes[0].address +
      '), next = NULL.',
    'Se preparan las referencias de memoria para recorrer e invertir los enlaces in-place sin duplicar estructuras.'
  );

  // ==========================================================================
  // BUCLE DE INVERSIÓN: while (curr != NULL)
  // ==========================================================================
  let currIdx = 0;
  while (currIdx < n) {
    loopChecks++;
    const currNode = nodes[currIdx];

    // Subpaso A: Evaluación de condición del bucle
    recordFrame(
      [14],
      [10],
      'compare',
      `Evaluando ciclo: curr != NULL (nodo actual: [${currNode.value}] en ${currNode.address}).`,
      `El puntero curr apunta a una dirección de memoria válida; entramos en la iteración de inversión.`
    );

    // Subpaso B: next = curr->next (Resguardo de referencia siguiente)
    nextId = currNode.nextId;
    const nextNode = nodes.find((nd) => nd.id === nextId);
    recordFrame(
      [15],
      [11],
      'pivot',
      `next = curr->next: Guardamos temporalmente la referencia al nodo ${
        nextNode ? `[${nextNode.value}] (${nextNode.address})` : 'NULL'
      }.`,
      'Es crítico resguardar next antes de romper el enlace actual para no perder el acceso al resto de la lista.'
    );

    // Subpaso C: curr->next = prev (Inversión del enlace)
    currNode.nextId = prevId;
    currNode.state = 'sorted';
    pointerInversions++;
    recordFrame(
      [16],
      [12],
      'swap',
      `curr->next = prev: Invertimos el puntero del nodo [${currNode.value}]. Ahora apunta hacia ${
        prevId ? `el nodo previo [${nodes.find((nd) => nd.id === prevId)?.value}]` : 'NULL'
      }.`,
      `¡Enlace invertido! El vector de memoria ahora apunta en sentido contrario. Enlaces revertidos: ${pointerInversions}/${n}.`
    );

    // Subpaso D: prev = curr (Avance de prev)
    prevId = currNode.id;
    recordFrame(
      [17],
      [13],
      'locked',
      `prev = curr: El puntero prev avanza al nodo recién invertido [${currNode.value}] (${currNode.address}).`,
      'El prefijo invertido crece; prev pasa a ser la nueva cabeza tentativa del subsegmento revertido.'
    );

    // Subpaso E: curr = next (Avance de curr)
    currId = nextId;
    recordFrame(
      [18],
      [14],
      'pivot',
      `curr = next: El puntero curr avanza al nodo resguardado ${
        nextNode ? `[${nextNode.value}]` : 'NULL'
      }.`,
      nextNode
        ? `Avanzamos hacia la siguiente celda de memoria (${nextNode.address}) para repetir el ciclo.`
        : 'curr alcanza NULL; todos los nodos de la lista han sido procesados.'
    );

    currIdx++;
  }

  // ==========================================================================
  // FOTOGRAMA FINAL: Finalización y retorno de nueva cabeza
  // ==========================================================================
  loopChecks++;
  recordFrame(
    [21],
    [16],
    'idle',
    `Inversión completa: curr == NULL. Retornamos prev (${
      nodes.find((nd) => nd.id === prevId)?.address ?? ''
    }) como la nueva cabeza (head) de la lista.`,
    `Todos los ${n} enlaces han sido invertidos in-place con complejidad temporal O(n) y espacio auxiliar O(1).`
  );

  // Mapear numeración exacta de pasos
  const totalSteps = rawFrames.length;
  return rawFrames.map((frame, index) => {
    const stepIndex = index + 1;
    return {
      ...frame,
      stepIndex,
      totalSteps,
      explanation: {
        stepLabel: `Paso ${stepIndex} de ${totalSteps}:`,
        text: frame.explanation.text,
        subNote: frame.explanation.subNote,
      },
    };
  });
}
