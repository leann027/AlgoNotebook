/**
 * AlgoNotebook — Kruskal Minimum Spanning Tree (MST) Pure Trace Generator
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: CERO UI, CERO React, función 100% pura y síncrona.
 * - Retorna un array inmutable de TraceFrame[].
 * - Sincronizado estrictamente con code.c (C99) y code.py (Python 3).
 * - Grafo ponderado conexo de 6 vértices (A, B, C, D, E, F) en coordenadas de 800x460.
 * - Estados visuales de GraphViewport:
 *   * Arista activa en evaluación: amarillo pastel ('active' / activeEdgeId).
 *   * Arista aceptada en MST: menta ('traversed').
 *   * Arista descartada por ciclo: 'default'.
 *   * Vértices bajo inspección: 'comparing' (amarillo).
 *   * Vértices pertenecientes al MST: 'sorted' (menta).
 */

import type {
  TraceFrame,
  ElementState,
  ActiveAction,
  GraphAlgorithmState,
  GraphNodeData,
  GraphEdgeData,
  TraceEvent,
  TraceSnapshot,
} from '../../../core/types';

/**
 * Coordenadas espaciales canónicas para los 6 vértices en lienzo de 800x460.
 */
export const CANONICAL_KRUSKAL_NODES: Record<string, GraphNodeData> = {
  A: { id: 'A', label: 'A', x: 160, y: 220, state: 'default' },
  B: { id: 'B', label: 'B', x: 300, y: 110, state: 'default' },
  C: { id: 'C', label: 'C', x: 300, y: 330, state: 'default' },
  D: { id: 'D', label: 'D', x: 500, y: 110, state: 'default' },
  E: { id: 'E', label: 'E', x: 500, y: 330, state: 'default' },
  F: { id: 'F', label: 'F', x: 640, y: 220, state: 'default' },
};

export interface KruskalEdgeDefinition {
  id: string;
  from: string;
  to: string;
  weight: number;
}

/**
 * Aristas canónicas del grafo ponderado (9 aristas), ordenadas de forma ascendente por peso.
 */
export const CANONICAL_KRUSKAL_EDGES: readonly KruskalEdgeDefinition[] = [
  { id: 'e-B-C', from: 'B', to: 'C', weight: 1 },
  { id: 'e-A-C', from: 'A', to: 'C', weight: 2 },
  { id: 'e-D-E', from: 'D', to: 'E', weight: 2 },
  { id: 'e-E-F', from: 'E', to: 'F', weight: 3 },
  { id: 'e-A-B', from: 'A', to: 'B', weight: 4 },
  { id: 'e-B-D', from: 'B', to: 'D', weight: 5 },
  { id: 'e-D-F', from: 'D', to: 'F', weight: 6 },
  { id: 'e-C-E', from: 'C', to: 'E', weight: 8 },
  { id: 'e-C-D', from: 'C', to: 'D', weight: 10 },
];

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
  };
  event?: TraceEvent;
  snapshot?: TraceSnapshot;
}

function cloneNodes(nodes: Record<string, GraphNodeData>): Record<string, GraphNodeData> {
  const result: Record<string, GraphNodeData> = {};
  for (const k of Object.keys(nodes)) {
    result[k] = { ...nodes[k] };
  }
  return result;
}

function cloneEdges(edges: GraphEdgeData[]): GraphEdgeData[] {
  return edges.map((e) => ({ ...e }));
}

/**
 * Estructura Disjoint Set Union (DSU / Union-Find) para rastreo de componentes conexas.
 */
class DisjointSetUnion {
  parent: Record<string, string>;
  rank: Record<string, number>;

  constructor(vertices: readonly string[]) {
    this.parent = {};
    this.rank = {};
    for (const v of vertices) {
      this.parent[v] = v;
      this.rank[v] = 0;
    }
  }

  find(i: string): string {
    if (this.parent[i] !== i) {
      this.parent[i] = this.find(this.parent[i]);
    }
    return this.parent[i];
  }

  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return false; // Mismo conjunto, formaría ciclo
    }

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX] += 1;
    }
    return true;
  }
}

