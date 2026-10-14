/**
 * AlgoNotebook — Montículo Binario (Min-Heap / Heapify-Up) Algorithm Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, ficha técnica
 * y generador puro de trazas para Min-Heap.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateMinHeapTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateMinHeapTrace };

export const MIN_HEAP_METADATA: AlgorithmMetadata = {
  id: 'min-heap',
  name: 'Min-Heap (Montículo)',
  category: 'trees',
  figureId: 'FIG 4.2: MIN-HEAP INSERTION AND HEAPIFY-UP',
  viewportType: 'tree',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log N)',
    worst: 'O(log N)',
  },
  spaceComplexity: 'O(1) Auxiliar (O(N) arreglo)',
  description:
    'Complete binary min-heap with insertion and upward percolation (heapify-up) maintaining the min-heap invariant parent <= children.',
};

export const MIN_HEAP_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const MIN_HEAP_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Insertar claves secuenciales en un árbol binario completo respetando la propiedad de montículo mínimo (Min-Heap): el valor de cada nodo padre es menor o igual al valor de sus nodos hijos, manteniendo el elemento mínimo global permanentemente en la raíz.',
  mechanism: [
    'Representación en arreglo contiguo: La raíz reside en el índice 0; para cualquier nodo i, su hijo izquierdo está en 2i + 1, su hijo derecho en 2i + 2, y su padre en (i - 1) / 2.',
    'Colocación al final: El nuevo elemento se coloca en la primera posición libre al final del arreglo (índice size), preservando la forma de árbol binario balanceado y completo.',
    'Heapify-Up (Burbujeo hacia arriba): Mientras el nodo actual no sea la raíz (i > 0) y su clave sea menor que la de su padre (data[i] < data[parent(i)]), intercambiar sus posiciones en el arreglo.',
    'Actualización de índice: Tras cada intercambio, desplazar el puntero de índice i hacia su padre i = parent(i) y repetir la comparación hasta que el invariante se restablezca.',
  ],
  loopInvariant:
    'Al inicio de cada iteración del bucle heapify-up, todo el árbol binario satisface la propiedad de min-heap excepto posiblemente en la arista entre el nodo en el índice i y su padre parent(i).',
  properties: {
    paradigm: 'Estructura de Datos Jerárquica / Árbol Binario Completo',
    isInPlace: true,
    isStable: false,
  },
  complexity: {
    best: 'O(1) (cuando el nuevo elemento es mayor o igual a su padre directo)',
    average: 'O(log N) (ascenso a lo largo de niveles proporcionales a la altura del árbol)',
    worst: 'O(log N) (ascenso completo hasta la raíz del montículo de altura floor(log2 N))',
    auxiliarySpace: 'O(1) (solo variables auxiliares de índice e intercambio)',
  },
  analogy:
    'Como una burbuja de aire sumergida en agua: un elemento más ligero (menor valor) naturalmente asciende a través de las capas del árbol hasta encontrar una posición donde no sea más ligero que quien está encima de él. Si es el más liviano de todos, sube imparable hasta la superficie misma (la raíz).',
  inPlainWords:
    'Para insertar un número, lo colocas en el primer hueco libre al final del árbol para no romper su forma perfecta. Luego lo comparas con su padre: si el nuevo número es más chico, se intercambian para que el menor quede arriba. Repites este ascenso hasta que el padre sea menor o hasta llegar a la raíz. Dado que un árbol completo se dobla en cada nivel, este ascenso toma muy pocos pasos (a lo sumo log2 N).',
  complexityExplanation:
    'Un árbol binario completo de N nodos tiene exactamente altura h = floor(log2 N). Como en cada iteración de heapifyUp el nodo asciende al menos un nivel hacia la raíz mediante comparaciones directas O(1), la inserción realiza como máximo log2 N comparaciones e intercambios, con O(1) de memoria auxiliar.',
  edgeCases: [
    'Montículo vacío (size == 0): El primer elemento se inserta en el índice 0 y se convierte en la raíz en O(1) sin comparaciones.',
    'Inserción del menor elemento global: El nuevo valor debe burbujear por todos los niveles hasta la raíz en exactamente floor(log2 N) pasos.',
    'Inserción de elementos duplicados: Se colocan de forma válida como hijos de elementos iguales, preservando padre <= hijos.',
    'Desbordamiento de capacidad: Si el arreglo subyacente alcanza su límite estático, se debe redimensionar dinámicamente o abortar.',
  ],
};

export const minHeapModule: AlgorithmDefinition = {
  metadata: MIN_HEAP_METADATA,
  generateTrace: generateMinHeapTrace,
  code: MIN_HEAP_CODE,
  technicalSheet: MIN_HEAP_TECHNICAL_SHEET,
};
