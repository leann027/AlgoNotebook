/**
 * AlgoNotebook — Componentes Fuertemente Conexas (Tarjan's SCC) Module
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
import { generateStronglyConnectedComponentsTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateStronglyConnectedComponentsTrace };

export const SCC_METADATA: AlgorithmMetadata = {
  id: 'strongly-connected-components',
  name: 'Componentes Fuertemente Conexas (Tarjan)',
  category: 'graphs',
  figureId: 'FIG 14.1: TARJAN DFS LOW-LINK CONDENSATION DAG',
  viewportType: 'graph',
  timeComplexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
  },
  spaceComplexity: 'O(V) Pila de DFS y Marcas de Tiempo',
  description:
    'Partición de grafos dirigidos en componentes fuertemente conexas maximales en una única travesía DFS en tiempo O(V + E) utilizando valores low-link y pila de retroceso.',
};

export const SCC_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const SCC_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Particionar los vértices de un grafo dirigido en subgrafos maximales mutuamente alcanzables (donde para todo par de nodos u, v dentro de la componente existe tanto un camino u → v como v → u).',
  mechanism: [
    'Asignar a cada vértice un número secuencial de descubrimiento disc[u] y un valor lowlink[u] inicializado igual a disc[u].',
    'Apilar el vértice en una pila de nodos activos y marcarlo como on_stack.',
    'Explorar cada arista saliente (u, v): si v no ha sido visitado, invocar recursivamente DFS y actualizar lowlink[u] = min(lowlink[u], lowlink[v]).',
    'Si v ya fue visitado y permanece en la pila activa (arista de retroceso en la misma SCC), actualizar lowlink[u] = min(lowlink[u], disc[v]).',
    'Al retornar de la exploración, si lowlink[u] == disc[u], u es la raíz de una componente fuertemente conexa maximal.',
    'Desapilar todos los vértices desde la cima de la pila hasta alcanzar u inclusive; el conjunto desapilado constituye la SCC completa.',
  ],
  loopInvariant:
    'Los nodos que permanecen en la pila forman un camino en el árbol DFS junto con subárboles no resueltos. Al detectar lowlink[u] == disc[u], no existe ninguna arista que conecte el subárbol de u con un ancestro anterior a u, garantizando que el conjunto desapilado es una SCC maximal.',
  properties: {
    paradigm: 'Grafos / Búsqueda en Profundidad (DFS) con Low-Link',
    isInPlace: false,
    isStable: false,
  },
  complexity: {
    best: 'O(V + E) (recorrido DFS lineal)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    auxiliarySpace: 'O(V) (arreglos disc, lowlink, pila de nodos y llamadas recursivas)',
  },
  analogy:
    'Como analizar las redes de tráfico de sentido único en una ciudad: una componente fuertemente conexa es una zona de calles donde puedes circular en auto desde cualquier esquina hasta cualquier otra y regresar sin quedar atrapado en una calle sin salida.',
  inPlainWords:
    'Explora el grafo siguiendo flechas y poniéndole números de llegada a cada nodo. Cuando encuentra un camino que vuelve hacia atrás, se da cuenta de que cerró un circuito. Cuando termina de explorar un nodo que no conecta con nada más antiguo, saca todos los nodos del circuito juntos como un grupo cerrado.',
  complexityExplanation:
    'Cada vértice y cada arista se visitan exactamente una vez en el recorrido en profundidad. Cada vértice se apila y desapila una sola vez. No realiza múltiples pasadas como Kosaraju, logrando una ejecución directa en tiempo Theta(V + E).',
  edgeCases: [
    'Grafo Acíclico Dirigido (DAG): cada vértice constituye una SCC individual de tamaño 1 (V componentes en total)',
    'Grafo completamente conexo (un ciclo gigante que incluye a todos): retorna una sola SCC que contiene los V vértices',
    'Grafo con componentes aisladas no conectadas: ejecuta DFS sobre cada componente disconexa',
    'Vértices sumidero sin aristas salientes: forman SCCs unitarias inmediatas al alcanzarse',
  ],
};

export const stronglyConnectedComponentsModule: AlgorithmDefinition = {
  metadata: SCC_METADATA,
  generateTrace: generateStronglyConnectedComponentsTrace,
  code: SCC_CODE,
  technicalSheet: SCC_TECHNICAL_SHEET,
};
