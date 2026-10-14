/**
 * AlgoNotebook — Árbol AVL (Rotaciones Auto-Balanceables) Module
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
import { generateAvlTreeTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateAvlTreeTrace };

export const AVL_TREE_METADATA: AlgorithmMetadata = {
  id: 'avl-tree',
  name: 'Árbol AVL (Rotaciones)',
  category: 'trees',
  figureId: 'FIG 11.1: BALANCED BST AND FIBONACCI HEIGHT BOUND',
  viewportType: 'tree',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log N)',
    worst: 'O(log N)',
  },
  spaceComplexity: 'O(log N) Pila de Recursión',
  description:
    'Árbol binario de búsqueda auto-balanceable que garantiza altura máxima h <= 1.44 log2(N) mediante rotaciones simples (LL, RR) y dobles (LR, RL) ante inserciones desbalanceadas.',
};

export const AVL_TREE_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const AVL_TREE_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Mantener balanceado un árbol binario de búsqueda asegurando que la diferencia de alturas entre subárboles izquierdo y derecho de cualquier nodo sea a lo sumo 1, evitando la degeneración lineal O(N) del BST común.',
  mechanism: [
    'Insertar la clave siguiendo las reglas estándar de un BST (menor a la izquierda, mayor a la derecha).',
    'En el retorno de la recursión, recalcular la altura del nodo actual: height(v) = 1 + max(height(left), height(right)).',
    'Calcular el factor de balance: BF(v) = height(left) - height(right).',
    'Si BF > 1 y key < left.key: Caso Left-Left (LL), ejecutar rotación simple a la derecha.',
    'Si BF < -1 y key > right.key: Caso Right-Right (RR), ejecutar rotación simple a la izquierda.',
    'Si BF > 1 y key > left.key: Caso Left-Right (LR), ejecutar rotación izquierda en el hijo izquierdo seguida de rotación derecha en el nodo.',
    'Si BF < -1 y key < right.key: Caso Right-Left (RL), ejecutar rotación derecha en el hijo derecho seguida de rotación izquierda en el nodo.',
  ],
  loopInvariant:
    'Para todo nodo v en el árbol, |height(left(v)) - height(right(v))| <= 1. El árbol más disperso posible de altura h es un árbol de Fibonacci con N(h) = N(h-1) + N(h-2) + 1 nodos, garantizando h < 1.4404 log2(n+2).',
  properties: {
    paradigm: 'Estructuras de Datos Jerárquicas Auto-Balanceables',
    isInPlace: true,
    isStable: false,
  },
  complexity: {
    best: 'O(1) (inserción directa en la raíz)',
    average: 'O(log N)',
    worst: 'O(log N) (estrictamente acotada por la cota de Fibonacci)',
    auxiliarySpace: 'O(log N) en la pila de llamadas de recursión',
  },
  analogy:
    'Como una balanza de precisión de dos platos: si un platillo se inclina dos escalones más abajo que el otro, un mecanismo mecánico reacomoda las pesas en un solo movimiento rápido de balanceo para nivelar ambos lados.',
  inPlainWords:
    'Un árbol de búsqueda inteligente que se endereza solo. Cada vez que metes un número, revisa si el árbol quedó torcido. Si un lado pesa más que el otro, hace un giro de ramas (rotación) para que quede parejo y nunca se convierta en una lista larga.',
  complexityExplanation:
    'Debido al invariante de balance, la altura nunca degenera a O(n). La búsqueda, inserción y rebalanceo toman a lo sumo el tiempo proporcional a la altura del árbol O(log N). Las rotaciones requieren reasignar únicamente 3 a 5 punteros en tiempo O(1).',
  edgeCases: [
    'Inserción en orden estrictamente creciente: sin balance degeneraría a lista lineal en O(N); AVL ejecuta rotaciones RR continuas manteniéndolo en O(log N)',
    'Inserción en orden estrictamente decreciente: balancea mediante rotaciones LL continuas',
    'Patrones en zigzag (menor-mayor o mayor-menor): dispara rotaciones dobles (LR o RL)',
    'Clave duplicada: se descarta sin modificar la topología del árbol',
  ],
};

export const avlTreeModule: AlgorithmDefinition = {
  metadata: AVL_TREE_METADATA,
  generateTrace: generateAvlTreeTrace,
  code: AVL_TREE_CODE,
  technicalSheet: AVL_TREE_TECHNICAL_SHEET,
};
