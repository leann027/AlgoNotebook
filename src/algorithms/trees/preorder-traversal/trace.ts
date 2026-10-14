/**
 * AlgoNotebook — Preorder Tree Traversal Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Manejo recursivo de pila simulada `callStack: StackFrame[]`.
 * - Traza el recorrido Preorder (Raíz, Izquierda, Derecha).
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  TreeAlgorithmState,
  TreeNodeData,
  StackFrame,
} from '../../../core/types';

export const DEFAULT_PREORDER_KEYS: readonly number[] = [15, 8, 23, 4, 11, 19, 30];

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

export function generatePreorderTrace(inputKeys?: number[]): TraceFrame[] {
  const keys = inputKeys && inputKeys.length > 0 ? inputKeys : [...DEFAULT_PREORDER_KEYS];
  const { nodes, rootId } = buildTreeStructure(keys);

  const rawFrames: RawFrame[] = [];
  const currentNodes = cloneNodes(nodes);
  const currentCallStack: StackFrame[] = [];
  const visitedOrder: number[] = [];
  let stepCounter = 0;
  let callIdCounter = 0;

  function pushRawFrame(
    cLines: number[],
    pyLines: number[],
    activeAction: ActiveAction,
    activeNodeId: string | null,
    explanation: { stepLabel: string; text: string; subNote?: string }
  ) {
    stepCounter++;
    const elementStates: Record<number, ElementState> = {};
    visitedOrder.forEach((_, idx) => {
      elementStates[idx] = 'sorted';
    });

    rawFrames.push({
      highlightLines: { c: cLines, python: pyLines },
      arrayState: [...visitedOrder],
      elementStates,
      pointers: {
        visited: visitedOrder.length,
      },
      activeAction,
      callStack: cloneCallStack(currentCallStack),
      treeState: {
        nodes: cloneNodes(currentNodes),
        rootId,
        activeNodeId,
      },
      explanation,
      metrics: {
        comparisons: stepCounter,
        swaps: visitedOrder.length,
        passNumber: visitedOrder.length,
        totalPasses: keys.length,
        maxComparisons: keys.length * 3,
        insertedNodes: keys.length,
        treeHeight: 3,
      },
    });
  }

  // Fotograma 1: Inicio
  pushRawFrame(
    [8, 9],
    [7, 8],
    'idle',
    null,
    {
      stepLabel: 'Inicio — Recorrido Preorder (V-L-R)',
      text: `Se inicializa el recorrido Preorder sobre el árbol de ${keys.length} nodos. En este orden, se procesa la RAÍZ (Valor), luego el subárbol IZQUIERDO y finalmente el DERECHO.`,
      subNote: 'Orden canónico: Visita primero al padre antes que a cualquiera de sus descendientes.',
    }
  );

  function traversePreorder(nodeId: string | null) {
    const callId = `call-${++callIdCounter}`;

    if (!nodeId) {
      currentCallStack.unshift({
        id: callId,
        functionName: 'preorder',
        args: { root: 'NULL' },
        isActive: true,
      });

      pushRawFrame(
        [9, 10, 11],
        [8, 9],
        'idle',
        null,
        {
          stepLabel: 'Caso Base: Enlace Nulo (NULL)',
          text: 'Puntero NULL alcanzado. No hay subárbol que recorrer en esta rama; se retorna inmediatamente.',
          subNote: 'Fin de rama recursiva.',
        }
      );

      currentCallStack.shift();
      return;
    }

    const node = currentNodes[nodeId];

    currentCallStack.unshift({
      id: callId,
      functionName: 'preorder',
      args: { val: node.value },
      isActive: true,
    });

    // 1. Visitar Raíz (Procesar Valor)
    currentNodes[nodeId].state = 'comparing';
    pushRawFrame(
      [13, 14],
      [11],
      'compare',
      nodeId,
      {
        stepLabel: `Visita Raíz: Nodo ${node.value}`,
        text: `Preorder procesa primero el nodo actual ${node.value} antes de descender a sus hijos.`,
        subNote: `Valor ${node.value} emitido a la secuencia de salida.`,
      }
    );

    visitedOrder.push(node.value);
    currentNodes[nodeId].state = 'sorted';

    // 2. Recorrer Subárbol Izquierdo
    if (node.leftId) {
      pushRawFrame(
        [15],
        [12],
        'compare',
        nodeId,
        {
          stepLabel: `Descenso Izquierdo desde Nodo ${node.value}`,
          text: `Invocando preorder recursivamente sobre el hijo izquierdo (valor ${currentNodes[node.leftId].value}).`,
          subNote: `preorder(root->left)`,
        }
      );
    }
    traversePreorder(node.leftId ?? null);

    // 3. Recorrer Subárbol Derecho
    if (node.rightId) {
      pushRawFrame(
        [16],
        [13],
        'compare',
        nodeId,
        {
          stepLabel: `Descenso Derecho desde Nodo ${node.value}`,
          text: `Invocando preorder recursivamente sobre el hijo derecho (valor ${currentNodes[node.rightId].value}).`,
          subNote: `preorder(root->right)`,
        }
      );
    }
    traversePreorder(node.rightId ?? null);

    // 4. Retorno del marco actual
    currentCallStack.shift();
  }

  traversePreorder(rootId);

  // Fotograma Final
  pushRawFrame(
    [17],
    [14],
    'locked',
    null,
    {
      stepLabel: 'Recorrido Preorder Completado',
      text: `Secuencia final generada en Preorder: [${visitedOrder.join(', ')}]. Todos los ${visitedOrder.length} nodos visitados en orden V-L-R.`,
      subNote: 'La pila de llamadas ha finalizado todas sus ejecuciones (call stack vacío).',
    }
  );

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
    explanation: {
      stepLabel: `Paso ${index + 1} de ${totalSteps}:`,
      text: frame.explanation.text,
      subNote: frame.explanation.subNote,
    },
    metrics: {
      comparisons: frame.metrics.comparisons,
      swaps: frame.metrics.swaps,
      passNumber: frame.metrics.passNumber,
      totalPasses: keys.length,
      maxComparisons: frame.metrics.maxComparisons,
      insertedNodes: keys.length,
      treeHeight: 3,
    },
  }));
}
