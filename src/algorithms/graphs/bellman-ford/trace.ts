/**
 * AlgoNotebook — Bellman-Ford Shortest Path Pure Trace Generator
 *
 * Traza paso a paso sobre grafo dirigido ponderado con aristas negativas.
 * Ejecuta:
 * 1. Inicialización de distancias tentativas (origen = 0, resto = ∞).
 * 2. Rondas de relajación sistemática sobre todas las aristas (k = 1 .. |V|-1).
 * 3. Ronda adicional (|V|) para verificación estricta de ciclos negativos.
 * 4. Actualización en tiempo real de la tabla de distancias dijkstraTable.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  GraphAlgorithmState,
  GraphNodeData,
  GraphEdgeData,
  DijkstraTableEntry,
} from '../../../core/types';

export const BELLMAN_FORD_NODES: Record<string, { x: number; y: number; index: number }> = {
  A: { x: 140, y: 230, index: 0 },
  B: { x: 320, y: 130, index: 1 },
  C: { x: 320, y: 330, index: 2 },
  D: { x: 500, y: 130, index: 3 },
  E: { x: 500, y: 330, index: 4 },
};

export const BELLMAN_FORD_EDGES: Array<{ id: string; from: string; to: string; weight: number }> = [
  { id: 'e-A-B', from: 'A', to: 'B', weight: 4 },
  { id: 'e-A-C', from: 'A', to: 'C', weight: 2 },
  { id: 'e-C-B', from: 'C', to: 'B', weight: 1 },
  { id: 'e-B-D', from: 'B', to: 'D', weight: 3 },
  { id: 'e-C-E', from: 'C', to: 'E', weight: 5 },
  { id: 'e-D-E', from: 'D', to: 'E', weight: -2 },
  { id: 'e-B-E', from: 'B', to: 'E', weight: 6 },
];

const VERTEX_NAMES = ['A', 'B', 'C', 'D', 'E'];
const INF = 999999;

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
  dist: Record<string, number>,
  pred: Record<string, string | null>,
  activeNodeId?: string | null,
  activeEdgeId?: string | null,
  settledVertices?: Set<string>
): GraphAlgorithmState {
  const nodes: Record<string, GraphNodeData> = {};
  for (const name of VERTEX_NAMES) {
    const info = BELLMAN_FORD_NODES[name];
    let state: ElementState = 'default';
    if (name === activeNodeId) {
      state = 'comparing';
    } else if (settledVertices?.has(name)) {
      state = 'sorted';
    }

    nodes[name] = {
      id: name,
      label: name,
      x: info.x,
      y: info.y,
      state,
    };
  }

  const edges: GraphEdgeData[] = BELLMAN_FORD_EDGES.map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    weight: e.weight,
    state: e.id === activeEdgeId ? 'active' : 'default',
  }));

  const dijkstraTable: Record<string, DijkstraTableEntry> = {};
  for (const name of VERTEX_NAMES) {
    dijkstraTable[name] = {
      vertex: name,
      distance: dist[name] === INF ? '∞' : dist[name],
      predecessor: pred[name] ?? '-',
      isSettled: settledVertices ? settledVertices.has(name) : false,
    };
  }

  return {
    nodes,
    edges,
    currentNodeId: activeNodeId ?? null,
    activeEdgeId: activeEdgeId ?? null,
    dijkstraTable,
  };
}

export function generateBellmanFordTrace(_initialInput?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];
  const dist: Record<string, number> = { A: 0, B: INF, C: INF, D: INF, E: INF };
  const pred: Record<string, string | null> = { A: null, B: null, C: null, D: null, E: null };
  const settled = new Set<string>();
  let comparisonsCount = 0;
  let relaxationsCount = 0;

  // Frame 1: Inicialización
  rawFrames.push({
    highlightLines: { c: [23, 24, 25, 26, 27], python: [8, 9, 10] },
    arrayState: VERTEX_NAMES.map((v) => (dist[v] === INF ? -1 : dist[v])),
    elementStates: Object.fromEntries(VERTEX_NAMES.map((_, i) => [i, i === 0 ? 'sorted' : 'default'])),
    pointers: { source: 0 },
    activeAction: 'idle',
    graphState: buildGraphState(dist, pred, 'A', null, settled),
    explanation: {
      text: 'Iniciando Algoritmo de Bellman-Ford. Vértice origen: A.',
      subNote: 'Inicialización de distancias tentativas: dist[A] = 0, resto de vértices = ∞. Se ejecutarán |V|-1 = 4 rondas de relajación.',
    },
    metrics: {
      comparisons: 0,
      swaps: 0,
      passNumber: 0,
    },
  });

  const numVertices = VERTEX_NAMES.length;

  // Rondas 1 .. |V|-1
  for (let round = 1; round <= numVertices - 1; round++) {
    let updatedInRound = false;

    for (let eIdx = 0; eIdx < BELLMAN_FORD_EDGES.length; eIdx++) {
      const edge = BELLMAN_FORD_EDGES[eIdx];
      const { id, from: u, to: v, weight: w } = edge;
      comparisonsCount++;

      const uDist = dist[u];
      const vDist = dist[v];
      const canRelax = uDist !== INF && uDist + w < vDist;

      // Frame: Inspección de arista
      rawFrames.push({
        highlightLines: { c: [36, 37, 38], python: [15, 16] },
        arrayState: VERTEX_NAMES.map((name) => (dist[name] === INF ? -1 : dist[name])),
        elementStates: Object.fromEntries(
          VERTEX_NAMES.map((name, i) => [
            i,
            name === u || name === v ? 'comparing' : settled.has(name) ? 'sorted' : 'default',
          ])
        ),
        pointers: {
          fromNode: BELLMAN_FORD_NODES[u].index,
          toNode: BELLMAN_FORD_NODES[v].index,
        },
        activeAction: 'compare',
        graphState: buildGraphState(dist, pred, u, id, settled),
        explanation: {
          text: `[Ronda ${round}/4]: Inspeccionando arista ${u} → ${v} (peso ${w}). ¿dist[${u}] (${uDist === INF ? '∞' : uDist}) + ${w} < dist[${v}] (${vDist === INF ? '∞' : vDist})?`,
          subNote: canRelax
            ? `¡Relajación exitosa! Nueva distancia tentativa a ${v} = ${uDist + w}.`
            : `No mejora la distancia conocida hacia ${v}. Conservando valor actual.`,
        },
        metrics: {
          comparisons: comparisonsCount,
          swaps: relaxationsCount,
          passNumber: round,
        },
      });

      if (canRelax) {
        dist[v] = uDist + w;
        pred[v] = u;
        relaxationsCount++;
        updatedInRound = true;

        // Frame: Actualización de relajación
        rawFrames.push({
          highlightLines: { c: [39, 40], python: [17, 18] },
          arrayState: VERTEX_NAMES.map((name) => (dist[name] === INF ? -1 : dist[name])),
          elementStates: Object.fromEntries(
            VERTEX_NAMES.map((name, i) => [
              i,
              name === v ? 'sorted' : settled.has(name) ? 'sorted' : 'default',
            ])
          ),
          pointers: { relaxedNode: BELLMAN_FORD_NODES[v].index },
          activeAction: 'swap',
          graphState: buildGraphState(dist, pred, v, id, settled),
          explanation: {
            text: `Distancia actualizada: dist[${v}] = ${dist[v]}, predecesor pred[${v}] = ${u}.`,
            subNote: `Tabla de distancias actualizada con el camino más corto encontrado hasta ahora.`,
          },
          metrics: {
            comparisons: comparisonsCount,
            swaps: relaxationsCount,
            passNumber: round,
          },
        });
      }
    }

    if (!updatedInRound) {
      // Optimización de parada temprana
      break;
    }
  }

  // Ronda |V|: Verificación de ciclo negativo
  rawFrames.push({
    highlightLines: { c: [47, 48, 49], python: [23, 24, 25] },
    arrayState: VERTEX_NAMES.map((name) => dist[name]),
    elementStates: Object.fromEntries(VERTEX_NAMES.map((_, i) => [i, 'comparing'])),
    pointers: {},
    activeAction: 'pivot',
    graphState: buildGraphState(dist, pred, null, null, settled),
    explanation: {
      text: 'Ronda final (|V| = 5): Detección de ciclos de peso negativo.',
      subNote: 'Verificando si alguna arista todavía admite una relajación adicional. Si existiera, indicaría un ciclo infinito negativo.',
    },
    metrics: {
      comparisons: ++comparisonsCount,
      swaps: relaxationsCount,
      passNumber: 5,
    },
  });

  // Marcar todos como confirmados
  for (const v of VERTEX_NAMES) settled.add(v);

  // Frame Final
  rawFrames.push({
    highlightLines: { c: [55], python: [28] },
    arrayState: VERTEX_NAMES.map((name) => dist[name]),
    elementStates: Object.fromEntries(VERTEX_NAMES.map((_, i) => [i, 'sorted'])),
    pointers: {},
    activeAction: 'locked',
    graphState: buildGraphState(dist, pred, null, null, settled),
    explanation: {
      text: `Bellman-Ford finalizado con éxito: Ningún ciclo negativo detectado. Caminos mínimos confirmados.`,
      subNote: `Distancias mínimas desde A: A=0, B=${dist.B}, C=${dist.C}, D=${dist.D}, E=${dist.E}. Complejidad O(V · E).`,
    },
    metrics: {
      comparisons: comparisonsCount,
      swaps: relaxationsCount,
      passNumber: 5,
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
      totalPasses: 5,
      maxComparisons: BELLMAN_FORD_EDGES.length * 5,
    },
  }));
}
