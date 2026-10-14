/**
 * AlgoNotebook — AVL Tree (Balanced Rotations) Pure Trace Generator
 *
 * Simulación pura y síncrona de inserción paso a paso en un Árbol AVL.
 * Demuestra:
 * - Inserción estándar en Árbol Binario de Búsqueda (BST).
 * - Recálculo ascendente de alturas y factores de balance BF(v) = h_L - h_R.
 * - Detección de los 4 desbalances canónicos: LL (Right), RR (Left), LR (Left-Right) y RL (Right-Left).
 * - Reestructuración de punteros en O(1) mediante rotaciones y preservación del invariante.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  TreeAlgorithmState,
  TreeNodeData,
  ComparisonDetails,
} from '../../../core/types';

export const DEFAULT_AVL_KEYS: readonly number[] = [30, 20, 10, 25, 40, 50, 22];

interface RawFrame {
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  treeState: TreeAlgorithmState;
  comparison?: ComparisonDetails;
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

interface InternalNode {
  key: number;
  height: number;
  left: InternalNode | null;
  right: InternalNode | null;
}

function getNodeHeight(node: InternalNode | null): number {
  return node ? node.height : 0;
}

function getBalanceFactor(node: InternalNode | null): number {
  return node ? getNodeHeight(node.left) - getNodeHeight(node.right) : 0;
}

function updateHeight(node: InternalNode): void {
  node.height = 1 + Math.max(getNodeHeight(node.left), getNodeHeight(node.right));
}

function cloneSubtree(node: InternalNode | null): InternalNode | null {
  if (!node) return null;
  return {
    key: node.key,
    height: node.height,
    left: cloneSubtree(node.left),
    right: cloneSubtree(node.right),
  };
}

function exportTreeState(
  root: InternalNode | null,
  activeKey?: number | null,
  insertedKey?: number | null,
  visitedKeys?: number[]
): TreeAlgorithmState {
  const nodes: Record<string, TreeNodeData> = {};

  function traverse(curr: InternalNode | null) {
    if (!curr) return;
    const id = `node-${curr.key}`;

    let state: ElementState = 'default';
    if (curr.key === activeKey) {
      state = 'comparing';
    } else if (curr.key === insertedKey) {
      state = 'sorted';
    }

    nodes[id] = {
      id,
      value: curr.key,
      leftId: curr.left ? `node-${curr.left.key}` : null,
      rightId: curr.right ? `node-${curr.right.key}` : null,
      state,
    };

    traverse(curr.left);
    traverse(curr.right);
  }

  traverse(root);

  return {
    rootId: root ? `node-${root.key}` : null,
    nodes,
    activeNodeId: activeKey !== null && activeKey !== undefined ? `node-${activeKey}` : null,
    insertedNodeId: insertedKey !== null && insertedKey !== undefined ? `node-${insertedKey}` : null,
    visitedPath: (visitedKeys ?? []).map((k) => `node-${k}`),
    currentKey: activeKey ?? null,
  };
}

function rotateRightInternal(y: InternalNode): InternalNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeftInternal(x: InternalNode): InternalNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

export function generateAvlTreeTrace(initialKeys?: number[]): TraceFrame[] {
  const keys = Array.isArray(initialKeys) && initialKeys.length > 0
    ? initialKeys.slice(0, 7)
    : [...DEFAULT_AVL_KEYS];

  const rawFrames: RawFrame[] = [];
  let root: InternalNode | null = null;
  const insertedKeysSoFar: number[] = [];
  let comparisonsCount = 0;
  let rotationsCount = 0;
  let passNumber = 0;

  // Frame 1: Árbol AVL vacío
  rawFrames.push({
    highlightLines: { c: [29, 30], python: [7, 8] },
    arrayState: [],
    elementStates: {},
    pointers: {},
    activeAction: 'idle',
    treeState: exportTreeState(null),
    explanation: {
      text: 'Inicializando Árbol AVL. Invariante de balance: |BF(v)| = |h_L - h_R| <= 1.',
      subNote: 'Garantiza que la altura h del árbol nunca exceda 1.44 log2(N), asegurando búsquedas en O(log N).',
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
    },
  });

  for (let k = 0; k < keys.length; k++) {
    const key = keys[k];
    passNumber++;
    insertedKeysSoFar.push(key);

    const visitedDuringDescent: number[] = [];

    // Frame: Inicio de inserción de clave
    rawFrames.push({
      highlightLines: { c: [61, 62], python: [35, 36] },
      arrayState: [...insertedKeysSoFar],
      elementStates: Object.fromEntries(
        insertedKeysSoFar.map((_, i) => [i, i === insertedKeysSoFar.length - 1 ? 'pointer' : 'default'])
      ),
      pointers: { insertingKey: key },
      activeAction: 'pivot',
      treeState: exportTreeState(root, null, key),
      explanation: {
        text: `Insertando clave ${key} en el Árbol AVL.`,
        subNote: 'Descendiendo jerárquicamente como en un BST estándar comparando la clave con los nodos existentes.',
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: rotationsCount,
        passNumber,
      },
    });

    // Inserción recursiva registrando fotogramas
    function insert(node: InternalNode | null): InternalNode {
      if (!node) {
        return {
          key,
          height: 1,
          left: null,
          right: null,
        };
      }

      visitedDuringDescent.push(node.key);
      comparisonsCount++;

      if (key < node.key) {
        rawFrames.push({
          highlightLines: { c: [64], python: [38, 39] },
          arrayState: [...insertedKeysSoFar],
          elementStates: Object.fromEntries(
            insertedKeysSoFar.map((_, i) => [i, 'default'])
          ),
          pointers: { currentKey: node.key },
          activeAction: 'compare',
          treeState: exportTreeState(root, node.key, key, visitedDuringDescent),
          comparison: {
            leftIndex: key,
            rightIndex: node.key,
            leftValue: key,
            rightValue: node.key,
            conditionMet: key < node.key,
          },
          explanation: {
            text: `Comparando clave ${key} con nodo ${node.key}: ${key} < ${node.key}. Descenso hacia el hijo izquierdo.`,
            subNote: `Camino de inserción: [${visitedDuringDescent.join(' -> ')}].`,
          },
          metrics: {
            comparisons: comparisonsCount,
            swaps: rotationsCount,
            passNumber,
          },
        });
        node.left = insert(node.left);
      } else if (key > node.key) {
        rawFrames.push({
          highlightLines: { c: [66], python: [40, 41] },
          arrayState: [...insertedKeysSoFar],
          elementStates: Object.fromEntries(
            insertedKeysSoFar.map((_, i) => [i, 'default'])
          ),
          pointers: { currentKey: node.key },
          activeAction: 'compare',
          treeState: exportTreeState(root, node.key, key, visitedDuringDescent),
          comparison: {
            leftIndex: key,
            rightIndex: node.key,
            leftValue: key,
            rightValue: node.key,
            conditionMet: key > node.key,
          },
          explanation: {
            text: `Comparando clave ${key} con nodo ${node.key}: ${key} > ${node.key}. Descenso hacia el hijo derecho.`,
            subNote: `Camino de inserción: [${visitedDuringDescent.join(' -> ')}].`,
          },
          metrics: {
            comparisons: comparisonsCount,
            swaps: rotationsCount,
            passNumber,
          },
        });
        node.right = insert(node.right);
      } else {
        return node; // Duplicado
      }

      updateHeight(node);
      const balance = getBalanceFactor(node);

      // Evaluación del factor de balance
      if (Math.abs(balance) > 1) {
        rotationsCount++;

        // Caso 1: Left-Left (LL)
        if (balance > 1 && node.left && key < node.left.key) {
          rawFrames.push({
            highlightLines: { c: [73, 74], python: [47, 48] },
            arrayState: [...insertedKeysSoFar],
            elementStates: Object.fromEntries(
              insertedKeysSoFar.map((_, i) => [i, 'comparing'])
            ),
            pointers: { imbalancedNode: node.key },
            activeAction: 'swap',
            treeState: exportTreeState(root, node.key, key),
            explanation: {
              text: `¡Desbalance detectado en nodo ${node.key}! Factor de balance BF = ${balance} (Caso Left-Left).`,
              subNote: 'El subárbol izquierdo es 2 niveles más alto y la clave insertada fue al subárbol izquierdo de su hijo izquierdo. Ejecutando Rotación Derecha simple.',
            },
            metrics: {
              comparisons: comparisonsCount,
              swaps: rotationsCount,
              passNumber,
            },
          });
          const rotated = rotateRightInternal(node);
          return rotated;
        }

        // Caso 2: Right-Right (RR)
        if (balance < -1 && node.right && key > node.right.key) {
          rawFrames.push({
            highlightLines: { c: [77, 78], python: [51, 52] },
            arrayState: [...insertedKeysSoFar],
            elementStates: Object.fromEntries(
              insertedKeysSoFar.map((_, i) => [i, 'comparing'])
            ),
            pointers: { imbalancedNode: node.key },
            activeAction: 'swap',
            treeState: exportTreeState(root, node.key, key),
            explanation: {
              text: `¡Desbalance detectado en nodo ${node.key}! Factor de balance BF = ${balance} (Caso Right-Right).`,
              subNote: 'El subárbol derecho es 2 niveles más alto y la clave insertada fue a la derecha. Ejecutando Rotación Izquierda simple.',
            },
            metrics: {
              comparisons: comparisonsCount,
              swaps: rotationsCount,
              passNumber,
            },
          });
          const rotated = rotateLeftInternal(node);
          return rotated;
        }

        // Caso 3: Left-Right (LR)
        if (balance > 1 && node.left && key > node.left.key) {
          rawFrames.push({
            highlightLines: { c: [81, 82, 83], python: [55, 56, 57] },
            arrayState: [...insertedKeysSoFar],
            elementStates: Object.fromEntries(
              insertedKeysSoFar.map((_, i) => [i, 'comparing'])
            ),
            pointers: { imbalancedNode: node.key },
            activeAction: 'swap',
            treeState: exportTreeState(root, node.key, key),
            explanation: {
              text: `¡Desbalance detectado en nodo ${node.key}! Factor de balance BF = ${balance} (Caso Left-Right).`,
              subNote: 'Doble rotación requerida: primero Rotación Izquierda en el hijo izquierdo, luego Rotación Derecha en el padre.',
            },
            metrics: {
              comparisons: comparisonsCount,
              swaps: rotationsCount,
              passNumber,
            },
          });
          node.left = rotateLeftInternal(node.left);
          return rotateRightInternal(node);
        }

        // Caso 4: Right-Left (RL)
        if (balance < -1 && node.right && key < node.right.key) {
          rawFrames.push({
            highlightLines: { c: [87, 88, 89], python: [60, 61, 62] },
            arrayState: [...insertedKeysSoFar],
            elementStates: Object.fromEntries(
              insertedKeysSoFar.map((_, i) => [i, 'comparing'])
            ),
            pointers: { imbalancedNode: node.key },
            activeAction: 'swap',
            treeState: exportTreeState(root, node.key, key),
            explanation: {
              text: `¡Desbalance detectado en nodo ${node.key}! Factor de balance BF = ${balance} (Caso Right-Left).`,
              subNote: 'Doble rotación requerida: primero Rotación Derecha en el hijo derecho, luego Rotación Izquierda en el padre.',
            },
            metrics: {
              comparisons: comparisonsCount,
              swaps: rotationsCount,
              passNumber,
            },
          });
          node.right = rotateRightInternal(node.right);
          return rotateLeftInternal(node);
        }
      }

      return node;
    }

    root = insert(cloneSubtree(root));

    // Frame: Inserción confirmada y balanceada
    rawFrames.push({
      highlightLines: { c: [70], python: [44] },
      arrayState: [...insertedKeysSoFar],
      elementStates: Object.fromEntries(
        insertedKeysSoFar.map((_, i) => [i, 'sorted'])
      ),
      pointers: { rootKey: root ? root.key : 0 },
      activeAction: 'locked',
      treeState: exportTreeState(root, null, key),
      explanation: {
        text: `Clave ${key} incorporada con éxito. Altura del árbol: ${getNodeHeight(root)}. Factor de balance raíz: ${getBalanceFactor(root)}.`,
        subNote: 'Todos los nodos del árbol satisfacen rigurosamente |BF| <= 1. Altura mínima garantizada.',
      },
      metrics: {
        comparisons: comparisonsCount,
        swaps: rotationsCount,
        passNumber,
      },
    });
  }

  const totalSteps = rawFrames.length;

  return rawFrames.map((rf, idx) => ({
    stepIndex: idx + 1,
    totalSteps,
    highlightLines: rf.highlightLines,
    arrayState: rf.arrayState,
    elementStates: rf.elementStates,
    pointers: rf.pointers,
    activeAction: rf.activeAction,
    treeState: rf.treeState,
    comparison: rf.comparison,
    explanation: {
      stepLabel: `Paso ${idx + 1} de ${totalSteps}:`,
      text: rf.explanation.text,
      subNote: rf.explanation.subNote,
    },
    metrics: {
      comparisons: rf.metrics.comparisons,
      swaps: rf.metrics.swaps,
      passNumber: rf.metrics.passNumber,
      totalPasses: passNumber,
      maxComparisons: keys.length * 3,
    },
  }));
}
