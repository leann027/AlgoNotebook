/**
 * AlgoNotebook — Binary Search Tree (BST) Insertion Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3 y generador puro de trazas.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generateBSTInsertTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateBSTInsertTrace };

export const BST_INSERT_METADATA: AlgorithmMetadata = {
  id: 'bst-insertion',
  name: 'BST Insertion',
  category: 'trees',
  figureId: 'FIG 4.1: BINARY SEARCH TREE INSERTION',
  viewportType: 'tree',
  timeComplexity: {
    best: 'O(log N)',
    average: 'O(log N)',
    worst: 'O(N)',
  },
  spaceComplexity: 'O(H) Call Stack',
  description:
    'Hierarchical node insertion in a Binary Search Tree maintaining the BST invariant.',
};

export const BST_INSERT_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const BST_INSERT_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Insertar una clave numérica en un Árbol Binario de Búsqueda preservando el invariante de ordenación BST.',
  mechanism: [
    'Comparar la clave a insertar contra el nodo actual.',
    'Si la clave es menor, descender por el subárbol izquierdo; si es mayor, descender por el subárbol derecho.',
    'Al alcanzar un enlace nulo (NULL / None), instanciar el nuevo nodo y vincularlo al puntero del nodo padre.',
    'Retornar la referencia a la raíz actualizada.',
  ],
  loopInvariant:
    'Para todo nodo u en el árbol, todas las claves en el subárbol izquierdo de u son estrictamente menores que u.val, y todas las claves en el subárbol derecho de u son estrictamente mayores que u.val.',
  properties: {
    paradigm: 'Estructura de Datos Jerárquica',
    isInPlace: false,
    isStable: false,
  },
  complexity: {
    best: 'O(log N)',
    average: 'O(log N)',
    worst: 'O(N)',
    auxiliarySpace: 'O(H)',
  },
  analogy:
    'Como una red de bifurcaciones en un sendero señalizado: en cada cruce hay un cartel que indica "números menores a la izquierda ⬅️, números mayores a la derecha ➡️". Solo tienes que seguir las flechas hasta encontrar un espacio vacío donde plantar tu nuevo nodo.',
  inPlainWords:
    'Empieza en la raíz del árbol. Compara el nuevo valor con el nodo actual. Si es menor, desciende por la rama izquierda; si es mayor, desciende por la rama derecha. Repite el descenso de forma recursiva hasta encontrar una posición vacía (NULL) y allí enlaza el nuevo nodo al padre correspondiente.',
  complexityExplanation:
    'En un árbol balanceado, cada nivel duplica la cantidad de nodos posibles, por lo que la altura total es H = log₂(N). El costo de inserción es directamente proporcional a la altura H recorrida. En el peor caso (valores insertados ya ordenados), el árbol degenera en una línea recta de altura N, costando O(N).',
  edgeCases: [
    'Inserción en árbol vacío (el nuevo nodo se convierte en raíz)',
    'Inserción de clave duplicada (rechazo o manejo explícito)',
    'Inserción secuencial ordenada (degenera en lista vinculada de altura N)',
  ],
};

export const bstInsertModule: AlgorithmDefinition = {
  metadata: BST_INSERT_METADATA,
  generateTrace: generateBSTInsertTrace,
  code: BST_INSERT_CODE,
  technicalSheet: BST_INSERT_TECHNICAL_SHEET,
};

