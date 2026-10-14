/**
 * AlgoNotebook — Floyd's Tortoise and Hare Cycle Detection Module
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
import { generateCycleDetectionTrace } from './trace';
import codeC from './code.c?raw';
import codePy from './code.py?raw';

export { generateCycleDetectionTrace };

export const CYCLE_DETECTION_METADATA: AlgorithmMetadata = {
  id: 'cycle-detection',
  name: 'Detección de Ciclos (Floyd)',
  category: 'pointers',
  figureId: 'FIG 7.2: FLOYD TORTOISE & HARE CYCLE DETECTION',
  viewportType: 'linked-list',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(N)',
    worst: 'O(N)',
  },
  spaceComplexity: 'O(1) In-Place',
  description: 'Cycle detection in singly linked lists using two pointers moving at different speeds (1x vs 2x).',
};

export const CYCLE_DETECTION_CODE: AlgorithmSourceCode = {
  c: codeC,
  python: codePy,
};

export const CYCLE_DETECTION_TECHNICAL_SHEET: AlgorithmTechnicalSheet = {
  objective:
    'Determinar si una lista simplemente enlazada contiene un ciclo cerrado en tiempo lineal y memoria constante O(1).',
  mechanism: [
    'Inicializar dos punteros en la cabeza de la lista: slow (tortuga) y fast (liebre).',
    'En cada iteración, avanzar el puntero slow una posición (slow = slow->next) y el puntero fast dos posiciones (fast = fast->next->next).',
    'Si fast o fast->next alcanzan NULL, la lista es acíclica y el algoritmo concluye retornando false.',
    'Si en algún momento slow y fast apuntan a la misma dirección física de memoria (slow == fast), se confirma la presencia de un ciclo cerrado y se retorna true.',
  ],
  loopInvariant:
    'Si existe un ciclo de longitud C, en cada iteración la distancia relativa modular entre la liebre y la tortuga disminuye exactamente en 1, garantizando el encuentro en como máximo C iteraciones tras entrar al bucle.',
  properties: {
    paradigm: 'Dos Punteros (Two Pointers) / Liebre y Tortuga',
    isInPlace: true,
    isStable: true,
  },
  complexity: {
    best: 'O(1)',
    average: 'O(N)',
    worst: 'O(N)',
    auxiliarySpace: 'O(1)',
  },
  analogy:
    'Dos corredores en una pista de atletismo: la liebre corre al doble de velocidad que la tortuga. Si la pista es una línea recta abierta, la liebre llegará a la meta y nunca se volverán a encontrar. Pero si la pista es un circuito circular cerrado, la liebre inevitablemente alcanzará y superará a la tortuga por detrás.',
  inPlainWords:
    'Avanza dos punteros al mismo tiempo: slow se mueve de 1 en 1 nodo, mientras que fast se mueve de 2 en 2. Si fast o su nodo siguiente encuentran un enlace nulo (NULL), la lista es lineal y termina sin ciclos. Si ambos punteros coinciden en la misma dirección de memoria (slow == fast), se demuestra de forma matemática la presencia de un bucle cerrado.',
  complexityExplanation:
    'Si la lista no tiene ciclo, fast llega a NULL en N/2 pasos. Si contiene un ciclo de longitud C, una vez que ambos entran en el bucle, la distancia relativa entre ellos se reduce en 1 en cada iteración, garantizando la colisión en a lo sumo C pasos. Por lo tanto, el tiempo total es O(N) y solo emplea dos punteros sin memoria extra O(1).',
  edgeCases: [
    'Lista vacía (head == NULL) o de un solo nodo sin ciclo (head->next == NULL)',
    'Ciclo en el nodo cabeza (head->next == head)',
    'Ciclo largo en el extremo final de la lista',
  ],
};

export const cycleDetectionModule: AlgorithmDefinition = {
  metadata: CYCLE_DETECTION_METADATA,
  code: CYCLE_DETECTION_CODE,
  generateTrace: (data?: number[]) => generateCycleDetectionTrace(data),
  technicalSheet: CYCLE_DETECTION_TECHNICAL_SHEET,
};
