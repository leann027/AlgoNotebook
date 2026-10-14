/**
 * AlgoNotebook — Inorder Tree Traversal Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Manejo recursivo de pila simulada `callStack: StackFrame[]`.
 * - Traza el recorrido Inorder (Izquierda, Raíz, Derecha) acumulando la secuencia ordenada.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  TreeAlgorithmState,
  TreeNodeData,
  StackFrame,
} from '../../../core/types';

export const DEFAULT_INORDER_KEYS: readonly number[] = [15, 8, 23, 4, 11, 19, 30];

interface RawFrame {
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  callStack?: StackFrame[];
  treeState?: TreeAlgorithmState;
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
    insertedNodes?: number;
    treeHeight?: number;
  };
}

function cloneNodes(nodes: Record<string, TreeNodeData>): Record<string, TreeNodeData> {
  const cloned: Record<string, TreeNodeData> = {};
  for (const [id, node] of Object.entries(nodes)) {
    cloned[id] = { ...node };
  }
  return cloned;
}

function cloneCallStack(stack: StackFrame[]): StackFrame[] {
  return stack.map((frame) => ({
    ...frame,
    args: { ...frame.args },
  }));
}

/**
 * Construye la estructura de árbol canónico a partir de las claves para visualización.
 */
function buildTreeStructure(keys: number[]): {
  nodes: Record<string, TreeNodeData>;
  rootId: string;
} {
  const nodes: Record<string, TreeNodeData> = {};

  function insertNode(rootId: string, val: number): string {
    const root = nodes[rootId];
    if (val < root.value) {
      if (!root.leftId) {
        const newId = `node-${val}`;
        nodes[newId] = { id: newId, value: val, state: 'default' };
        root.leftId = newId;
        return newId;
      }
      return insertNode(root.leftId, val);
    } else {
      if (!root.rightId) {
        const newId = `node-${val}`;
        nodes[newId] = { id: newId, value: val, state: 'default' };
        root.rightId = newId;
        return newId;
      }
      return insertNode(root.rightId, val);
    }
  }

  const rootVal = keys[0] ?? 15;
  const rootId = `node-${rootVal}`;
  nodes[rootId] = { id: rootId, value: rootVal, state: 'default' };

  for (let i = 1; i < keys.length; i++) {
    insertNode(rootId, keys[i]);
  }

  return { nodes, rootId };
}

/**
 * Generador puro de traza para Recorrido Inorder en Árbol Binario.
 */