/**
 * Generador puro y síncrono de fotogramas de ejecución para el Árbol de Expansión Mínima de Kruskal.
 *
 * @param _initialInput Parámetro opcional para cumplir con el contrato AlgorithmDefinition.
 * @returns Lista inmutable de fotogramas paso a paso (TraceFrame[]).
 */
export function generateKruskalTrace(_initialInput?: number[]): TraceFrame[] {
  const rawFrames: RawFrame[] = [];

  // Inicialización de nodos y aristas
  const nodesMap: Record<string, GraphNodeData> = cloneNodes(CANONICAL_KRUSKAL_NODES);
  const edgesList: GraphEdgeData[] = CANONICAL_KRUSKAL_EDGES.map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    weight: e.weight,
    state: 'default' as const,
  }));

  const sortedWeights = CANONICAL_KRUSKAL_EDGES.map((e) => e.weight);
  const dsu = new DisjointSetUnion(VERTEX_KEYS);

  let comparisonsCount = 0;
  let mstEdgesCount = 0;
  let totalMstWeight = 0;
  const connectedNodes = new Set<string>();

  const pushFrame = (params: {
    highlightLines: { c: number[]; python: number[] };
    activeAction: ActiveAction;
    currentNodeId?: string | null;
    activeEdgeId?: string | null;
    stepNodes: Record<string, GraphNodeData>;
    stepEdges: GraphEdgeData[];
    edgeIndex: number;
    explanation: {
      stepLabel: string;
      text: string;
      subNote?: string;
    };
    comparison?: {
      leftIndex: number;
      rightIndex: number;
      leftValue: number;
      rightValue: number;
      conditionMet: boolean;
    };
    event?: TraceEvent;
  }) => {
    const graphState: GraphAlgorithmState = {
      nodes: cloneNodes(params.stepNodes),
      edges: cloneEdges(params.stepEdges),
      currentNodeId: params.currentNodeId ?? null,
      activeEdgeId: params.activeEdgeId ?? null,
    };

    const elementStates: Record<number, ElementState> = {};
    for (let i = 0; i < sortedWeights.length; i++) {
      if (i < params.edgeIndex) {
        elementStates[i] = 'sorted';
      } else if (i === params.edgeIndex) {
        elementStates[i] = 'comparing';
      } else {
        elementStates[i] = 'default';
      }
    }

    rawFrames.push({
      highlightLines: params.highlightLines,
      arrayState: [...sortedWeights],
      elementStates,
      pointers: {
        edge: params.edgeIndex,
        mst: mstEdgesCount,
      },
      activeAction: params.activeAction,
      graphState,
      comparison: params.comparison,
      explanation: params.explanation,
      metrics: {
        comparisons: comparisonsCount,
        swaps: mstEdgesCount,
        passNumber: Math.min(params.edgeIndex + 1, CANONICAL_KRUSKAL_EDGES.length),
        totalPasses: CANONICAL_KRUSKAL_EDGES.length,
        maxComparisons: CANONICAL_KRUSKAL_EDGES.length,
      },
      event: params.event,
    });
  };

  // ==========================================================================
  // FASE 0: Fotograma Inicial (Grafo y Ordenamiento de Aristas)
  // ==========================================================================
  pushFrame({
    highlightLines: {
      c: [40, 41, 42, 45],
      python: [26, 27, 28],
    },
    activeAction: 'idle',
    currentNodeId: null,
    activeEdgeId: null,
    stepNodes: nodesMap,
    stepEdges: edgesList,
    edgeIndex: 0,
    explanation: {
      stepLabel: 'Inicio — Algoritmo de Kruskal (Árbol de Expansión Mínima)',
      text: 'Se ordenan las 9 aristas del grafo ponderado en orden no decreciente de peso: [1, 2, 2, 3, 4, 5, 6, 8, 10]. Cada uno de los 6 vértices comienza en su propio conjunto disjunto independiente.',
      subNote: 'El objetivo es conectar los 6 vértices utilizando exactamente V - 1 = 5 aristas con el menor peso total acumulado.',
    },
    event: { type: 'idle' },
  });

  // ==========================================================================
  // FASE 1: Inicialización de Conjuntos Disjuntos (DSU)
  // ==========================================================================
  pushFrame({
    highlightLines: {
      c: [48, 49, 50, 51, 52],
      python: [29, 30],
    },
    activeAction: 'idle',
    currentNodeId: null,
    activeEdgeId: null,
    stepNodes: nodesMap,
    stepEdges: edgesList,
    edgeIndex: 0,
    explanation: {
      stepLabel: 'Inicialización de DSU (Union-Find)',
      text: 'Se inicializa la estructura de conjuntos disjuntos (DSU): {A}, {B}, {C}, {D}, {E}, {F}. Inicialmente no hay conexiones de árbol y el peso del MST es 0.',
      subNote: 'Para cada vértice v: parent[v] = v, rank[v] = 0.',
    },
    event: { type: 'idle' },
  });

  // ==========================================================================
  // FASE 2: Procesamiento Voraz de Aristas (Iteración Principal)
  // ==========================================================================
  for (let idx = 0; idx < CANONICAL_KRUSKAL_EDGES.length; idx++) {
    const edgeDef = CANONICAL_KRUSKAL_EDGES[idx];
    const u = edgeDef.from;
    const v = edgeDef.to;
    const w = edgeDef.weight;
    comparisonsCount++;

    const rootU = dsu.find(u);
    const rootV = dsu.find(v);
    const formsCycle = rootU === rootV;

    // Fotograma A: Inspección activa de la arista candidata
    const inspectNodes = cloneNodes(nodesMap);
    inspectNodes[u].state = 'comparing';
    inspectNodes[v].state = 'comparing';

    const inspectEdges = cloneEdges(edgesList);
    const inspectTargetEdge = inspectEdges.find((e) => e.id === edgeDef.id);
    if (inspectTargetEdge) {
      inspectTargetEdge.state = 'active';
    }

    pushFrame({
      highlightLines: {
        c: [55, 56, 57, 58],
        python: [33, 12, 13],
      },
      activeAction: 'compare',
      currentNodeId: u,
      activeEdgeId: edgeDef.id,
      stepNodes: inspectNodes,
      stepEdges: inspectEdges,
      edgeIndex: idx,
      comparison: {
        leftIndex: idx,
        rightIndex: idx,
        leftValue: w,
        rightValue: formsCycle ? 1 : 0,
        conditionMet: !formsCycle,
      },
      explanation: {
        stepLabel: `Paso ${idx + 1}: Inspeccionando Arista (${u} - ${v}, Peso ${w})`,
        text: `Evaluando arista ${u}-${v} con peso ${w}. find(${u}) = raíz '${rootU}' y find(${v}) = raíz '${rootV}'. ${
          formsCycle
            ? `¡Misma raíz! Ambos extremos ya pertenecen al mismo componente conexo.`
            : `Raíces distintas: los extremos pertenecen a componentes disjuntos.`
        }`,
        subNote: `Verificación de ciclo: find(${u}) ${formsCycle ? '==' : '≠'} find(${v}).`,
      },
      event: {
        type: 'compare',
        leftIndex: idx,
        rightIndex: idx,
        leftValue: w,
        rightValue: formsCycle ? 1 : 0,
        conditionMet: !formsCycle,
      },
    });

    // Fotograma B: Decisión (Aceptar en MST o Descartar por Ciclo)
    const currentEdgeInList = edgesList.find((e) => e.id === edgeDef.id);

    if (!formsCycle) {
      // Arista ACEPTADA en el MST
      dsu.union(u, v);
      mstEdgesCount++;
      totalMstWeight += w;
      connectedNodes.add(u);
      connectedNodes.add(v);

      if (currentEdgeInList) {
        currentEdgeInList.state = 'traversed';
      }

      // Marcar nodos conectados en el MST con 'sorted'
      for (const nId of connectedNodes) {
        nodesMap[nId].state = 'sorted';
      }

      pushFrame({
        highlightLines: {
          c: [61, 62, 63],
          python: [35, 36],
        },
        activeAction: 'locked',
        currentNodeId: v,
        activeEdgeId: null,
        stepNodes: nodesMap,
        stepEdges: edgesList,
        edgeIndex: idx,
        explanation: {
          stepLabel: `Arista (${u} - ${v}, Peso ${w}) Aceptada en el MST`,
          text: `¡Arista incorporada al árbol! No forma ciclos y minimiza el costo voraz. Se unen los conjuntos de '${rootU}' y '${rootV}'. Aristas en MST: ${mstEdgesCount}/5. Peso acumulado: ${totalMstWeight}.`,
          subNote: `Estado de arista: traversed (verde menta). Componentes unificados mediante unionSets.`,
        },
        event: {
          type: 'locked',
          index: idx,
          value: w,
        },
      });

      // Criterio de parada temprana: si ya tenemos V - 1 = 5 aristas
      if (mstEdgesCount === VERTEX_KEYS.length - 1) {
        pushFrame({
          highlightLines: {
            c: [55],
            python: [37, 38],
          },
          activeAction: 'locked',
          currentNodeId: null,
          activeEdgeId: null,
          stepNodes: nodesMap,
          stepEdges: edgesList,
          edgeIndex: idx + 1,
          explanation: {
            stepLabel: 'Criterio de Parada Alcanzado (|V| - 1 = 5 Aristas)',
            text: `Se han seleccionado exactamente ${mstEdgesCount} aristas para los 6 vértices. Todo árbol de expansión conexo contiene estrictamente V - 1 aristas, por lo que las aristas restantes con pesos mayores son omitidas.`,
            subNote: 'El Árbol de Expansión Mínima está formal y matemáticamente completo.',
          },
          event: { type: 'idle' },
        });
        break;
      }
    } else {
      // Arista RECHAZADA (forma ciclo)
      if (currentEdgeInList) {
        currentEdgeInList.state = 'default';
      }

      // Restaurar estado de nodos de la arista rechazada si ya estaban conectados
      nodesMap[u].state = connectedNodes.has(u) ? 'sorted' : 'default';
      nodesMap[v].state = connectedNodes.has(v) ? 'sorted' : 'default';

      pushFrame({
        highlightLines: {
          c: [65],
          python: [39],
        },
        activeAction: 'compare',
        currentNodeId: null,
        activeEdgeId: null,
        stepNodes: nodesMap,
        stepEdges: edgesList,
        edgeIndex: idx,
        explanation: {
          stepLabel: `Arista (${u} - ${v}, Peso ${w}) Descartada (Forma Ciclo)`,
          text: `La arista ${u}-${v} es descartada. Ambos vértices ya comparten camino dentro de la misma componente conexa '${rootU}'. Añadirla crearía un ciclo redundante (${u} ↔ ${v}).`,
          subNote: 'Decisión Greedy: se conserva la arista en estado default sin incluirla en el MST.',
        },
        event: {
          type: 'compare',
          leftIndex: idx,
          rightIndex: idx,
          leftValue: w,
          rightValue: 0,
          conditionMet: false,
        },
      });
    }
  }

  // ==========================================================================
  // FASE 3: Fotograma Final — Árbol de Expansión Mínima Consolidado
  // ==========================================================================
  for (const vKey of VERTEX_KEYS) {
    nodesMap[vKey].state = 'sorted';
  }

  pushFrame({
    highlightLines: {
      c: [41, 42],
      python: [41],
    },
    activeAction: 'locked',
    currentNodeId: null,
    activeEdgeId: null,
    stepNodes: nodesMap,
    stepEdges: edgesList,
    edgeIndex: CANONICAL_KRUSKAL_EDGES.length,
    explanation: {
      stepLabel: 'Finalización — Árbol de Expansión Mínima (MST) Completo',
      text: `¡Construcción del MST finalizada! Se conectaron los 6 vértices con 5 aristas óptimas (B-C: 1, A-C: 2, D-E: 2, E-F: 3, B-D: 5). Peso total mínimo = ${totalMstWeight}.`,
      subNote: 'Todas las aristas del MST están resaltadas en verde menta y todos los nodos están completamente enlazados.',
    },
    event: {
      type: 'locked',
      index: 0,
      value: totalMstWeight,
    },
  });

  const totalSteps = rawFrames.length;
  return rawFrames.map((frame, index) => ({
    ...frame,
    stepIndex: index + 1,
    totalSteps,
  }));
}

