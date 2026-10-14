/**
 * AlgoNotebook — Algoritmo de Bellman-Ford Module
 *
 * Exporta el contrato unificado AlgorithmDefinition, metadatos pedagógicos,
 * código fuente dual en C99 / Python 3 y generador puro de trazas.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateBellmanFordTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateBellmanFordTrace };

export const BELLMAN_FORD_METADATA: AlgorithmMetadata = {
  id: 'bellman-ford',
  name: 'Algoritmo de Bellman-Ford',
  category: 'graphs',
  figureId: 'FIG 12.1: DIRECTED GRAPH WITH NEGATIVE WEIGHT RELAXATION',
  viewportType: 'graph',
  timeComplexity: {
    best: 'O(E)',
    average: 'O(V · E)',
    worst: 'O(V · E)',
  },
  spaceComplexity: 'O(V) Distancias y Predecesores',
  description:
    'Cálculo de caminos mínimos desde origen único tolerando aristas de peso negativo y detectando ciclos negativos alcanzables en tiempo O(V · E).',
};

export const BELLMAN_FORD_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const BELLMAN_FORD_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Calcular las distancias mínimas desde un vértice fuente hacia todos los demás vértices en un grafo ponderado que puede contener aristas de costo negativo, identificando si existe algún ciclo de peso negativo.',
  mechanism: [
    'Inicializar la distancia del origen en 0 y la de todos los demás vértices en infinito (INF).',
    'Iterar |V| - 1 rondas. En cada ronda, relajar todas las aristas (u, v) con peso w: si dist[u] + w < dist[v], actualizar dist[v] = dist[u] + w y pred[v] = u.',
    'Si en alguna ronda no se produce ninguna relajación, terminar tempranamente ya que los caminos mínimos han convergido.',
    'Ejecutar una ronda adicional |V|: si alguna arista puede relajarse aún más, se declara la existencia de un ciclo de costo negativo alcanzable desde el origen.',
  ],
  loopInvariant:
    'Tras completar la ronda k (1 <= k <= |V|-1), para todo vértice v, dist[v] es menor o igual al peso del camino más corto desde el origen hasta v que utilice a lo sumo k aristas.',
  properties: {
    paradigm: 'Programación Dinámica sobre Grafos / Relajación por Rondas',
    isInPlace: false,
    isStable: false,
  },
  complexity: {
    best: 'O(E) (cuando no hay relajaciones posteriores a la ronda 1)',
    average: 'O(V · E)',
    worst: 'O(V · E) (|V|-1 rondas completas inspeccionando las |E| aristas)',
    auxiliarySpace: 'O(V) (tablas de distancias y predecesores)',
  },
  analogy:
    'Como calcular el itinerario de vuelos con escalas donde ciertas aerolíneas ofrecen descuentos especiales o millas de reembolso (aristas negativas). A diferencia de Dijkstra que se confunde con los descuentos, Bellman-Ford reevalúa pacientemente todas las conexiones |V|-1 veces.',
  inPlainWords:
    'Encuentra el camino más barato en un mapa donde algunos caminos pueden descontar dinero en lugar de cobrar. Revisa todas las calles una y otra vez (tantas veces como ciudades haya menos una). Al final revisa una vez más: si los precios siguen bajando, significa que hay un bucle infinito de descuentos (ciclo negativo).',
  complexityExplanation:
    'El camino simple más largo posible en un grafo de |V| vértices tiene exactamente |V| - 1 aristas. Por el Principio de Optimalidad de Bellman, cada ronda garantiza extender en 1 arista el camino óptimo hacia cada vértice alcanzable. Realiza |V|-1 pasadas sobre |E| aristas: Theta(V · E).',
  edgeCases: [
    'Ciclo negativo alcanzable: el algoritmo reporta el ciclo y cancela la validez de las distancias',
    'Aristas con peso cero: se relajan normalmente sin alterar las cotas',
    'Vértices inalcanzables: conservan su distancia infinita intacta',
    'Grafo no ponderado o con todos los pesos positivos: Bellman-Ford encuentra las mismas soluciones que Dijkstra pero en O(V · E)',
  ],
};

export const bellmanFordModule: AlgorithmDefinition = {
  metadata: BELLMAN_FORD_METADATA,
  generateTrace: generateBellmanFordTrace,
  code: BELLMAN_FORD_CODE,
  technicalSheet: BELLMAN_FORD_TECHNICAL_SHEET,
};
