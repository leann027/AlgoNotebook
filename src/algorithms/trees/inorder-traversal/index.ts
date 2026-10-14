/**
 * AlgoNotebook — Inorder Tree Traversal Module
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
import { generateInorderTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateInorderTrace };

export const INORDER_METADATA: AlgorithmMetadata = {
  id: 'inorder-traversal',
  name: 'Recorrido Inorder (Árbol)',
  category: 'trees',
  figureId: 'FIG 4.2: INORDER BINARY TREE TRAVERSAL (L-V-R)',
  viewportType: 'tree',
  timeComplexity: {
    best: 'O(N)',
    average: 'O(N)',
    worst: 'O(N)',
  },
  spaceComplexity: 'O(H) Call Stack',
  description: 'Symmetric recursive traversal (Left-Root-Right) generating an ascending ordered sequence on BSTs.',
};

export const INORDER_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const INORDER_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Visitar cada nodo de un árbol binario exactamente una vez en orden simétrico (subárbol izquierdo, raíz, subárbol derecho).',
  mechanism: [
    'Verificar si el nodo actual es NULL; en tal caso retornar inmediatamente (caso base).',
    'Llamar recursivamente a inorder sobre el puntero al hijo izquierdo (root->left).',
    'Visitar y procesar el valor del nodo actual (root->data), emitiéndolo al búfer de salida.',
    'Llamar recursivamente a inorder sobre el puntero al hijo derecho (root->right).',
    'Retornar al marco padre en la pila de llamadas tras completar ambos subárboles.',
  ],
  loopInvariant:
    'Al procesar la raíz del subárbol u, todos los nodos en su subárbol izquierdo ya han sido emitidos a la salida, y ningún nodo en su subárbol derecho ha sido visitado aún.',
  properties: {
    paradigm: 'Estructura de Datos Jerárquica / Divide y Vencerás',
    isInPlace: false,
    isStable: true,
  },
  complexity: {
    best: 'O(N)',
    average: 'O(N)',
    worst: 'O(N)',
    auxiliarySpace: 'O(H)',
  },
  analogy:
    'Como proyectar la sombra perpendicular de todos los nodos del árbol hacia el suelo: si iluminas el árbol verticalmente desde arriba, los nodos caerán en una línea recta horizontal perfectamente ordenados de menor a mayor.',
  inPlainWords:
    'Sigue la regla estricta: Izquierda → Raíz → Derecha. Primero se sumerge hasta el fondo del subárbol izquierdo; luego procesa el valor del nodo actual; finalmente desciende al subárbol derecho. En un Árbol Binario de Búsqueda (BST), este orden garantiza que los elementos salgan ordenados de forma no decreciente.',
  complexityExplanation:
    'Cada uno de los N nodos del árbol se visita un número constante de veces (bajada y retorno). Como no se procesa ningún nodo por duplicado, el tiempo total es estrictamente lineal O(N). El espacio auxiliar depende de la profundidad máxima de la pila de llamadas (altura H del árbol).',
  edgeCases: [
    'Árbol vacío (retorno inmediato sin operaciones)',
    'Árbol degenerado / lista lineal (profundidad de pila O(N))',
    'Árbol binario balanceado (profundidad de pila óptima O(log N))',
  ],
};

export const inorderTraversalModule: AlgorithmDefinition = {
  metadata: INORDER_METADATA,
  code: INORDER_CODE,
  generateTrace: (data?: number[]) => generateInorderTrace(data),
  technicalSheet: INORDER_TECHNICAL_SHEET,
};
