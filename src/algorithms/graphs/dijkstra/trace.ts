/**
 * AlgoNotebook — Dijkstra's Shortest Path Algorithm Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Grafo ponderado canónico de 6 vértices (A, B, C, D, E, F) con coordenadas exactas de diseño.
 * - Snapshots inmutables de GraphAlgorithmState con dijkstraTable en cada fotograma.
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  GraphAlgorithmState,
  GraphNodeData,
  GraphEdgeData,
  DijkstraTableEntry,
  TraceEvent,
  TraceSnapshot,
} from '../../../core/types';

/**
 * Coordenadas espaciales canónicas para los 6 vértices según especificación de diseño.
 */
export const CANONICAL_GRAPH_NODES: Record<string, { x: number; y: number }> = {
  A: { x: 160, y: 220 },
  B: { x: 300, y: 110 },
  C: { x: 300, y: 330 },
  D: { x: 500, y: 110 },
  E: { x: 500, y: 330 },
  F: { x: 640, y: 220 },
};

/**
 * Aristas ponderadas canónicas del grafo no dirigido (9 aristas).
 */
export const CANONICAL_GRAPH_EDGES: Array<{ id: string; from: string; to: string; weight: number }> = [
  { id: 'e-A-B', from: 'A', to: 'B', weight: 4 },
  { id: 'e-A-C', from: 'A', to: 'C', weight: 2 },
  { id: 'e-B-C', from: 'B', to: 'C', weight: 1 },
  { id: 'e-B-D', from: 'B', to: 'D', weight: 5 },
  { id: 'e-C-D', from: 'C', to: 'D', weight: 10 },
  { id: 'e-C-E', from: 'C', to: 'E', weight: 8 },
  { id: 'e-D-E', from: 'D', to: 'E', weight: 2 },
  { id: 'e-D-F', from: 'D', to: 'F', weight: 6 },
  { id: 'e-E-F', from: 'E', to: 'F', weight: 3 },
];

/**
 * Mapeo de identificadores de nodo a índices continuos 0..5 para arrays lineales.
 */
export const VERTEX_INDICES: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
};

const VERTEX_KEYS: readonly string[] = ['A', 'B', 'C', 'D', 'E', 'F'];

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
  comparison?: {
    leftIndex: number;
    rightIndex: number;
    leftValue: number;
    rightValue: number;
    conditionMet: boolean;
  };
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
  event?: TraceEvent;
  snapshot?: TraceSnapshot;
}

/**
 * Clona inmutablemente el diccionario de nodos del grafo.
 */
function cloneNodes(nodes: Record<string, GraphNodeData>): Record<string, GraphNodeData> {
  const result: Record<string, GraphNodeData> = {};
  for (const [key, val] of Object.entries(nodes)) {
    result[key] = { ...val };
  }
  return result;
}

/**
 * Clona inmutablemente el arreglo de aristas del grafo.
 */
function cloneEdges(edges: GraphEdgeData[]): GraphEdgeData[] {
  return edges.map((e) => ({ ...e }));
}

/**
 * Clona inmutablemente la tabla de distancias y predecesores de Dijkstra.
 */
function cloneTable(table: Record<string, DijkstraTableEntry>): Record<string, DijkstraTableEntry> {
  const result: Record<string, DijkstraTableEntry> = {};
  for (const [key, val] of Object.entries(table)) {
    result[key] = { ...val };
  }
  return result;
}

/**
 * Genera la representación en array numérico de distancias para el visualizador lineal.
 * Mapea '∞' a 20 como valor centinela estético para la escala de barras.
 */
function tableToArrayState(table: Record<string, DijkstraTableEntry>): number[] {
  return VERTEX_KEYS.map((v) => {
    const dist = table[v].distance;
    return dist === '∞' ? 20 : dist;
  });
}

/**
 * Extrae los estados visuales elementales ordenados por índice de vértice.
 */
function nodesToElementStates(nodes: Record<string, GraphNodeData>): Record<number, ElementState> {
  const states: Record<number, ElementState> = {};
  VERTEX_KEYS.forEach((v, idx) => {
    states[idx] = nodes[v].state ?? 'default';
  });
  return states;
}

/**
 * Formatea los nodos en la cola de prioridad / frontera ordenados por distancia mínima actual.
 */
