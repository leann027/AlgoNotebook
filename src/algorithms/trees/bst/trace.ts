/**
 * AlgoNotebook — Binary Search Tree (BST) Insertion Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Manejo recursivo de pila simulada `callStack: StackFrame[]`.
 * - Inserción jerárquica con actualización de TreeAlgorithmState.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  TreeAlgorithmState,
  TreeNodeData,
  StackFrame,
  TraceEvent,
  TraceSnapshot,
  ComparisonDetails,
} from '../../../core/types';

/**
 * Secuencia de claves por defecto según especificación pedagógica.
 */
export const DEFAULT_BST_KEYS: readonly number[] = [15, 8, 23, 4, 11, 19, 30];

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
    insertedNodes?: number;
    treeHeight?: number;
  };
  event?: TraceEvent;
  snapshot?: TraceSnapshot;
}

/**
 * Clona inmutablemente el mapa de nodos del árbol.
 */
function cloneNodes(nodes: Record<string, TreeNodeData>): Record<string, TreeNodeData> {
  const cloned: Record<string, TreeNodeData> = {};
  for (const [id, node] of Object.entries(nodes)) {
    cloned[id] = { ...node };
  }
  return cloned;
}

/**
 * Clona inmutablemente la pila de llamadas.
 */
function cloneCallStack(stack: StackFrame[]): StackFrame[] {
  return stack.map((frame) => ({
    ...frame,
    args: { ...frame.args },
  }));
}

/**
 * Calcula recursivamente la altura del árbol binario.
 * Un árbol vacío tiene altura 0; un árbol de un solo nodo tiene altura 1.
 */
function computeTreeHeight(
  nodes: Record<string, TreeNodeData>,
  rootId: string | null | undefined
): number {
  if (!rootId || !nodes[rootId]) return 0;
  const node = nodes[rootId];
  const leftH = node.leftId ? computeTreeHeight(nodes, node.leftId) : 0;
  const rightH = node.rightId ? computeTreeHeight(nodes, node.rightId) : 0;
  return 1 + Math.max(leftH, rightH);
}

/**
 * Generador puro y síncrono de fotogramas de ejecución para la inserción secuencial en BST.
 *
 * @param keys Arreglo numérico de claves a insertar (por defecto [15, 8, 23, 4, 11, 19, 30]).
 * @returns Lista inmutable de fotogramas paso a paso (TraceFrame[]).
 */
