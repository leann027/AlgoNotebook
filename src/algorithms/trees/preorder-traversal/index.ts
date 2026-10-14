/**
 * AlgoNotebook — Preorder Tree Traversal Algorithm Module
 *
 * Exporta el contrato unificado AlgorithmDefinition (AlgorithmModule),
 * metadatos pedagógicos, código fuente en C99 / Python 3, ficha técnica
 * y generador puro de trazas de árbol con pila de llamadas.
 */

import type {
  AlgorithmMetadata,
  AlgorithmDefinition,
  AlgorithmSourceCode,
  AlgorithmTechnicalSheet,
} from '../../../core/types';
import { generatePreorderTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generatePreorderTrace };

export const PREORDER_METADATA: AlgorithmMetadata = {
  id: 'preorder-traversal',
  name: 'Recorrido Preorder (Árbol)',
  category: 'trees',
  figureId: 'FIG 4.3: PREORDER BINARY TREE TRAVERSAL (V-L-R)',
  viewportType: 'tree',
  timeComplexity: {
    best: 'O(N)',
    average: 'O(N)',
    worst: 'O(N)',
  },
  spaceComplexity: 'O(H) Call Stack',
  description:
    'Recursive depth-first tree traversal visiting root first, followed by left and right subtrees (V-L-R).',
};

export const PREORDER_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const PREORDER_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Recorrer sistemáticamente un árbol binario procesando primero el nodo raíz actual antes de descender recursivamente a sus subárboles izquierdo y derecho.',
  mechanism: [
    'Verificar caso base: si root es NULL, retornar inmediatamente.',
    'Visitar la raíz: procesar y emitir el valor del nodo actual a la secuencia de salida.',
    'Llamada recursiva izquierda: preorder(root->left).',
    'Llamada recursiva derecha: preorder(root->right).',
    'Desapilar el marco actual al completar ambos descendientes.',
  ],
  loopInvariant:
    'Al procesar un nodo u, todos sus ancestros ya han sido visitados, y ninguno de sus descendientes en los subárboles izquierdo o derecho ha sido procesado aún.',
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
  edgeCases: [
    'Árbol vacío: retorno inmediato sin visitas.',
    'Árbol degenerado (lista enlazada): profundidad de recursión O(N).',
    'Árbol perfectamente balanceado: profundidad de recursión O(log N).',
  ],
  analogy:
    'Esquema jerárquico de carpetas en un sistema de archivos: se lee el nombre de la carpeta contenedora antes de listar el contenido de sus subcarpetas.',
};

export const preorderTraversalModule: AlgorithmDefinition = {
  metadata: PREORDER_METADATA,
  code: PREORDER_CODE,
  generateTrace: (input?: number[]) => generatePreorderTrace(input),
  technicalSheet: PREORDER_TECHNICAL_SHEET,
};

