/**
 * AlgoNotebook — Topological Sort (Kahn's Algorithm) Pure Trace Generator
 *
 * Traza paso a paso sobre un Grafo Acíclico Dirigido (DAG) de 6 vértices (A..F).
 * Muestra el cálculo de grados de entrada (in-degree), la cola de fuentes disponibles,
 * la eliminación secuencial de aristas salientes y la emisión del orden topológico.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  GraphAlgorithmState,
  GraphNodeData,
  GraphEdgeData,
} from '../../../core/types';

export const CANONICAL_DAG_NODES: Record<string, { x: number; y: number; index: number }> = {
  A: { x: 140, y: 220, index: 0 },
  B: { x: 300, y: 130, index: 1 },
  C: { x: 300, y: 310, index: 2 },
  D: { x: 500, y: 130, index: 3 },
  E: { x: 500, y: 310, index: 4 },
  F: { x: 660, y: 220, index: 5 },
};

export const CANONICAL_DAG_EDGES: Array<{ id: string; from: string; to: string }> = [
  { id: 'e-A-B', from: 'A', to: 'B' },
  { id: 'e-A-C', from: 'A', to: 'C' },
  { id: 'e-B-D', from: 'B', to: 'D' },
  { id: 'e-C-D', from: 'C', to: 'D' },
  { id: 'e-C-E', from: 'C', to: 'E' },
  { id: 'e-D-F', from: 'D', to: 'F' },
  { id: 'e-E-F', from: 'E', to: 'F' },
];

const VERTEX_NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];

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

function createInitialNodes(): Record<string, GraphNodeData> {
  const nodes: Record<string, GraphNodeData> = {};
  for (const name of VERTEX_NAMES) {
    const info = CANONICAL_DAG_NODES[name];
    nodes[name] = {
      id: name,
      label: name,
      x: info.x,
      y: info.y,
      state: 'default',
    };
  }
  return nodes;
}

function cloneGraphState(
  nodes: Record<string, GraphNodeData>,
  edges: GraphEdgeData[],
  queue: string[],
  currentNodeId?: string | null,
  activeEdgeId?: string | null
): GraphAlgorithmState {
  const clonedNodes: Record<string, GraphNodeData> = {};
  for (const k of Object.keys(nodes)) {
    clonedNodes[k] = { ...nodes[k] };
  }
  return {
    nodes: clonedNodes,
    edges: edges.map((e) => ({ ...e })),
    currentNodeId: currentNodeId ?? null,
    activeEdgeId: activeEdgeId ?? null,
    queue: [...queue],
  };
}

export function generateTopologicalSortTrace(_initialInput?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];
  const nodes = createInitialNodes();
  const edges: GraphEdgeData[] = CANONICAL_DAG_EDGES.map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    state: 'default',
  }));

  // Grados de entrada iniciales
  const inDegree: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  for (const e of CANONICAL_DAG_EDGES) {
    inDegree[e.to]++;
  }

  const queue: string[] = [];
  const emittedOrder: number[] = [];
  let stepIndex = 0;
  let operations = 0;

  // Frame 1: Grafo DAG y cálculo de grados de entrada
  rawFrames.push({
    highlightLines: { c: [20, 21, 22, 23], python: [11, 12, 13] },
    arrayState: [],
    elementStates: {},
    pointers: {},
    activeAction: 'idle',
    graphState: cloneGraphState(nodes, edges, queue),
    explanation: {
      text: 'Iniciando Ordenamiento Topológico (Algoritmo de Kahn). Grafo Acíclico Dirigido (DAG) de 6 vértices.',
      subNote: `Grados de entrada calculados: ${VERTEX_NAMES.map((v) => `${v}:${inDegree[v]}`).join(', ')}.`,
    },
    metrics: {
      comparisons: operations,
      swaps: 0,
      passNumber: 0,
    },
  });

  // Encolar fuentes (in-degree == 0)
  for (const name of VERTEX_NAMES) {
    if (inDegree[name] === 0) {
      queue.push(name);
      nodes[name].state = 'comparing';
    }
  }

  // Frame 2: Fuentes detectadas
  rawFrames.push({
    highlightLines: { c: [27, 28, 29, 30], python: [16] },
    arrayState: [],
    elementStates: {},
    pointers: {},
    activeAction: 'pivot',
    graphState: cloneGraphState(nodes, edges, queue),
    explanation: {
      text: `Nodos fuente identificados (in-degree = 0): [${queue.join(', ')}]. Encolando en la cola de fuentes.`,
      subNote: 'Los vértices sin dependencias previas son los primeros candidatos válidos para emitir en el orden topológico.',
    },
    metrics: {
      comparisons: ++operations,
      swaps: 0,
      passNumber: 1,
    },
  });

  // Procesar cola
  while (queue.length > 0) {
    stepIndex++;
    const u = queue.shift()!;
    nodes[u].state = 'sorted';
    const uIdx = CANONICAL_DAG_NODES[u].index;
    emittedOrder.push(uIdx);

    // Frame: Desencolar y emitir u
    rawFrames.push({
      highlightLines: { c: [35, 36], python: [20, 21] },
      arrayState: [...emittedOrder],
      elementStates: Object.fromEntries(
        emittedOrder.map((_, i) => [i, 'sorted'])
      ),
      pointers: { currentVertex: uIdx },
      activeAction: 'locked',
      graphState: cloneGraphState(nodes, edges, queue, u),
      explanation: {
        text: `Paso #${stepIndex}: Desencolando y emitiendo vértice '${u}' al orden topológico.`,
        subNote: `Secuencia emitida actual: [${emittedOrder.map((idx) => VERTEX_NAMES[idx]).join(' -> ')}]. Cola activa: [${queue.join(', ')}].`,
      },
      metrics: {
        comparisons: ++operations,
        swaps: 0,
        passNumber: stepIndex,
      },
    });

    // Descontar vecinos de u
    const outgoing = CANONICAL_DAG_EDGES.filter((e) => e.from === u);
    for (const edge of outgoing) {
      const v = edge.to;
      inDegree[v]--;
      operations++;

      // Marcar arista como atravesada
      const edgeObj = edges.find((e) => e.id === edge.id);
      if (edgeObj) edgeObj.state = 'traversed';

      const becameSource = inDegree[v] === 0;
      if (becameSource) {
        queue.push(v);
        nodes[v].state = 'comparing';
      }

      // Frame: Eliminación de dependencia
      rawFrames.push({
        highlightLines: { c: [39, 40, 41, 42, 43], python: [23, 24, 25, 26] },
        arrayState: [...emittedOrder],
        elementStates: Object.fromEntries(
          emittedOrder.map((_, i) => [i, 'sorted'])
        ),
        pointers: { currentVertex: uIdx, targetVertex: CANONICAL_DAG_NODES[v].index },
        activeAction: becameSource ? 'pivot' : 'compare',
        graphState: cloneGraphState(nodes, edges, queue, u, edge.id),
        explanation: {
          text: `Eliminando arista de dependencia (${u} -> ${v}). Grado restante de ${v}: ${inDegree[v]}.`,
          subNote: becameSource
            ? `¡Todas las dependencias de '${v}' han sido resueltas (in-degree=0)! Encolando '${v}'.`
            : `El vértice '${v}' aún espera ${inDegree[v]} dependencia(s) previa(s).`,
        },
        metrics: {
          comparisons: operations,
          swaps: 0,
          passNumber: stepIndex,
        },
      });
    }
  }

  // Frame Final: Verificación de ciclo y conclusión
  const isValidDAG = emittedOrder.length === VERTEX_NAMES.length;
  rawFrames.push({
    highlightLines: { c: [47, 49], python: [28, 29] },
    arrayState: [...emittedOrder],
    elementStates: Object.fromEntries(
      emittedOrder.map((_, i) => [i, 'sorted'])
    ),
    pointers: {},
    activeAction: 'locked',
    graphState: cloneGraphState(nodes, edges, queue),
    explanation: {
      text: isValidDAG
        ? `Ordenamiento Topológico exitoso: ${emittedOrder.map((idx) => VERTEX_NAMES[idx]).join(' → ')}.`
        : 'Error: Ciclo detectado en el grafo. No admite ordenamiento topológico.',
      subNote: `Se emitieron ${emittedOrder.length} de ${VERTEX_NAMES.length} vértices en tiempo lineal O(V + E). El grafo es un DAG válido sin ciclos.`,
    },
    metrics: {
      comparisons: operations,
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
    graphState: rf.graphState,
    explanation: {
      stepLabel: `Paso ${idx + 1} de ${totalSteps}:`,
      text: rf.explanation.text,
      subNote: rf.explanation.subNote,
    },
    metrics: {
      comparisons: rf.metrics.comparisons,
      swaps: 0,
      passNumber: rf.metrics.passNumber,
      totalPasses: stepIndex,
      maxComparisons: CANONICAL_DAG_EDGES.length + VERTEX_NAMES.length,
    },
  }));
}