export function generateBSTInsertTrace(keys?: number[]): TraceFrame[] {
  const rawInput = Array.isArray(keys) && keys.length > 0 ? keys : [...DEFAULT_BST_KEYS];
  // Sanitizar asegurando números enteros positivos
  const inputKeys = rawInput.filter((k) => typeof k === 'number' && !Number.isNaN(k));
  const finalKeys = inputKeys.length > 0 ? inputKeys : [...DEFAULT_BST_KEYS];

  const totalKeys = finalKeys.length;
  // Cota teórica de comparaciones esperadas O(N log N)
  const theoreticalMax = Math.round(totalKeys * Math.ceil(Math.log2(Math.max(2, totalKeys) + 1)));

  const rawFrames: RawFrame[] = [];
  const nodesMap: Record<string, TreeNodeData> = {};
  let rootId: string | null = null;

  let comparisons = 0;
  let insertedCount = 0;
  let callCounter = 0;
  const callStack: StackFrame[] = [];

  // Pila de llamadas auxiliar
  function pushCall(functionName: string, args: Record<string, string | number>): void {
    callCounter++;
    for (const f of callStack) {
      f.isActive = false;
    }
    callStack.push({
      id: `call-${callCounter}`,
      functionName,
      args,
      isActive: true,
    });
  }

  function popCall(): void {
    callStack.pop();
    if (callStack.length > 0) {
      callStack[callStack.length - 1].isActive = true;
    }
  }

  // Genera el estado de los elementos del arreglo lineal
  function buildArrayElementStates(
    currentKeyIndex: number,
    action: ElementState
  ): Record<number, ElementState> {
    const states: Record<number, ElementState> = {};
    for (let i = 0; i < totalKeys; i++) {
      if (i < currentKeyIndex) {
        states[i] = 'sorted';
      } else if (i === currentKeyIndex) {
        states[i] = action;
      } else {
        states[i] = 'default';
      }
    }
    return states;
  }

  // Inserta cada clave secuencialmente en el árbol
  for (let keyIdx = 0; keyIdx < totalKeys; keyIdx++) {
    const key = finalKeys[keyIdx];
    const passNumber = keyIdx + 1;
    const currentVisitedPath: string[] = [];

    // Resetear estados visuales temporales de los nodos antes de insertar la siguiente clave
    for (const id of Object.keys(nodesMap)) {
      nodesMap[id].state = 'default';
    }

    // ------------------------------------------------------------------------
    // FOTOGRAMA 1: Llegada de la nueva clave y llamada inicial a insert(root, key)
    // ------------------------------------------------------------------------
    pushCall('insert', {
      root: rootId ? `Node(${nodesMap[rootId].value})` : 'NULL',
      key,
    });

    rawFrames.push({
      highlightLines: {
        c: [18],
        python: [7],
      },
      arrayState: [...finalKeys],
      elementStates: buildArrayElementStates(keyIdx, 'pointer'),
      pointers: { key: keyIdx },
      activeAction: 'idle',
      callStack: cloneCallStack(callStack),
      treeState: {
        rootId,
        nodes: cloneNodes(nodesMap),
        activeNodeId: null,
        insertedNodeId: null,
        visitedPath: [],
        currentKey: key,
      },
      explanation: {
        text: `Iniciando inserción de la clave ${key} en el Árbol Binario de Búsqueda.`,
        subNote: rootId
          ? `Llamada a insert(root, ${key}) con raíz existente (nodo con valor ${nodesMap[rootId].value}).`
          : 'El árbol está vacío (root == NULL). La nueva clave se convertirá en la raíz.',
      },
      metrics: {
        comparisons,
        swaps: insertedCount,
        passNumber,
        totalPasses: totalKeys,
        maxComparisons: theoreticalMax,
        insertedNodes: insertedCount,
        treeHeight: computeTreeHeight(nodesMap, rootId),
      },
      event: { type: 'pointer', name: 'key', index: keyIdx },
      snapshot: {
        kind: 'idle',
        arrayState: [...finalKeys],
        elementStates: buildArrayElementStates(keyIdx, 'pointer'),
        pointers: { key: keyIdx },
      },
    });

    // ------------------------------------------------------------------------
    // Función recursiva que traza la inserción paso a paso
    // ------------------------------------------------------------------------
    function traceInsert(
      currentNodeId: string | null,
      parentId: string | null,
      branch: 'left' | 'right' | null
    ): string {
      // 1. Verificación de caso base: if (root == NULL) / if root is None
      rawFrames.push({
        highlightLines: {
          c: [19],
          python: [8],
        },
        arrayState: [...finalKeys],
        elementStates: buildArrayElementStates(keyIdx, 'comparing'),
        pointers: { key: keyIdx },
        activeAction: 'compare',
        callStack: cloneCallStack(callStack),
        treeState: {
          rootId,
          nodes: cloneNodes(nodesMap),
          activeNodeId: currentNodeId,
          insertedNodeId: null,
          visitedPath: [...currentVisitedPath],
          currentKey: key,
        },
        explanation: {
          text: currentNodeId === null
            ? `Condición base alcanzada: puntero root == NULL (posición vacía).`
            : `Evaluando root == NULL: FALSO. El nodo existe con valor ${nodesMap[currentNodeId].value}.`,
          subNote: currentNodeId === null
            ? `Se procede a crear y asignar un nuevo nodo hoja para la clave ${key}.`
            : `Avanzando a comparar la clave ${key} con el valor del nodo.`,
        },
        metrics: {
          comparisons,
          swaps: insertedCount,
          passNumber,
          totalPasses: totalKeys,
          maxComparisons: theoreticalMax,
          insertedNodes: insertedCount,
          treeHeight: computeTreeHeight(nodesMap, rootId),
        },
        event: {
          type: 'compare',
          leftIndex: keyIdx,
          rightIndex: -1,
          leftValue: key,
          rightValue: currentNodeId ? nodesMap[currentNodeId].value : 0,
          conditionMet: currentNodeId === null,
        },
      });

      // CASO BASE: Posición vacía encontrada -> Crear nuevo nodo
      if (currentNodeId === null) {
        const newNodeId = `node-${key}`;
        nodesMap[newNodeId] = {
          id: newNodeId,
          value: key,
          leftId: null,
          rightId: null,
          state: 'sorted',
        };
        insertedCount++;

        // Enlazar con el nodo padre
        if (parentId && branch && nodesMap[parentId]) {
          if (branch === 'left') {
            nodesMap[parentId].leftId = newNodeId;
          } else {
            nodesMap[parentId].rightId = newNodeId;
          }
        } else {
          // Es la raíz del árbol
          rootId = newNodeId;
        }

        currentVisitedPath.push(newNodeId);

        // Fotograma de inserción completada (color menta / sorted)
        rawFrames.push({
          highlightLines: {
            c: [20],
            python: [9],
          },
          arrayState: [...finalKeys],
          elementStates: buildArrayElementStates(keyIdx, 'sorted'),
          pointers: { key: keyIdx },
          activeAction: 'locked',
          callStack: cloneCallStack(callStack),
          treeState: {
            rootId,
            nodes: cloneNodes(nodesMap),
            activeNodeId: newNodeId,
            insertedNodeId: newNodeId,
            visitedPath: [...currentVisitedPath],
            currentKey: key,
          },
          explanation: {
            text: parentId
              ? `Nodo con valor ${key} creado e insertado exitosamente como hijo ${branch === 'left' ? 'izquierdo' : 'derecho'} de ${nodesMap[parentId].value}.`
              : `Nodo raíz con valor ${key} creado exitosamente en memoria.`,
            subNote: `Resaltado en menta (#BBF7D0). El invariante BST queda preservado.`,
          },
          metrics: {
            comparisons,
            swaps: insertedCount,
            passNumber,
            totalPasses: totalKeys,
            maxComparisons: theoreticalMax,
            insertedNodes: insertedCount,
            treeHeight: computeTreeHeight(nodesMap, rootId),
          },
          event: { type: 'locked', index: keyIdx, value: key },
          snapshot: {
            kind: 'locked',
            lockedIndex: keyIdx,
            arrayState: [...finalKeys],
            elementStates: buildArrayElementStates(keyIdx, 'sorted'),
            pointers: { key: keyIdx },
          },
        });

        return newNodeId;
      }

      // NODO EXISTENTE: Recorrer el árbol
      const currNode = nodesMap[currentNodeId];
      currentVisitedPath.push(currentNodeId);
      currNode.state = 'comparing';

      // 2. Comparación Izquierda: key < root->data / key < root.val
      comparisons++;
      const isSmaller = key < currNode.value;

      rawFrames.push({
        highlightLines: {
          c: [22],
          python: [10],
        },
        arrayState: [...finalKeys],
        elementStates: buildArrayElementStates(keyIdx, 'comparing'),
        pointers: { key: keyIdx },
        activeAction: 'compare',
        callStack: cloneCallStack(callStack),
        treeState: {
          rootId,
          nodes: cloneNodes(nodesMap),
          activeNodeId: currentNodeId,
          insertedNodeId: null,
          visitedPath: [...currentVisitedPath],
          currentKey: key,
        },
        comparison: {
          leftIndex: keyIdx,
          rightIndex: -1,
          leftValue: key,
          rightValue: currNode.value,
          conditionMet: isSmaller,
        },
        explanation: {
          text: `Comparando: ¿es ${key} < ${currNode.value}? → ${isSmaller ? 'VERDADERO' : 'FALSO'}.`,
          subNote: isSmaller
            ? `Por propiedad BST, valores menores pertenecen al subárbol izquierdo.`
            : `La clave no es menor; se verificará la rama derecha.`,
        },
        metrics: {
          comparisons,
          swaps: insertedCount,
          passNumber,
          totalPasses: totalKeys,
          maxComparisons: theoreticalMax,
          insertedNodes: insertedCount,
          treeHeight: computeTreeHeight(nodesMap, rootId),
        },
        event: {
          type: 'compare',
          leftIndex: keyIdx,
          rightIndex: -1,
          leftValue: key,
          rightValue: currNode.value,
          conditionMet: isSmaller,
        },
      });

      if (isSmaller) {
        // Desplazamiento recursivo a la izquierda
        currNode.state = 'pointer';

        rawFrames.push({
          highlightLines: {
            c: [23],
            python: [11],
          },
          arrayState: [...finalKeys],
          elementStates: buildArrayElementStates(keyIdx, 'pointer'),
          pointers: { key: keyIdx },
          activeAction: 'idle',
          callStack: cloneCallStack(callStack),
          treeState: {
            rootId,
            nodes: cloneNodes(nodesMap),
            activeNodeId: currentNodeId,
            insertedNodeId: null,
            visitedPath: [...currentVisitedPath],
            currentKey: key,
          },
          explanation: {
            text: `Desplazando puntero hacia la izquierda: insert(root->left, ${key}).`,
            subNote: `Descendiendo recursivamente por la arista izquierda L.`,
          },
          metrics: {
            comparisons,
            swaps: insertedCount,
            passNumber,
            totalPasses: totalKeys,
            maxComparisons: theoreticalMax,
            insertedNodes: insertedCount,
            treeHeight: computeTreeHeight(nodesMap, rootId),
          },
          event: { type: 'pointer', name: 'left', index: keyIdx },
        });

        // Llamada recursiva a la izquierda
        pushCall('insert', {
          root: currNode.leftId ? `Node(${nodesMap[currNode.leftId].value})` : 'NULL',
          key,
        });

        const childId = traceInsert(currNode.leftId ?? null, currentNodeId, 'left');
        currNode.leftId = childId;

        // Retorno de la recursión izquierda
        popCall();

        rawFrames.push({
          highlightLines: {
            c: [27],
            python: [14],
          },
          arrayState: [...finalKeys],
          elementStates: buildArrayElementStates(keyIdx, 'sorted'),
          pointers: { key: keyIdx },
          activeAction: 'idle',
          callStack: cloneCallStack(callStack),
          treeState: {
            rootId,
            nodes: cloneNodes(nodesMap),
            activeNodeId: currentNodeId,
            insertedNodeId: null,
            visitedPath: [...currentVisitedPath],
            currentKey: key,
          },
          explanation: {
            text: `Retorno de llamada recursiva izquierda a nodo ${currNode.value}. Devolviendo puntero root.`,
            subNote: `Enlace del hijo izquierdo completado. Subárbol balanceado.`,
          },
          metrics: {
            comparisons,
            swaps: insertedCount,
            passNumber,
            totalPasses: totalKeys,
            maxComparisons: theoreticalMax,
            insertedNodes: insertedCount,
            treeHeight: computeTreeHeight(nodesMap, rootId),
          },
          event: { type: 'idle' },
        });

        return currentNodeId;
      }

      // 3. Comparación Derecha: else if (key > root->data) / elif key > root.val
      comparisons++;
      const isGreater = key > currNode.value;

      rawFrames.push({
        highlightLines: {
          c: [24],
          python: [12],
        },
        arrayState: [...finalKeys],
        elementStates: buildArrayElementStates(keyIdx, 'comparing'),
        pointers: { key: keyIdx },
        activeAction: 'compare',
        callStack: cloneCallStack(callStack),
        treeState: {
          rootId,
          nodes: cloneNodes(nodesMap),
          activeNodeId: currentNodeId,
          insertedNodeId: null,
          visitedPath: [...currentVisitedPath],
          currentKey: key,
        },
        comparison: {
          leftIndex: keyIdx,
          rightIndex: -1,
          leftValue: key,
          rightValue: currNode.value,
          conditionMet: isGreater,
        },
        explanation: {
          text: `Comparando: ¿es ${key} > ${currNode.value}? → ${isGreater ? 'VERDADERO' : 'FALSO'}.`,
          subNote: isGreater
            ? `Por propiedad BST, valores mayores pertenecen al subárbol derecho.`
            : `Clave duplicada encontrada (${key} == ${currNode.value}).`,
        },
        metrics: {
          comparisons,
          swaps: insertedCount,
          passNumber,
          totalPasses: totalKeys,
          maxComparisons: theoreticalMax,
          insertedNodes: insertedCount,
          treeHeight: computeTreeHeight(nodesMap, rootId),
        },
        event: {
          type: 'compare',
          leftIndex: keyIdx,
          rightIndex: -1,
          leftValue: key,
          rightValue: currNode.value,
          conditionMet: isGreater,
        },
      });

      if (isGreater) {
        // Desplazamiento recursivo a la derecha
        currNode.state = 'pointer';

        rawFrames.push({
          highlightLines: {
            c: [25],
            python: [13],
          },
          arrayState: [...finalKeys],
          elementStates: buildArrayElementStates(keyIdx, 'pointer'),
          pointers: { key: keyIdx },
          activeAction: 'idle',
          callStack: cloneCallStack(callStack),
          treeState: {
            rootId,
            nodes: cloneNodes(nodesMap),
            activeNodeId: currentNodeId,
            insertedNodeId: null,
            visitedPath: [...currentVisitedPath],
            currentKey: key,
          },
          explanation: {
            text: `Desplazando puntero hacia la derecha: insert(root->right, ${key}).`,
            subNote: `Descendiendo recursivamente por la arista derecha R.`,
          },
          metrics: {
            comparisons,
            swaps: insertedCount,
            passNumber,
            totalPasses: totalKeys,
            maxComparisons: theoreticalMax,
            insertedNodes: insertedCount,
            treeHeight: computeTreeHeight(nodesMap, rootId),
          },
          event: { type: 'pointer', name: 'right', index: keyIdx },
        });

        // Llamada recursiva a la derecha
        pushCall('insert', {
          root: currNode.rightId ? `Node(${nodesMap[currNode.rightId].value})` : 'NULL',
          key,
        });

        const childId = traceInsert(currNode.rightId ?? null, currentNodeId, 'right');
        currNode.rightId = childId;

        // Retorno de la recursión derecha
        popCall();

        rawFrames.push({
          highlightLines: {
            c: [27],
            python: [14],
          },
          arrayState: [...finalKeys],
          elementStates: buildArrayElementStates(keyIdx, 'sorted'),
          pointers: { key: keyIdx },
          activeAction: 'idle',
          callStack: cloneCallStack(callStack),
          treeState: {
            rootId,
            nodes: cloneNodes(nodesMap),
            activeNodeId: currentNodeId,
            insertedNodeId: null,
            visitedPath: [...currentVisitedPath],
            currentKey: key,
          },
          explanation: {
            text: `Retorno de llamada recursiva derecha a nodo ${currNode.value}. Devolviendo puntero root.`,
            subNote: `Enlace del hijo derecho completado. Subárbol balanceado.`,
          },
          metrics: {
            comparisons,
            swaps: insertedCount,
            passNumber,
            totalPasses: totalKeys,
            maxComparisons: theoreticalMax,
            insertedNodes: insertedCount,
            treeHeight: computeTreeHeight(nodesMap, rootId),
          },
          event: { type: 'idle' },
        });

        return currentNodeId;
      }

      // Clave duplicada: retornar root directamente
      rawFrames.push({
        highlightLines: {
          c: [27],
          python: [14],
        },
        arrayState: [...finalKeys],
        elementStates: buildArrayElementStates(keyIdx, 'sorted'),
        pointers: { key: keyIdx },
        activeAction: 'idle',
        callStack: cloneCallStack(callStack),
        treeState: {
          rootId,
          nodes: cloneNodes(nodesMap),
          activeNodeId: currentNodeId,
          insertedNodeId: null,
          visitedPath: [...currentVisitedPath],
          currentKey: key,
        },
        explanation: {
          text: `La clave ${key} ya existe en el árbol. Se omite duplicado y se retorna root.`,
          subNote: `Propiedad de elementos únicos preservada.`,
        },
        metrics: {
          comparisons,
          swaps: insertedCount,
          passNumber,
          totalPasses: totalKeys,
          maxComparisons: theoreticalMax,
          insertedNodes: insertedCount,
          treeHeight: computeTreeHeight(nodesMap, rootId),
        },
        event: { type: 'idle' },
      });

      return currentNodeId;
    }

    // Ejecutar inserción recursiva para la clave actual
    traceInsert(rootId, null, null);

    // Limpiar llamada de la clave terminada
    popCall();
  }

  // --------------------------------------------------------------------------
  // FOTOGRAMA FINAL: Todas las claves insertadas y árbol completo
  // --------------------------------------------------------------------------
  const finalElementStates: Record<number, ElementState> = {};
  for (let i = 0; i < totalKeys; i++) {
    finalElementStates[i] = 'sorted';
  }

  for (const id of Object.keys(nodesMap)) {
    nodesMap[id].state = 'sorted';
  }

  const finalHeight = computeTreeHeight(nodesMap, rootId);

  rawFrames.push({
    highlightLines: {
      c: [27],
      python: [14],
    },
    arrayState: [...finalKeys],
    elementStates: finalElementStates,
    pointers: {},
    activeAction: 'locked',
    callStack: [],
    treeState: {
      rootId,
      nodes: cloneNodes(nodesMap),
      activeNodeId: null,
      insertedNodeId: null,
      visitedPath: [],
      currentKey: null,
    },
    explanation: {
      text: `Inserción BST completada. Se insertaron ${insertedCount} nodos manteniendo el invariante binario.`,
      subNote: `Altura final del árbol: ${finalHeight} niveles. Comparaciones totales: ${comparisons}. Todos los nodos satisfacen izq < raíz < der.`,
    },
    metrics: {
      comparisons,
      swaps: insertedCount,
      passNumber: totalKeys,
      totalPasses: totalKeys,
      maxComparisons: theoreticalMax,
      insertedNodes: insertedCount,
      treeHeight: finalHeight,
    },
    event: { type: 'idle' },
    snapshot: {
      kind: 'idle',
      arrayState: [...finalKeys],
      elementStates: finalElementStates,
      pointers: {},
    },
  });

  // Cálculo e inmutabilidad de totalSteps y stepIndex (1-based)
  const totalSteps = rawFrames.length;

  return rawFrames.map((frame, index) => {
    const stepIndex = index + 1;
    return {
      ...frame,
      stepIndex,
      totalSteps,
      explanation: {
        stepLabel: `Step ${stepIndex} of ${totalSteps}:`,
        text: frame.explanation.text,
        subNote: frame.explanation.subNote,
      },
    };
  });
}

