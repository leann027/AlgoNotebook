/**
 * AlgoNotebook — Strongly Connected Components (Tarjan's SCC) Pure Trace Generator
 *
 * Traza completa paso a paso del algoritmo de Tarjan en un solo recorrido DFS en O(V + E).
 * Grafo dirigido canónico de 7 vértices con 3 componentes fuertemente conexas:
 * - SCC 1: {A, B, C}
 * - SCC 2: {D, E}
 * - SCC 3: {F, G}
 *
 * Visualiza discovery time (disc), low-link, pila de nodos activos y desapilado al detectar la raíz.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  GraphAlgorithmState,
  GraphNodeData,
  GraphEdgeData,
} from '../../../core/types';

export const SCC_NODES: Record<string, { x: number; y: number; index: number }> = {
  A: { x: 140, y: 150, index: 0 },
  B: { x: 280, y: 120, index: 1 },
  C: { x: 210, y: 280, index: 2 },
  D: { x: 420, y: 160, index: 3 },
  E: { x: 420, y: 310, index: 4 },
  F: { x: 620, y: 160, index: 5 },
  G: { x: 620, y: 310, index: 6 },
};

export const SCC_EDGES: Array<{ id: string; from: string; to: string }> = [
  { id: 'e-A-B', from: 'A', to: 'B' },
  { id: 'e-B-C', from: 'B', to: 'C' },
  { id: 'e-C-A', from: 'C', to: 'A' },
  { id: 'e-C-D', from: 'C', to: 'D' },
  { id: 'e-D-E', from: 'D', to: 'E' },
  { id: 'e-E-D', from: 'E', to: 'D' },
  { id: 'e-E-F', from: 'E', to: 'F' },
  { id: 'e-F-G', from: 'F', to: 'G' },
  { id: 'e-G-F', from: 'G', to: 'F' },
];

const VERTEX_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

interface RawFrame {
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  graphState: GraphAlgorithmState;
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

function buildGraphState(
  nodeStates: Record<string, ElementState>,
  activeEdgeId?: string | null,
  activeNodeId?: string | null,
  stack?: string[]
): GraphAlgorithmState {
  const nodes: Record<string, GraphNodeData> = {};
  for (const name of VERTEX_NAMES) {
    const info = SCC_NODES[name];
    nodes[name] = {
      id: name,
      label: name,
      x: info.x,
      y: info.y,
      state: nodeStates[name] ?? 'default',
    };
  }

  const edges: GraphEdgeData[] = SCC_EDGES.map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    state: e.id === activeEdgeId ? 'active' : 'default',
  }));

  return {
    nodes,
    edges,
    currentNodeId: activeNodeId ?? null,
    activeEdgeId: activeEdgeId ?? null,
    queue: stack ? [...stack] : [],
  };
}

export function generateStronglyConnectedComponentsTrace(_initialInput?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];
  const nodeStates: Record<string, ElementState> = {};
  for (const name of VERTEX_NAMES) nodeStates[name] = 'default';

  const disc: Record<string, number> = {};
  const low: Record<string, number> = {};
  const onStack: Record<string, boolean> = {};
  for (const name of VERTEX_NAMES) {
    disc[name] = 0;
    low[name] = 0;
    onStack[name] = false;
  }

  const stack: string[] = [];
  let timer = 0;
  let operations = 0;
  let sccExtractedCount = 0;

  // Frame 1: Inicialización
  rawFrames.push({
    highlightLines: { c: [55, 56, 57, 58], python: [9, 10, 11, 12, 13] },
    arrayState: [],
    elementStates: {},
    pointers: {},
    activeAction: 'idle',
    graphState: buildGraphState(nodeStates, null, null, stack),
    explanation: {
      text: 'Iniciando Algoritmo de Tarjan para Componentes Fuertemente Conexas (SCC).',
      subNote: 'Grafo dirigido de 7 nodos. Se utilizará una sola búsqueda DFS con marcas disc y low-link y una pila de recursión.',
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
    },
  });

  // Lista de adyacencia
  const adj: Record<string, string[]> = {
    A: ['B'],
    B: ['C'],
    C: ['A', 'D'],
    D: ['E'],
    E: ['D', 'F'],
    F: ['G'],
    G: ['F'],
  };

  function dfs(u: string) {
    timer++;
    disc[u] = low[u] = timer;
    stack.push(u);
    onStack[u] = true;
    nodeStates[u] = 'comparing';

    // Frame: Visitar u
    rawFrames.push({
      highlightLines: { c: [30, 31, 32], python: [17, 18, 19] },
      arrayState: stack.map((name) => SCC_NODES[name].index),
      elementStates: Object.fromEntries(stack.map((_, i) => [i, 'pointer'])),
      pointers: { currentVertex: SCC_NODES[u].index },
      activeAction: 'pivot',
      graphState: buildGraphState(nodeStates, null, u, stack),
      explanation: {
        text: `DFS ingresa a '${u}': disc[${u}] = ${disc[u]}, low[${u}] = ${low[u]}. Pila activa: [${stack.join(', ')}].`,
        subNote: `Marcando vértice '${u}' con marca de tiempo ${timer} y apilando en la frontera activa.`,
      },
      metrics: {
        comparisons: ++operations,
        swaps: sccExtractedCount,
        passNumber: timer,
      },
    });

    const neighbors = adj[u] ?? [];
    for (const v of neighbors) {
      operations++;
      const edgeId = `e-${u}-${v}`;

      if (disc[v] === 0) {
        // Arista de árbol
        rawFrames.push({
          highlightLines: { c: [37, 38, 39], python: [22, 23] },
          arrayState: stack.map((name) => SCC_NODES[name].index),
          elementStates: Object.fromEntries(stack.map((_, i) => [i, 'pointer'])),
          pointers: { currentVertex: SCC_NODES[u].index, nextVertex: SCC_NODES[v].index },
          activeAction: 'compare',
          graphState: buildGraphState(nodeStates, edgeId, u, stack),
          explanation: {
            text: `Explorando arista de árbol (${u} → ${v}): el vértice '${v}' aún no ha sido visitado.`,
            subNote: `Llamada recursiva DFS a '${v}'.`,
          },
          metrics: {
            comparisons: operations,
            swaps: sccExtractedCount,
            passNumber: timer,
          },
        });

        dfs(v);

        // Retorno de recursión: actualizar low[u]
        const prevLow = low[u];
        low[u] = Math.min(low[u], low[v]);

        rawFrames.push({
          highlightLines: { c: [40], python: [24] },
          arrayState: stack.map((name) => SCC_NODES[name].index),
          elementStates: Object.fromEntries(stack.map((_, i) => [i, 'pointer'])),
          pointers: { currentVertex: SCC_NODES[u].index },
          activeAction: 'compare',
          graphState: buildGraphState(nodeStates, edgeId, u, stack),
          explanation: {
            text: `Retorno de DFS('${v}') a '${u}': actualizando low[${u}] = min(low[${u}], low[${v}]) = min(${prevLow}, ${low[v]}) = ${low[u]}.`,
            subNote: `El subárbol de '${v}' ${low[v] < prevLow ? 'encontró un camino a un ancestro' : 'no ofrece ancestros más antiguos'}.`,
          },
          metrics: {
            comparisons: operations,
            swaps: sccExtractedCount,
            passNumber: timer,
          },
        });
      } else if (onStack[v]) {
        // Arista de retroceso hacia la misma SCC
        const prevLow = low[u];
        low[u] = Math.min(low[u], disc[v]);

        rawFrames.push({
          highlightLines: { c: [42, 43], python: [25, 26] },
          arrayState: stack.map((name) => SCC_NODES[name].index),
          elementStates: Object.fromEntries(stack.map((_, i) => [i, 'pointer'])),
          pointers: { currentVertex: SCC_NODES[u].index, backVertex: SCC_NODES[v].index },
          activeAction: 'swap',
          graphState: buildGraphState(nodeStates, edgeId, u, stack),
          explanation: {
            text: `¡Arista de retroceso detectada (${u} → ${v})! '${v}' ya está en la pila activa.`,
            subNote: `Actualizando low[${u}] = min(low[${u}], disc[${v}]) = min(${prevLow}, ${disc[v]}) = ${low[u]}. Cierra un ciclo fuertemente conexo.`,
          },
          metrics: {
            comparisons: operations,
            swaps: sccExtractedCount,
            passNumber: timer,
          },
        });
      }
    }

    // Comprobación de raíz de SCC
    if (low[u] === disc[u]) {
      sccExtractedCount++;
      const extractedNodes: string[] = [];

      while (stack.length > 0) {
        const w = stack.pop()!;
        onStack[w] = false;
        nodeStates[w] = 'sorted';
        extractedNodes.push(w);
        if (w === u) break;
      }

      rawFrames.push({
        highlightLines: { c: [47, 48, 49, 50, 51, 52], python: [29, 30, 31, 32, 33, 34, 35, 36] },
        arrayState: extractedNodes.map((name) => SCC_NODES[name].index),
        elementStates: Object.fromEntries(extractedNodes.map((_, i) => [i, 'sorted'])),
        pointers: { rootVertex: SCC_NODES[u].index },
        activeAction: 'locked',
        graphState: buildGraphState(nodeStates, null, u, stack),
        explanation: {
          text: `¡Raíz de SCC detectada en '${u}' (low[${u}] == disc[${u}] == ${low[u]})! Desapilando SCC #${sccExtractedCount}: {${extractedNodes.reverse().join(', ')}}.`,
          subNote: `Componente maximal fuertemente conexa extraída y confirmada en tiempo O(V+E). Pila restante: [${stack.join(', ')}].`,
        },
        metrics: {
          comparisons: operations,
          swaps: sccExtractedCount,
          passNumber: timer,
        },
      });
    }
  }

  // Recorrer todos los vértices
  for (const name of VERTEX_NAMES) {
    if (disc[name] === 0) {
      dfs(name);
    }
  }

  // Frame Final
  rawFrames.push({
    highlightLines: { c: [68, 69], python: [39, 40] },
    arrayState: VERTEX_NAMES.map((name) => SCC_NODES[name].index),
    elementStates: Object.fromEntries(VERTEX_NAMES.map((_, i) => [i, 'sorted'])),
    pointers: {},
    activeAction: 'locked',
    graphState: buildGraphState(nodeStates, null, null, []),
    explanation: {
      text: `Algoritmo de Tarjan finalizado: Se extrajeron ${sccExtractedCount} Componentes Fuertemente Conexas maximales.`,
      subNote: 'SCC 1: {A, B, C} | SCC 2: {D, E} | SCC 3: {F, G}. El grafo condensado de componentes forma un DAG puro.',
    },
    metrics: {
      comparisons: operations,
      swaps: sccExtractedCount,
      passNumber: timer,
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
    graphState: rf.graphState,
    explanation: {
      stepLabel: `Paso ${idx + 1} de ${totalSteps}:`,
      text: rf.explanation.text,
      subNote: rf.explanation.subNote,
    },
    metrics: {
      comparisons: rf.metrics.comparisons,
      swaps: rf.metrics.swaps,
      passNumber: rf.metrics.passNumber,
      totalPasses: sccExtractedCount,
      maxComparisons: SCC_EDGES.length + VERTEX_NAMES.length,
    },
  }));
}