function formatPriorityQueue(table: Record<string, DijkstraTableEntry>): string[] {
  return Object.values(table)
    .filter((entry) => !entry.isSettled)
    .sort((a, b) => {
      const distA = a.distance === '∞' ? Number.POSITIVE_INFINITY : a.distance;
      const distB = b.distance === '∞' ? Number.POSITIVE_INFINITY : b.distance;
      if (distA !== distB) return distA - distB;
      return a.vertex.localeCompare(b.vertex);
    })
    .map((entry) => `${entry.vertex} (${entry.distance === '∞' ? '∞' : entry.distance})`);
}

/**
 * Generador puro y síncrono de fotogramas de ejecución (TraceFrame[]) para el Algoritmo de Dijkstra.
 *
 * @param _initialInput Parámetro opcional para compatibilidad con la interfaz AlgorithmDefinition.
 * @returns Lista inmutable de fotogramas paso a paso.
 */
export function generateDijkstraTrace(_initialInput?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];

  // Inicialización de nodos del grafo
  const currentNodes: Record<string, GraphNodeData> = {};
  for (const v of VERTEX_KEYS) {
    currentNodes[v] = {
      id: v,
      label: v,
      x: CANONICAL_GRAPH_NODES[v].x,
      y: CANONICAL_GRAPH_NODES[v].y,
      state: 'default',
    };
  }

  // Inicialización de aristas del grafo
  const currentEdges: GraphEdgeData[] = CANONICAL_GRAPH_EDGES.map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    weight: e.weight,
    state: 'default',
  }));

  // Inicialización de la tabla de distancias Dijkstra
  const currentTable: Record<string, DijkstraTableEntry> = {};
  for (const v of VERTEX_KEYS) {
    currentTable[v] = {
      vertex: v,
      distance: v === 'A' ? 0 : '∞',
      predecessor: '-',
      isSettled: false,
    };
  }

  // Métricas acumuladas
  let comparisons = 0; // Comprobaciones de aristas (relajación)
  let relaxations = 0; // Actualizaciones de distancia efectiva
  let settledCount = 0; // Vértices fijados definitivamente
  const totalVertices = 6;
  const maxEdgeChecks = 9;

  // Helper para buscar el ID de una arista entre u y v
  const findEdge = (u: string, v: string): GraphEdgeData | undefined => {
    return currentEdges.find(
      (e) => (e.from === u && e.to === v) || (e.from === v && e.to === u)
    );
  };

  // Helper para resetear estados activos de aristas no asentadas
  const resetActiveEdges = () => {
    for (const edge of currentEdges) {
      if (edge.state === 'active') {
        edge.state = 'default';
      }
    }
  };

  // --------------------------------------------------------------------------
  // PASO 1: Inicialización
  // --------------------------------------------------------------------------
  currentNodes.A.state = 'pointer'; // Marcado como origen en frontera
  rawFrames.push({
    highlightLines: {
      c: [19, 20, 21, 22],
      python: [4, 5, 6, 7, 8],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.A },
    activeAction: 'idle',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'A',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Inicialización de distancias desde el origen A. dist[A] = 0, y dist[v] = ∞ para todos los demás vértices. Cola de prioridad lista con el origen.',
      subNote: 'Tabla de distancias inicializada. 6 vértices en el grafo, origen en nodo A. Ningún vértice ha sido asentado todavía.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'idle' },
    snapshot: {
      kind: 'idle',
      arrayState: tableToArrayState(currentTable),
      elementStates: nodesToElementStates(currentNodes),
      pointers: { u: VERTEX_INDICES.A },
    },
  });

  // ==========================================================================
  // RONDA 1: Procesar Origen A (dist = 0)
  // ==========================================================================

  // Paso 2: Seleccionar u = A
  currentNodes.A.state = 'comparing';
  rawFrames.push({
    highlightLines: {
      c: [24, 25],
      python: [10, 11],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.A },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'A',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Selección del vértice no visitado con distancia mínima: u = A con dist[A] = 0.',
      subNote: 'A se extrae de la cola de prioridad (minDistance en C / heappop en Python). Inspeccionando vecinos adyacentes {B, C}.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'pivot', index: VERTEX_INDICES.A, value: 0 },
    snapshot: {
      kind: 'pivot',
      pivotIndex: VERTEX_INDICES.A,
      arrayState: tableToArrayState(currentTable),
      elementStates: nodesToElementStates(currentNodes),
      pointers: { u: VERTEX_INDICES.A },
    },
  });

  // Paso 3: Evaluar arista (A, B) con peso 4
  comparisons++;
  const edgeAB = findEdge('A', 'B')!;
  edgeAB.state = 'active';
  currentNodes.B.state = 'pointer';
  rawFrames.push({
    highlightLines: {
      c: [29, 30, 31],
      python: [16, 17, 18],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.A, v: VERTEX_INDICES.B },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'A',
      activeEdgeId: edgeAB.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    comparison: {
      leftIndex: VERTEX_INDICES.A,
      rightIndex: VERTEX_INDICES.B,
      leftValue: 4,
      rightValue: 20,
      conditionMet: true,
    },
    explanation: {
      text: 'Evaluando arista (A, B) con peso 4: dist[A] + 4 = 4 < dist[B] (∞). Se cumple condición de relajación.',
      subNote: 'Existe un camino más corto hacia B a través de A. Se actualizará la distancia tentativa.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'compare',
      leftIndex: VERTEX_INDICES.A,
      rightIndex: VERTEX_INDICES.B,
      leftValue: 4,
      rightValue: 20,
      conditionMet: true,
    },
  });

  // Paso 4: Relajar arista (A, B)
  relaxations++;
  currentTable.B.distance = 4;
  currentTable.B.predecessor = 'A';
  rawFrames.push({
    highlightLines: {
      c: [31, 32],
      python: [18, 19, 20, 21],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.A, v: VERTEX_INDICES.B },
    activeAction: 'swap',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'A',
      activeEdgeId: edgeAB.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Relajación de arista (A, B): dist[B] actualizada de ∞ a 4. Predecesor de B fijado en A.',
      subNote: 'dist[B] = 4, pred[B] = A. B insertado en la cola con distancia tentativa 4.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'swap',
      leftIndex: VERTEX_INDICES.A,
      rightIndex: VERTEX_INDICES.B,
      leftValue: 0,
      rightValue: 4,
    },
  });

  // Paso 5: Evaluar arista (A, C) con peso 2
  resetActiveEdges();
  comparisons++;
  const edgeAC = findEdge('A', 'C')!;
  edgeAC.state = 'active';
  currentNodes.C.state = 'pointer';
  rawFrames.push({
    highlightLines: {
      c: [29, 30, 31],
      python: [16, 17, 18],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.A, v: VERTEX_INDICES.C },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'A',
      activeEdgeId: edgeAC.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    comparison: {
      leftIndex: VERTEX_INDICES.A,
      rightIndex: VERTEX_INDICES.C,
      leftValue: 2,
      rightValue: 20,
      conditionMet: true,
    },
    explanation: {
      text: 'Evaluando arista (A, C) con peso 2: dist[A] + 2 = 2 < dist[C] (∞). Se cumple condición de relajación.',
      subNote: 'Existe un camino más corto hacia C a través de A. Se actualizará dist[C].',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'compare',
      leftIndex: VERTEX_INDICES.A,
      rightIndex: VERTEX_INDICES.C,
      leftValue: 2,
      rightValue: 20,
      conditionMet: true,
    },
  });

  // Paso 6: Relajar arista (A, C)
  relaxations++;
  currentTable.C.distance = 2;
  currentTable.C.predecessor = 'A';
  rawFrames.push({
    highlightLines: {
      c: [31, 32],
      python: [18, 19, 20, 21],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.A, v: VERTEX_INDICES.C },
    activeAction: 'swap',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'A',
      activeEdgeId: edgeAC.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Relajación de arista (A, C): dist[C] actualizada de ∞ a 2. Predecesor de C fijado en A.',
      subNote: 'dist[C] = 2, pred[C] = A. C insertado en la cola con distancia tentativa 2.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'swap',
      leftIndex: VERTEX_INDICES.A,
      rightIndex: VERTEX_INDICES.C,
      leftValue: 0,
      rightValue: 2,
    },
  });

  // Paso 7: Asentar Vértice A
  resetActiveEdges();
  settledCount++;
  currentTable.A.isSettled = true;
  currentNodes.A.state = 'sorted';
  rawFrames.push({
    highlightLines: {
      c: [27],
      python: [14],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.A },
    activeAction: 'locked',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'A',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Vértice A cerrado y asentado definitivamente. dist[A] = 0 es óptima e inmutable.',
      subNote: 'visited[A] = true. Ninguna arista posterior puede reducir la distancia al origen. 1/6 vértices asentados.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'locked', index: VERTEX_INDICES.A, value: 0 },
    snapshot: {
      kind: 'locked',
      lockedIndex: VERTEX_INDICES.A,
      arrayState: tableToArrayState(currentTable),
      elementStates: nodesToElementStates(currentNodes),
      pointers: { u: VERTEX_INDICES.A },
    },
  });

  // ==========================================================================
  // RONDA 2: Procesar Vértice C (dist = 2, mínimo en frontera)
  // ==========================================================================

  // Paso 8: Seleccionar u = C
  currentNodes.C.state = 'comparing';
  rawFrames.push({
    highlightLines: {
      c: [24, 25],
      python: [10, 11],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.C },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'C',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Selección del vértice no visitado con distancia mínima: u = C con dist[C] = 2.',
      subNote: 'minDistance / heappop extrae C. Inspeccionando vecinos adyacentes {A, B, D, E}. A ya está asentado.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'pivot', index: VERTEX_INDICES.C, value: 2 },
  });

  // Paso 9: Evaluar arista (C, B) con peso 1
  comparisons++;
  const edgeBC = findEdge('B', 'C')!;
  edgeBC.state = 'active';
  currentNodes.B.state = 'pointer';
  rawFrames.push({
    highlightLines: {
      c: [29, 30, 31],
      python: [16, 17, 18],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.C, v: VERTEX_INDICES.B },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'C',
      activeEdgeId: edgeBC.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    comparison: {
      leftIndex: VERTEX_INDICES.C,
      rightIndex: VERTEX_INDICES.B,
      leftValue: 3,
      rightValue: 4,
      conditionMet: true,
    },
    explanation: {
      text: 'Evaluando arista (C, B) con peso 1: dist[C] + 1 = 3 < dist[B] (4). ¡Relajación exitosa!',
      subNote: 'El camino A → C → B (longitud 3) es más corto que la arista directa A → B (longitud 4). Desigualdad triangular en acción.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'compare',
      leftIndex: VERTEX_INDICES.C,
      rightIndex: VERTEX_INDICES.B,
      leftValue: 3,
      rightValue: 4,
      conditionMet: true,
    },
  });

  // Paso 10: Relajar arista (C, B)
  relaxations++;
  currentTable.B.distance = 3;
  currentTable.B.predecessor = 'C';
  rawFrames.push({
    highlightLines: {
      c: [31, 32],
      python: [18, 19, 20, 21],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.C, v: VERTEX_INDICES.B },
    activeAction: 'swap',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'C',
      activeEdgeId: edgeBC.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Relajación de arista (C, B): dist[B] se reduce de 4 a 3. Predecesor de B cambia a C.',
      subNote: 'Nueva distancia óptima provisional: dist[B] = 3 con ruta A → C → B.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'swap',
      leftIndex: VERTEX_INDICES.C,
      rightIndex: VERTEX_INDICES.B,
      leftValue: 4,
      rightValue: 3,
    },
  });

  // Paso 11: Evaluar arista (C, D) con peso 10
  resetActiveEdges();
  comparisons++;
  const edgeCD = findEdge('C', 'D')!;
  edgeCD.state = 'active';
  currentNodes.D.state = 'pointer';
  rawFrames.push({
    highlightLines: {
      c: [29, 30, 31],
      python: [16, 17, 18],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.C, v: VERTEX_INDICES.D },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'C',
      activeEdgeId: edgeCD.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    comparison: {
      leftIndex: VERTEX_INDICES.C,
      rightIndex: VERTEX_INDICES.D,
      leftValue: 12,
      rightValue: 20,
      conditionMet: true,
    },
    explanation: {
      text: 'Evaluando arista (C, D) con peso 10: dist[C] + 10 = 12 < dist[D] (∞). Se cumple condición de relajación.',
      subNote: 'Primer camino descubierto hacia D a través de C. Distancia tentativa: 12.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'compare',
      leftIndex: VERTEX_INDICES.C,
      rightIndex: VERTEX_INDICES.D,
      leftValue: 12,
      rightValue: 20,
      conditionMet: true,
    },
  });

  // Paso 12: Relajar arista (C, D)
  relaxations++;
  currentTable.D.distance = 12;
  currentTable.D.predecessor = 'C';
  rawFrames.push({
    highlightLines: {
      c: [31, 32],
      python: [18, 19, 20, 21],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.C, v: VERTEX_INDICES.D },
    activeAction: 'swap',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'C',
      activeEdgeId: edgeCD.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Relajación de arista (C, D): dist[D] actualizada de ∞ a 12. Predecesor de D fijado en C.',
      subNote: 'dist[D] = 12, pred[D] = C. D entra a la frontera.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'swap',
      leftIndex: VERTEX_INDICES.C,
      rightIndex: VERTEX_INDICES.D,
      leftValue: 2,
      rightValue: 12,
    },
  });

  // Paso 13: Evaluar arista (C, E) con peso 8
  resetActiveEdges();
  comparisons++;
  const edgeCE = findEdge('C', 'E')!;
  edgeCE.state = 'active';
  currentNodes.E.state = 'pointer';
  rawFrames.push({
    highlightLines: {
      c: [29, 30, 31],
      python: [16, 17, 18],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.C, v: VERTEX_INDICES.E },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'C',
      activeEdgeId: edgeCE.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    comparison: {
      leftIndex: VERTEX_INDICES.C,
      rightIndex: VERTEX_INDICES.E,
      leftValue: 10,
      rightValue: 20,
      conditionMet: true,
    },
    explanation: {
      text: 'Evaluando arista (C, E) con peso 8: dist[C] + 8 = 10 < dist[E] (∞). Se cumple condición de relajación.',
      subNote: 'Primer camino descubierto hacia E a través de C con costo total 2 + 8 = 10.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'compare',
      leftIndex: VERTEX_INDICES.C,
      rightIndex: VERTEX_INDICES.E,
      leftValue: 10,
      rightValue: 20,
      conditionMet: true,
    },
  });

  // Paso 14: Relajar arista (C, E)
  relaxations++;
  currentTable.E.distance = 10;
  currentTable.E.predecessor = 'C';
  rawFrames.push({
    highlightLines: {
      c: [31, 32],
      python: [18, 19, 20, 21],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.C, v: VERTEX_INDICES.E },
    activeAction: 'swap',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'C',
      activeEdgeId: edgeCE.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Relajación de arista (C, E): dist[E] actualizada de ∞ a 10. Predecesor de E fijado en C.',
      subNote: 'dist[E] = 10, pred[E] = C. E entra a la frontera.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'swap',
      leftIndex: VERTEX_INDICES.C,
      rightIndex: VERTEX_INDICES.E,
      leftValue: 2,
      rightValue: 10,
    },
  });

  // Paso 15: Asentar Vértice C
  resetActiveEdges();
  settledCount++;
  currentTable.C.isSettled = true;
  currentNodes.C.state = 'sorted';
  rawFrames.push({
    highlightLines: {
      c: [27],
      python: [14],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.C },
    activeAction: 'locked',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'C',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Vértice C cerrado y asentado definitivamente. dist[C] = 2 es óptima.',
      subNote: 'visited[C] = true. Camino óptimo A → C con longitud 2 confirmado. 2/6 vértices asentados.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'locked', index: VERTEX_INDICES.C, value: 2 },
  });

  // ==========================================================================
  // RONDA 3: Procesar Vértice B (dist = 3, mínimo en frontera)
  // ==========================================================================

  // Paso 16: Seleccionar u = B
  currentNodes.B.state = 'comparing';
  rawFrames.push({
    highlightLines: {
      c: [24, 25],
      python: [10, 11],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.B },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'B',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Selección del vértice no visitado con distancia mínima: u = B con dist[B] = 3.',
      subNote: 'minDistance / heappop extrae B. Vecinos: A (asentado), C (asentado), D (no visitado).',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'pivot', index: VERTEX_INDICES.B, value: 3 },
  });

  // Paso 17: Evaluar arista (B, D) con peso 5
  comparisons++;
  const edgeBD = findEdge('B', 'D')!;
  edgeBD.state = 'active';
  currentNodes.D.state = 'pointer';
  rawFrames.push({
    highlightLines: {
      c: [29, 30, 31],
      python: [16, 17, 18],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.B, v: VERTEX_INDICES.D },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'B',
      activeEdgeId: edgeBD.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    comparison: {
      leftIndex: VERTEX_INDICES.B,
      rightIndex: VERTEX_INDICES.D,
      leftValue: 8,
      rightValue: 12,
      conditionMet: true,
    },
    explanation: {
      text: 'Evaluando arista (B, D) con peso 5: dist[B] + 5 = 8 < dist[D] (12). ¡Relajación exitosa!',
      subNote: 'El camino A → C → B → D (costo 8) mejora drásticamente el camino anterior A → C → D (costo 12).',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'compare',
      leftIndex: VERTEX_INDICES.B,
      rightIndex: VERTEX_INDICES.D,
      leftValue: 8,
      rightValue: 12,
      conditionMet: true,
    },
  });

  // Paso 18: Relajar arista (B, D)
  relaxations++;
  currentTable.D.distance = 8;
  currentTable.D.predecessor = 'B';
  rawFrames.push({
    highlightLines: {
      c: [31, 32],
      python: [18, 19, 20, 21],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.B, v: VERTEX_INDICES.D },
    activeAction: 'swap',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'B',
      activeEdgeId: edgeBD.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Relajación de arista (B, D): dist[D] se reduce de 12 a 8. Predecesor de D cambia a B.',
      subNote: 'dist[D] = 8, pred[D] = B. La distancia tentativa de D disminuye en 4 unidades.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'swap',
      leftIndex: VERTEX_INDICES.B,
      rightIndex: VERTEX_INDICES.D,
      leftValue: 12,
      rightValue: 8,
    },
  });

  // Paso 19: Asentar Vértice B
  resetActiveEdges();
  settledCount++;
  currentTable.B.isSettled = true;
  currentNodes.B.state = 'sorted';
  rawFrames.push({
    highlightLines: {
      c: [27],
      python: [14],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.B },
    activeAction: 'locked',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'B',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Vértice B cerrado y asentado definitivamente. dist[B] = 3 es óptima.',
      subNote: 'visited[B] = true. Camino óptimo A → C → B con distancia 3 asegurado. 3/6 vértices asentados.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'locked', index: VERTEX_INDICES.B, value: 3 },
  });

  // ==========================================================================
  // RONDA 4: Procesar Vértice D (dist = 8, mínimo en frontera {D:8, E:10, F:∞})
  // ==========================================================================

  // Paso 20: Seleccionar u = D
  currentNodes.D.state = 'comparing';
  rawFrames.push({
    highlightLines: {
      c: [24, 25],
      python: [10, 11],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.D },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'D',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Selección del vértice no visitado con distancia mínima: u = D con dist[D] = 8.',
      subNote: 'minDistance / heappop extrae D. Vecinos: B y C (asentados), E y F (no visitados).',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'pivot', index: VERTEX_INDICES.D, value: 8 },
  });

  // Paso 21: Evaluar arista (D, E) con peso 2 (no mejora)
  comparisons++;
  const edgeDE = findEdge('D', 'E')!;
  edgeDE.state = 'active';
  currentNodes.E.state = 'pointer';
  rawFrames.push({
    highlightLines: {
      c: [30, 31],
      python: [18],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.D, v: VERTEX_INDICES.E },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'D',
      activeEdgeId: edgeDE.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    comparison: {
      leftIndex: VERTEX_INDICES.D,
      rightIndex: VERTEX_INDICES.E,
      leftValue: 10,
      rightValue: 10,
      conditionMet: false,
    },
    explanation: {
      text: 'Evaluando arista (D, E) con peso 2: dist[D] + 2 = 10 no es estrictamente menor que dist[E] (10). No hay mejora.',
      subNote: 'El camino alternativo A → C → B → D → E tiene costo 10, idéntico a A → C → E (10). Se conserva el predecesor actual (C).',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'compare',
      leftIndex: VERTEX_INDICES.D,
      rightIndex: VERTEX_INDICES.E,
      leftValue: 10,
      rightValue: 10,
      conditionMet: false,
    },
  });

  // Paso 22: Evaluar arista (D, F) con peso 6
  resetActiveEdges();
  comparisons++;
  const edgeDF = findEdge('D', 'F')!;
  edgeDF.state = 'active';
  currentNodes.F.state = 'pointer';
  rawFrames.push({
    highlightLines: {
      c: [29, 30, 31],
      python: [16, 17, 18],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.D, v: VERTEX_INDICES.F },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'D',
      activeEdgeId: edgeDF.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    comparison: {
      leftIndex: VERTEX_INDICES.D,
      rightIndex: VERTEX_INDICES.F,
      leftValue: 14,
      rightValue: 20,
      conditionMet: true,
    },
    explanation: {
      text: 'Evaluando arista (D, F) con peso 6: dist[D] + 6 = 14 < dist[F] (∞). Se cumple condición de relajación.',
      subNote: 'Primer camino descubierto hacia el destino F con costo provisional 8 + 6 = 14.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'compare',
      leftIndex: VERTEX_INDICES.D,
      rightIndex: VERTEX_INDICES.F,
      leftValue: 14,
      rightValue: 20,
      conditionMet: true,
    },
  });

  // Paso 23: Relajar arista (D, F)
  relaxations++;
  currentTable.F.distance = 14;
  currentTable.F.predecessor = 'D';
  rawFrames.push({
    highlightLines: {
      c: [31, 32],
      python: [18, 19, 20, 21],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.D, v: VERTEX_INDICES.F },
    activeAction: 'swap',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'D',
      activeEdgeId: edgeDF.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Relajación de arista (D, F): dist[F] actualizada de ∞ a 14. Predecesor de F fijado en D.',
      subNote: 'dist[F] = 14, pred[F] = D. F entra a la frontera.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'swap',
      leftIndex: VERTEX_INDICES.D,
      rightIndex: VERTEX_INDICES.F,
      leftValue: 8,
      rightValue: 14,
    },
  });

  // Paso 24: Asentar Vértice D
  resetActiveEdges();
  settledCount++;
  currentTable.D.isSettled = true;
  currentNodes.D.state = 'sorted';
  rawFrames.push({
    highlightLines: {
      c: [27],
      python: [14],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.D },
    activeAction: 'locked',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'D',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Vértice D cerrado y asentado definitivamente. dist[D] = 8 es óptima.',
      subNote: 'visited[D] = true. Camino óptimo A → C → B → D confirmado con distancia 8. 4/6 vértices asentados.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'locked', index: VERTEX_INDICES.D, value: 8 },
  });

  // ==========================================================================
  // RONDA 5: Procesar Vértice E (dist = 10, mínimo en frontera {E:10, F:14})
  // ==========================================================================

  // Paso 25: Seleccionar u = E
  currentNodes.E.state = 'comparing';
  rawFrames.push({
    highlightLines: {
      c: [24, 25],
      python: [10, 11],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.E },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'E',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Selección del vértice no visitado con distancia mínima: u = E con dist[E] = 10.',
      subNote: 'minDistance / heappop extrae E. Vecinos: C y D (asentados), F (no visitado).',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'pivot', index: VERTEX_INDICES.E, value: 10 },
  });

  // Paso 26: Evaluar arista (E, F) con peso 3
  comparisons++;
  const edgeEF = findEdge('E', 'F')!;
  edgeEF.state = 'active';
  currentNodes.F.state = 'pointer';
  rawFrames.push({
    highlightLines: {
      c: [29, 30, 31],
      python: [16, 17, 18],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.E, v: VERTEX_INDICES.F },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'E',
      activeEdgeId: edgeEF.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    comparison: {
      leftIndex: VERTEX_INDICES.E,
      rightIndex: VERTEX_INDICES.F,
      leftValue: 13,
      rightValue: 14,
      conditionMet: true,
    },
    explanation: {
      text: 'Evaluando arista (E, F) con peso 3: dist[E] + 3 = 13 < dist[F] (14). ¡Relajación exitosa!',
      subNote: 'La ruta vía E (costo 13) es más corta que la ruta previa vía D (costo 14). Se actualiza la distancia definitiva hacia F.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'compare',
      leftIndex: VERTEX_INDICES.E,
      rightIndex: VERTEX_INDICES.F,
      leftValue: 13,
      rightValue: 14,
      conditionMet: true,
    },
  });

  // Paso 27: Relajar arista (E, F)
  relaxations++;
  currentTable.F.distance = 13;
  currentTable.F.predecessor = 'E';
  rawFrames.push({
    highlightLines: {
      c: [31, 32],
      python: [18, 19, 20, 21],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.E, v: VERTEX_INDICES.F },
    activeAction: 'swap',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'E',
      activeEdgeId: edgeEF.id,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Relajación de arista (E, F): dist[F] se reduce de 14 a 13. Predecesor de F cambia a E.',
      subNote: 'dist[F] = 13, pred[F] = E. Ruta óptima encontrada: A → C → E → F.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: {
      type: 'swap',
      leftIndex: VERTEX_INDICES.E,
      rightIndex: VERTEX_INDICES.F,
      leftValue: 14,
      rightValue: 13,
    },
  });

  // Paso 28: Asentar Vértice E
  resetActiveEdges();
  settledCount++;
  currentTable.E.isSettled = true;
  currentNodes.E.state = 'sorted';
  rawFrames.push({
    highlightLines: {
      c: [27],
      python: [14],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.E },
    activeAction: 'locked',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'E',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Vértice E cerrado y asentado definitivamente. dist[E] = 10 es óptima.',
      subNote: 'visited[E] = true. Camino óptimo A → C → E con distancia 10 asegurado. 5/6 vértices asentados.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'locked', index: VERTEX_INDICES.E, value: 10 },
  });

  // ==========================================================================
  // RONDA 6: Procesar Vértice F (dist = 13, último vértice)
  // ==========================================================================

  // Paso 29: Seleccionar u = F
  currentNodes.F.state = 'comparing';
  rawFrames.push({
    highlightLines: {
      c: [24, 25],
      python: [10, 11],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.F },
    activeAction: 'compare',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'F',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Selección del vértice no visitado con distancia mínima: u = F con dist[F] = 13.',
      subNote: 'Último vértice por procesar. Todos sus vecinos adyacentes {D, E} ya se encuentran asentados.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'pivot', index: VERTEX_INDICES.F, value: 13 },
  });

  // Paso 30: Asentar Vértice F
  resetActiveEdges();
  settledCount++;
  currentTable.F.isSettled = true;
  currentNodes.F.state = 'sorted';
  rawFrames.push({
    highlightLines: {
      c: [27],
      python: [14],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: { u: VERTEX_INDICES.F },
    activeAction: 'locked',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: 'F',
      activeEdgeId: null,
      queue: formatPriorityQueue(currentTable),
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Vértice F cerrado y asentado definitivamente. dist[F] = 13 es óptima.',
      subNote: 'visited[F] = true. Todos los 6 vértices del grafo han sido formalmente asentados.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'locked', index: VERTEX_INDICES.F, value: 13 },
  });

  // ==========================================================================
  // PASO 31: Fotograma Final (Árbol de Caminos Mínimos Definitivo)
  // ==========================================================================

  // Marcamos las 5 aristas que pertenecen al árbol de caminos mínimos (predecesores)
  // Predecesores:
  // C pred A -> arista A-C
  // B pred C -> arista B-C
  // D pred B -> arista B-D
  // E pred C -> arista C-E
  // F pred E -> arista E-F
  const shortestPathEdgeIds = new Set(['e-A-C', 'e-B-C', 'e-B-D', 'e-C-E', 'e-E-F']);
  for (const edge of currentEdges) {
    if (shortestPathEdgeIds.has(edge.id)) {
      edge.state = 'traversed';
    } else {
      edge.state = 'default';
    }
  }

  rawFrames.push({
    highlightLines: {
      c: [36],
      python: [22],
    },
    arrayState: tableToArrayState(currentTable),
    elementStates: nodesToElementStates(currentNodes),
    pointers: {},
    activeAction: 'locked',
    graphState: {
      nodes: cloneNodes(currentNodes),
      edges: cloneEdges(currentEdges),
      currentNodeId: null,
      activeEdgeId: null,
      queue: [],
      dijkstraTable: cloneTable(currentTable),
    },
    explanation: {
      text: 'Algoritmo de Dijkstra completado exitosamente. Se encontraron los caminos mínimos desde el origen A hacia todos los vértices.',
      subNote: 'Distancias mínimas definitivas: A=0, B=3 (A→C→B), C=2 (A→C), D=8 (A→C→B→D), E=10 (A→C→E), F=13 (A→C→E→F). Árbol de caminos mínimos resaltado con 5 aristas óptimas.',
    },
    metrics: {
      comparisons,
      swaps: relaxations,
      passNumber: settledCount,
      totalPasses: totalVertices,
      maxComparisons: maxEdgeChecks,
    },
    event: { type: 'idle' },
    snapshot: {
      kind: 'idle',
      arrayState: tableToArrayState(currentTable),
      elementStates: nodesToElementStates(currentNodes),
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