export function generateInorderTrace(inputKeys?: number[]): TraceFrame[] {
  const keys = inputKeys && inputKeys.length > 0 ? inputKeys : [...DEFAULT_INORDER_KEYS];
  const { nodes, rootId } = buildTreeStructure(keys);
  const rawFrames: RawFrame[] = [];

  const callStack: StackFrame[] = [];
  const outputSequence: number[] = [];
  const visitedPath: string[] = [];
  let visitsCount = 0;

  // Frame 0: Inicialización
  rawFrames.push({
    highlightLines: { c: [9, 10], python: [7, 8] },
    arrayState: [],
    elementStates: {},
    pointers: {},
    activeAction: 'idle',
    callStack: [],
    treeState: {
      nodes: cloneNodes(nodes),
      rootId,
      activeNodeId: rootId,
      visitedPath: [],
    },
    explanation: {
      stepLabel: 'Inicialización Inorder Traversal:',
      text: 'Iniciando recorrido simétrico (Inorder: Izquierda → Raíz → Derecha) desde la raíz del árbol binario.',
      subNote: 'En un BST, el recorrido Inorder visita los nodos en orden estrictamente ascendente.',
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
      totalPasses: keys.length,
      insertedNodes: keys.length,
      treeHeight: 3,
    },
  });

  function traverse(nodeId: string | null | undefined) {
    if (!nodeId || !nodes[nodeId]) {
      // Caso base: enlace nulo (NULL)
      rawFrames.push({
        highlightLines: { c: [10, 11, 12], python: [8, 9] },
        arrayState: [...outputSequence],
        elementStates: {},
        pointers: {},
        activeAction: 'idle',
        callStack: cloneCallStack(callStack),
        treeState: {
          nodes: cloneNodes(nodes),
          rootId,
          activeNodeId: undefined,
          visitedPath: [...visitedPath],
        },
        explanation: {
          stepLabel: 'Caso base (NULL):',
          text: 'Puntero nulo alcanzado (nodo inexistente). Retornando al marco de llamada anterior.',
          subNote: 'Se cumple la condición if (root == NULL).',
        },
        metrics: {
          comparisons: visitsCount,
          swaps: outputSequence.length,
          passNumber: callStack.length,
          totalPasses: keys.length,
          insertedNodes: keys.length,
          treeHeight: 3,
        },
      });
      return;
    }

    const currentVal = nodes[nodeId].value;
    visitedPath.push(nodeId);

    // Apilar marco
    callStack.forEach((f) => { f.isActive = false; });
    callStack.unshift({
      id: `inorder-${nodeId}-${callStack.length}`,
      functionName: 'inorder',
      args: { val: currentVal, depth: callStack.length + 1 },
      isActive: true,
    });

    nodes[nodeId].state = 'comparing';

    // 1. Entrada a la función
    rawFrames.push({
      highlightLines: { c: [9, 10], python: [7, 8] },
      arrayState: [...outputSequence],
      elementStates: {},
      pointers: {},
      activeAction: 'compare',
      callStack: cloneCallStack(callStack),
      treeState: {
        nodes: cloneNodes(nodes),
        rootId,
        activeNodeId: nodeId,
        visitedPath: [...visitedPath],
      },
      explanation: {
        stepLabel: `Llamada inorder(node=${currentVal}):`,
        text: `Entrando a la función con el nodo ${currentVal}. Se procede a explorar recursivamente su subárbol izquierdo.`,
        subNote: `Profundidad de llamada: ${callStack.length}.`,
      },
      metrics: {
        comparisons: visitsCount,
        swaps: outputSequence.length,
        passNumber: callStack.length,
        totalPasses: keys.length,
        insertedNodes: keys.length,
        treeHeight: 3,
      },
    });

    // 2. Descendiendo al hijo izquierdo
    rawFrames.push({
      highlightLines: { c: [14], python: [11] },
      arrayState: [...outputSequence],
      elementStates: {},
      pointers: {},
      activeAction: 'compare',
      callStack: cloneCallStack(callStack),
      treeState: {
        nodes: cloneNodes(nodes),
        rootId,
        activeNodeId: nodeId,
        visitedPath: [...visitedPath],
      },
      explanation: {
        stepLabel: `Explorando subárbol izquierdo de ${currentVal}:`,
        text: nodes[nodeId].leftId
          ? `Llamando recursivamente a inorder(${nodes[nodes[nodeId].leftId!].value}) a la izquierda.`
          : `El nodo ${currentVal} no tiene hijo izquierdo (NULL).`,
        subNote: 'Paso 1 del esquema Inorder: Izquierda.',
      },
      metrics: {
        comparisons: visitsCount,
        swaps: outputSequence.length,
        passNumber: callStack.length,
        totalPasses: keys.length,
        insertedNodes: keys.length,
        treeHeight: 3,
      },
    });

    traverse(nodes[nodeId].leftId);

    // 3. Visita / Procesamiento de la raíz del subárbol
    visitsCount++;
    outputSequence.push(currentVal);
    nodes[nodeId].state = 'sorted';

    // Reactivar el marco actual en la pila
    callStack.forEach((f) => { f.isActive = false; });
    if (callStack.length > 0) callStack[0].isActive = true;

    rawFrames.push({
      highlightLines: { c: [15], python: [12] },
      arrayState: [...outputSequence],
      elementStates: outputSequence.reduce((acc, _, idx) => {
        acc[idx] = 'sorted';
        return acc;
      }, {} as Record<number, ElementState>),
      pointers: { output: outputSequence.length - 1 },
      activeAction: 'locked',
      callStack: cloneCallStack(callStack),
      treeState: {
        nodes: cloneNodes(nodes),
        rootId,
        activeNodeId: nodeId,
        visitedPath: [...visitedPath],
      },
      explanation: {
        stepLabel: `Visita de nodo: emitir ${currentVal}:`,
        text: `Subárbol izquierdo procesado. Se emite ${currentVal} a la secuencia de salida ordenada.`,
        subNote: `Secuencia acumulada: [${outputSequence.join(', ')}].`,
      },
      metrics: {
        comparisons: visitsCount,
        swaps: outputSequence.length,
        passNumber: callStack.length,
        totalPasses: keys.length,
        insertedNodes: keys.length,
        treeHeight: 3,
      },
    });

    // 4. Descendiendo al hijo derecho
    rawFrames.push({
      highlightLines: { c: [16], python: [13] },
      arrayState: [...outputSequence],
      elementStates: outputSequence.reduce((acc, _, idx) => {
        acc[idx] = 'sorted';
        return acc;
      }, {} as Record<number, ElementState>),
      pointers: { output: outputSequence.length - 1 },
      activeAction: 'compare',
      callStack: cloneCallStack(callStack),
      treeState: {
        nodes: cloneNodes(nodes),
        rootId,
        activeNodeId: nodeId,
        visitedPath: [...visitedPath],
      },
      explanation: {
        stepLabel: `Explorando subárbol derecho de ${currentVal}:`,
        text: nodes[nodeId].rightId
          ? `Llamando recursivamente a inorder(${nodes[nodes[nodeId].rightId!].value}) a la derecha.`
          : `El nodo ${currentVal} no tiene hijo derecho (NULL).`,
        subNote: 'Paso 3 del esquema Inorder: Derecha.',
      },
      metrics: {
        comparisons: visitsCount,
        swaps: outputSequence.length,
        passNumber: callStack.length,
        totalPasses: keys.length,
        insertedNodes: keys.length,
        treeHeight: 3,
      },
    });

    traverse(nodes[nodeId].rightId);

    // 5. Fin de la llamada para este nodo: desapilar
    callStack.shift();
    if (callStack.length > 0) callStack[0].isActive = true;
  }

  traverse(rootId);

  // Fotograma final
  rawFrames.push({
    highlightLines: { c: [17], python: [13] },
    arrayState: [...outputSequence],
    elementStates: outputSequence.reduce((acc, _, idx) => {
      acc[idx] = 'sorted';
      return acc;
    }, {} as Record<number, ElementState>),
    pointers: {},
    activeAction: 'idle',
    callStack: [],
    treeState: {
      nodes: cloneNodes(nodes),
      rootId,
      activeNodeId: undefined,
      visitedPath: [...visitedPath],
    },
    explanation: {
      stepLabel: 'Recorrido Inorder Completado:',
      text: `Todos los nodos han sido visitados. La secuencia resultante [${outputSequence.join(', ')}] coincide exactamente con la ordenación no decreciente de las claves.`,
      subNote: `Nodos visitados: ${visitsCount} de ${keys.length}. Pila de llamadas limpia.`,
    },
    metrics: {
      comparisons: visitsCount,
      swaps: outputSequence.length,
      passNumber: keys.length,
      totalPasses: keys.length,
      insertedNodes: keys.length,
      treeHeight: 3,
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
    callStack: frame.callStack,
    treeState: frame.treeState,
    explanation: frame.explanation,
    metrics: frame.metrics,
  }));
}
