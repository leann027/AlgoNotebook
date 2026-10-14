import React, { useEffect, useId, useState } from 'react';
import {
  FileText,
  X,
  Lightbulb,
  Cpu,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import type { AlgorithmTechnicalSheet as ITechnicalSheet, AlgorithmMetadata } from '../../core/types';
import { FormattedMathText } from '../common/FormattedMathText';

export interface AlgorithmTechnicalSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet?: ITechnicalSheet;
  metadata?: AlgorithmMetadata;
}

type SheetTab = 'intuition' | 'mechanism' | 'invariant' | 'complexity' | 'edgeCases';

interface MasterTheoremApplication {
  a: number | string;
  b: number | string;
  d: number | string;
  caseNumber: 1 | 2 | 3;
  condition: string;
}

interface AlgorithmRecurrenceInfo {
  recurrence: string;
  method: string;
  closedForm: string;
  explanation: string;
  isMasterTheoremApplicable: boolean;
  masterTheoremDetails?: MasterTheoremApplication;
}

const ALGORITHM_RECURRENCES: Record<string, AlgorithmRecurrenceInfo> = {
  'merge-sort': {
    recurrence: '$T(n) = 2T(n/2) + \\Theta(n)$',
    method: 'Teorema Maestro (Caso 2)',
    closedForm: '$T(n) = \\Theta(n \\log n)$',
    explanation: 'Divide el arreglo en 2 mitades iguales ($a=2, b=2$) y fusiona en tiempo lineal $\\Theta(n)$ ($d=1$). Como $\\log_b a = \\log_2 2 = 1 = d$, el trabajo por nivel se mantiene constante y equilibrado.',
    isMasterTheoremApplicable: true,
    masterTheoremDetails: {
      a: 2,
      b: 2,
      d: 1,
      caseNumber: 2,
      condition: 'd = \\log_b a \\implies 1 = 1',
    },
  },
  'binary-search': {
    recurrence: '$T(n) = T(n/2) + \\Theta(1)$',
    method: 'Teorema Maestro (Caso 2)',
    closedForm: '$T(n) = \\Theta(\\log n)$',
    explanation: 'Un único subproblema de la mitad del tamaño ($a=1, b=2$) tras una comparación constante $\\Theta(1)$ ($d=0$). Como $\\log_2 1 = 0 = d$, la complejidad asintótica es logarítmica pura.',
    isMasterTheoremApplicable: true,
    masterTheoremDetails: {
      a: 1,
      b: 2,
      d: 0,
      caseNumber: 2,
      condition: 'd = \\log_b a \\implies 0 = 0',
    },
  },
  'quick-sort': {
    recurrence: '$T(n) = 2T(n/2) + \\Theta(n) \\text{ (promedio)} \\quad \\mid \\quad T(n) = T(n-1) + \\Theta(n) \\text{ (peor)}$',
    method: 'Teorema Maestro (Caso 2 en partición balanceada) / Sumatoria Aritmética (peor caso)',
    closedForm: '$\\text{Promedio: } \\Theta(n \\log n) \\quad \\mid \\quad \\text{Peor: } \\Theta(n^2)$',
    explanation: 'En el caso promedio y mejor caso, el pivote divide el arreglo cerca del centro ($a=2, b=2, d=1$). En el peor caso (pivote degenerado), se reduce en 1 elemento originando una sumatoria aritmética $\\sum_{i=1}^n i = \\Theta(n^2)$.',
    isMasterTheoremApplicable: true,
    masterTheoremDetails: {
      a: 2,
      b: 2,
      d: 1,
      caseNumber: 2,
      condition: 'd = \\log_b a \\implies 1 = 1 \\text{ (partición equilibrada)}',
    },
  },
  'min-heap': {
    recurrence: '$\\text{Heapify: } T(n) \\le T(2n/3) + \\Theta(1) \\quad \\mid \\quad \\text{Build-Heap: } T(n) = \\sum_{h=0}^{\\lfloor \\log n \\rfloor} \\left\\lceil \\frac{n}{2^{h+1}} \\right\\rceil \\mathcal{O}(h)$',
    method: 'Teorema Maestro (Heapify) / Serie Aritmético-Geométrica (Build-Heap)',
    closedForm: '$\\text{Heapify: } \\Theta(\\log n) \\quad \\mid \\quad \\text{Build-Heap: } \\Theta(n)$',
    explanation: 'En el peor caso de un montículo binario incompleto, el subárbol más pesado contiene a lo sumo $2n/3$ nodos ($a=1, b=3/2, d=0 \\implies \\log_{3/2} 1 = 0 = d$). La construcción total se acota por la suma convergente $\\sum h/2^h = 2$, resultando en tiempo lineal $\\Theta(n)$.',
    isMasterTheoremApplicable: true,
    masterTheoremDetails: {
      a: 1,
      b: '3/2',
      d: 0,
      caseNumber: 2,
      condition: 'd = \\log_{3/2} 1 = 0',
    },
  },
  'bubble-sort': {
    recurrence: '$T(n) = T(n-1) + \\Theta(n)$',
    method: 'Expansión de Sumatoria Aritmética',
    closedForm: '$T(n) = \\sum_{i=1}^{n-1} (n - i) = \\frac{n(n-1)}{2} = \\Theta(n^2)$',
    explanation: 'Cada pasada desplaza la burbuja máxima hacia el extremo derecho realizando $n-i$ comparaciones adyacentes continuas.',
    isMasterTheoremApplicable: false,
  },
  'insertion-sort': {
    recurrence: '$T(n) = T(n-1) + \\mathcal{O}(n)$',
    method: 'Inducción Decremental / Sumatoria de Inserciones',
    closedForm: '$\\text{Mejor: } \\Theta(n) \\quad \\mid \\quad \\text{Peor/Promedio: } \\Theta(n^2)$',
    explanation: 'Inserta el elemento $n$-ésimo en la porción ya ordenada de tamaño $n-1$. En el mejor caso realiza 1 sola comparación por elemento; en el peor caso desplaza todos los elementos previos.',
    isMasterTheoremApplicable: false,
  },
  'selection-sort': {
    recurrence: '$T(n) = T(n-1) + \\Theta(n)$',
    method: 'Sumatoria Aritmética Incondicional',
    closedForm: '$T(n) = \\sum_{i=1}^{n-1} (n - i) = \\Theta(n^2)$',
    explanation: 'En cada pasada busca el elemento mínimo en el sufijo no ordenado. El número de comparaciones es estrictamente invariante respecto al orden inicial.',
    isMasterTheoremApplicable: false,
  },
  'bst-insertion': {
    recurrence: '$T(h) = T(h-1) + \\Theta(1)$',
    method: 'Descenso Jerárquico por Ramas',
    closedForm: '$\\text{Balanceado: } \\Theta(\\log n) \\quad \\mid \\quad \\text{Degenerado: } \\Theta(n)$',
    explanation: 'Cada comparación decide descender hacia el hijo izquierdo o derecho. La cantidad máxima de operaciones está estrictamente gobernada por la altura $h$ del árbol.',
    isMasterTheoremApplicable: false,
  },
  'inorder-traversal': {
    recurrence: '$T(n) = T(n_{\\text{izq}}) + T(n_{\\text{der}}) + \\Theta(1)$',
    method: 'Sumatoria Estructural de Nodos del Árbol',
    closedForm: '$T(n) = 2n + 1 = \\Theta(n)$',
    explanation: 'Cada nodo y cada puntero nulo se visitan exactamente un número finito y constante de veces, resultando en tiempo lineal exacto.',
    isMasterTheoremApplicable: false,
  },
  'preorder-traversal': {
    recurrence: '$T(n) = T(n_{\\text{izq}}) + T(n_{\\text{der}}) + \\Theta(1)$',
    method: 'Sumatoria Estructural de Nodos del Árbol',
    closedForm: '$T(n) = \\Theta(n)$',
    explanation: 'Emite la clave de la raíz actual y se ramifica hacia subárboles izquierdo y derecho de manera simétrica.',
    isMasterTheoremApplicable: false,
  },
  'bfs-graph': {
    recurrence: '$T(V, E) = \\sum_{v \\in V} (1 + \\operatorname{deg}(v))$',
    method: 'Lema del Apretón de Manos (Handshaking Lemma)',
    closedForm: '$T(V, E) = \\Theta(V + E)$',
    explanation: 'Cada vértice es encolado y desencolado de la cola FIFO exactamente una vez; cada arista de la lista de adyacencia es inspeccionada una vez (grafos dirigidos) o dos veces (no dirigidos).',
    isMasterTheoremApplicable: false,
  },
  'dfs-graph': {
    recurrence: '$T(V, E) = \\sum_{v \\in V} (1 + \\operatorname{deg}(v))$',
    method: 'Árbol de Recubrimiento DFS / Traza de Pila de Llamadas',
    closedForm: '$T(V, E) = \\Theta(V + E)$',
    explanation: 'Explora recursivamente en profundidad verificando el arreglo booleano de visitados para evitar ciclos.',
    isMasterTheoremApplicable: false,
  },
  'dijkstra-graph': {
    recurrence: '$T(V, E) = V \\cdot T_{\\text{extract-min}} + E \\cdot T_{\\text{decrease-key}}$',
    method: 'Amortización de Cola de Prioridad Binaria',
    closedForm: '$T(V, E) = \\Theta((V + E) \\log V)$',
    explanation: '$V$ extracciones del vértice de menor distancia tentativa a $\\mathcal{O}(\\log V)$ y a lo sumo $E$ relajaciones de aristas con actualización en heap a $\\mathcal{O}(\\log V)$.',
    isMasterTheoremApplicable: false,
  },
  'kruskal-graph': {
    recurrence: '$T(V, E) = T_{\\text{sort}}(E) + E \\cdot T_{\\text{find}} + V \\cdot T_{\\text{union}}$',
    method: 'Ordenamiento Voraz + Conjuntos Disjuntos con Compresión de Caminos (Union-Find)',
    closedForm: '$T(V, E) = \\Theta(E \\log E) = \\Theta(E \\log V)$',
    explanation: 'Ordenar las aristas por peso requiere $\\mathcal{O}(E \\log E)$. La detección de ciclos con Union-Find optimizado toma $\\mathcal{O}(E \\cdot \\alpha(V))$, dominando el ordenamiento.',
    isMasterTheoremApplicable: false,
  },
  'knapsack-dp': {
    recurrence: '$V(i, w) = \\max\\bigl(V(i-1, w), \\, V(i-1, w - w_i) + v_i\\bigr)$',
    method: 'Ecuación de Optimalidad de Bellman (Programación Dinámica Tabular)',
    closedForm: '$T(N, W) = \\Theta(N \\cdot W) \\quad (\\text{Complejidad Pseudopolinomial})$',
    explanation: 'Construye una matriz de dimensiones $(N+1) \\times (W+1)$ evaluando cada celda en tiempo $\\mathcal{O}(1)$ a partir de los subproblemas resueltos en la fila previa.',
    isMasterTheoremApplicable: false,
  },
  'lcs-dp': {
    recurrence: '$L[i,j] = \\begin{cases} L[i-1,j-1] + 1 & \\text{si } X[i]=Y[j] \\\\ \\max(L[i-1,j], L[i,j-1]) & \\text{si } X[i]\\ne Y[j] \\end{cases}$',
    method: 'Programación Dinámica 2D con Subproblemas Solapados',
    closedForm: '$T(M, N) = \\Theta(M \\cdot N)$',
    explanation: 'Calcula la longitud de la subsecuencia común más larga rellenando una matriz de tamaño $(M+1) \\times (N+1)$ con transiciones constantes.',
    isMasterTheoremApplicable: false,
  },
  'coin-change-dp': {
    recurrence: '$dp[a] = 1 + \\min_{c \\in C, c \\le a} dp[a - c] \\quad (dp[0] = 0)$',
    method: 'Ecuación de Estados Mínimos Ascendente',
    closedForm: '$T(A, C) = \\Theta(A \\cdot |C|)$',
    explanation: 'Para cada cantidad $a$ desde $1$ hasta la meta $A$, explora cada una de las $|C|$ denominaciones de monedas para hallar la transición óptima.',
    isMasterTheoremApplicable: false,
  },
  'reverse-linked-list': {
    recurrence: '$T(n) = T(n-1) + \\Theta(1)$',
    method: 'Reorientación Lineal de Punteros In-Place',
    closedForm: '$T(n) = \\Theta(n)$',
    explanation: 'Mantiene una tríada de punteros (prev, curr, next) invirtiendo el enlace de cada nodo en tiempo estrictamente $\\mathcal{O}(1)$.',
    isMasterTheoremApplicable: false,
  },
  'cycle-detection': {
    recurrence: '$T(n) = \\mu + \\lambda \\le 2n$',
    method: 'Algoritmo Tortoise and Hare de Floyd',
    closedForm: '$T(n) = \\mathcal{O}(n)$',
    explanation: 'El puntero rápido avanza 2 pasos por 1 del lento. La distancia modular entre ambos dentro del ciclo decrece en 1 cada iteración, garantizando encuentro en a lo sumo $\\lambda$ pasos.',
    isMasterTheoremApplicable: false,
  },
  'stack-operations': {
    recurrence: '$T(\\text{push}) = \\Theta(1), \\quad T(\\text{pop}) = \\Theta(1), \\quad T(\\text{peek}) = \\Theta(1)$',
    method: 'Manipulación Inmediata del Puntero Top (LIFO)',
    closedForm: '$\\mathcal{O}(1) \\text{ estricto en todas las operaciones}$',
    explanation: 'No requiere desplazamiento de elementos ni iteraciones en memoria; opera directamente sobre la dirección del nodo superior.',
    isMasterTheoremApplicable: false,
  },
  'queue-operations': {
    recurrence: '$T(\\text{enqueue}) = \\Theta(1), \\quad T(\\text{dequeue}) = \\Theta(1)$',
    method: 'Acceso Desacoplado a Punteros Front y Rear (FIFO)',
    closedForm: '$\\mathcal{O}(1) \\text{ estricto en todas las operaciones}$',
    explanation: 'La inserción al final y extracción al frente se resuelven actualizando las referencias head/tail en tiempo constante.',
    isMasterTheoremApplicable: false,
  },
  'insert-linked-list': {
    recurrence: '$T(n) = T(n-1) + \\Theta(1)$',
    method: 'Travesía Secuencial de Punteros hasta Nodo Terminal',
    closedForm: '$T(n) = \\Theta(n)$',
    explanation: 'Avanza por la lista enlazada hasta encontrar el nodo con puntero next nulo para enlazar el nuevo nodo asignado en memoria.',
    isMasterTheoremApplicable: false,
  },
  'linear-binary-search': {
    recurrence: '$\\text{Lineal: } T(n) = T(n-1) + \\Theta(1) \\quad \\mid \\quad \\text{Binaria: } T(n) = T(n/2) + \\Theta(1)$',
    method: 'Teorema Maestro (Caso 2 en Búsqueda Binaria) / Decremento Unitario (Lineal)',
    closedForm: '$\\text{Lineal: } \\Theta(n) \\quad \\mid \\quad \\text{Binaria: } \\Theta(\\log n)$',
    explanation: 'La búsqueda binaria divide el espacio a la mitad en cada paso ($a=1, b=2, d=0 \\implies \\log_2 1 = 0 = d$), alcanzando tiempo logarítmico óptimo. La búsqueda lineal inspecciona secuencialmente cada celda en tiempo lineal $\\Theta(n)$.',
    isMasterTheoremApplicable: true,
    masterTheoremDetails: {
      a: 1,
      b: 2,
      d: 0,
      caseNumber: 2,
      condition: 'd = \\log_b a \\implies 0 = \\log_2 1 = 0',
    },
  },
  'search-comparator': {
    recurrence: '$\\text{Lineal: } T(n) = T(n-1) + \\Theta(1) \\quad \\mid \\quad \\text{Binaria: } T(n) = T(n/2) + \\Theta(1)$',
    method: 'Teorema Maestro (Caso 2 en Búsqueda Binaria)',
    closedForm: '$\\text{Lineal: } \\Theta(n) \\quad \\mid \\quad \\text{Binaria: } \\Theta(\\log n)$',
    explanation: 'Comparador directo de órdenes asintóticos: partición logarítmica frente a barrido lineal exhaustivo.',
    isMasterTheoremApplicable: true,
    masterTheoremDetails: {
      a: 1,
      b: 2,
      d: 0,
      caseNumber: 2,
      condition: 'd = \\log_b a \\implies 0 = 0',
    },
  },
  'priority-queue': {
    recurrence: '$\\text{Heapify: } T(n) \\le T(2n/3) + \\Theta(1) \\quad \\mid \\quad \\text{Build-Heap: } T(n) = \\sum_{h=0}^{\\lfloor \\log n \\rfloor} \\left\\lceil \\frac{n}{2^{h+1}} \\right\\rceil \\mathcal{O}(h)$',
    method: 'Teorema Maestro (Caso 2 para Heapify) / Sumatoria Geométrica Convexa (Build-Heap)',
    closedForm: '$\\text{Push/Pop: } \\Theta(\\log n) \\quad \\mid \\quad \\text{Peek: } \\Theta(1)$',
    explanation: 'En el peor caso de un montículo binario incompleto, el subárbol más pesado contiene a lo sumo $2n/3$ nodos ($a=1, b=3/2, d=0 \\implies \\log_{3/2} 1 = 0 = d$). Por el Teorema Maestro Caso 2, la inserción y extracción toman $\\Theta(\\log n)$.',
    isMasterTheoremApplicable: true,
    masterTheoremDetails: {
      a: 1,
      b: '3/2',
      d: 0,
      caseNumber: 2,
      condition: 'd = \\log_{3/2} 1 = 0',
    },
  },
  'min-max-heap': {
    recurrence: '$\\text{Heapify: } T(n) \\le T(2n/3) + \\Theta(1)$',
    method: 'Teorema Maestro (Caso 2)',
    closedForm: '$\\Theta(\\log n)$',
    explanation: 'Operaciones de ascenso (sift-up) y descenso (sift-down) acotadas rígidamente por la altura $\\lfloor \\log_2 n \\rfloor$.',
    isMasterTheoremApplicable: true,
    masterTheoremDetails: {
      a: 1,
      b: '3/2',
      d: 0,
      caseNumber: 2,
      condition: 'd = \\log_{3/2} 1 = 0',
    },
  },
  'kadane': {
    recurrence: '$M(i) = \\max\\bigl(A[i], \\, M(i-1) + A[i]\\bigr) \\quad \\text{con } M(0) = A[0]$',
    method: 'Ecuación de Optimalidad de Bellman (Programación Dinámica 1D)',
    closedForm: '$T(n) = T(n-1) + \\Theta(1) = \\Theta(n)$',
    explanation: 'En cada posición $i$, decide en tiempo constante $\\mathcal{O}(1)$ si extender la suma acumulada previa o iniciar una nueva ventana en $A[i]$. Procesa cada elemento una única vez con espacio auxiliar $\\mathcal{O}(1)$.',
    isMasterTheoremApplicable: false,
  },
  'kadane-dp': {
    recurrence: '$M(i) = \\max\\bigl(A[i], \\, M(i-1) + A[i]\\bigr)$',
    method: 'Ecuación de Optimalidad de Bellman (Programación Dinámica 1D)',
    closedForm: '$T(n) = \\Theta(n)$',
    explanation: 'Subproblemas solapados resueltos mediante memoria escalar constante en una sola pasada.',
    isMasterTheoremApplicable: false,
  },
  'topological-sort': {
    recurrence: '$T(V, E) = \\mathcal{O}(V) + \\sum_{u \\in V} \\bigl(1 + \\operatorname{deg}^+(u)\\bigr) = \\Theta(V + E)$',
    method: 'Algoritmo de Kahn por Eliminación Voraz de Grados de Entrada',
    closedForm: '$T(V, E) = \\Theta(V + E)$',
    explanation: 'Calcula los grados de entrada iniciales en $\\mathcal{O}(V + E)$. Cada vértice ingresa y sale de la cola de fuentes exactamente una vez, y cada arista saliente se descuenta una sola vez en $\\mathcal{O}(1)$.',
    isMasterTheoremApplicable: false,
  },
  'avl-tree': {
    recurrence: '$N(h) = N(h-1) + N(h-2) + 1 \\implies h < 1.4404 \\log_2(n+2) - 0.328$',
    method: 'Invariante de Altura de Árboles de Fibonacci Mínimos y Rotaciones Locales $\\mathcal{O}(1)$',
    closedForm: '$T(n) = \\Theta(\\log n)$',
    explanation: 'El factor de balance $|BF(v)| \\le 1$ previene rigurosamente la degeneración lineal. Ante cualquier desbalance, se restablece el equilibrio en tiempo $\\mathcal{O}(1)$ con rotaciones simples o dobles, manteniendo la altura en $\\mathcal{O}(\\log n)$.',
    isMasterTheoremApplicable: false,
  },
  'bellman-ford': {
    recurrence: '$D^{(k)}[v] = \\min\\left( D^{(k-1)}[v], \\, \\min_{(u, v) \\in E} \\left( D^{(k-1)}[u] + w(u, v) \\right) \\right)$',
    method: 'Programación Dinámica de Caminos Mínimos por Rondas de Relajación',
    closedForm: '$T(V, E) = \\Theta(V \\cdot E)$',
    explanation: 'Ejecuta $|V|-1$ rondas relajando todas las $|E|$ aristas del grafo. Si en la ronda $|V|$ alguna distancia aún puede reducirse, se detecta de manera inequívoca la presencia de un ciclo de costo negativo alcanzable.',
    isMasterTheoremApplicable: false,
  },
  'levenshtein-distance': {
    recurrence: '$D(i, j) = \\begin{cases} j & i=0 \\\\ i & j=0 \\\\ D(i-1, j-1) & S_1[i-1]=S_2[j-1] \\\\ 1 + \\min(D(i-1,j), D(i,j-1), D(i-1,j-1)) & S_1[i-1]\\ne S_2[j-1] \\end{cases}$',
    method: 'Programación Dinámica Tabular Matricial 2D',
    closedForm: '$T(M, N) = \\Theta(M \\cdot N)$',
    explanation: 'Construye una matriz de dimensiones $(M+1) \\times (N+1)$ donde cada celda se calcula en tiempo $\\mathcal{O}(1)$ a partir de sus 3 celdas adyacentes (eliminación, inserción y sustitución).',
    isMasterTheoremApplicable: false,
  },
  'levenshtein': {
    recurrence: '$D(i, j) = \\min\\bigl(D(i-1,j)+1, D(i,j-1)+1, D(i-1,j-1) + \\operatorname{cost}\\bigr)$',
    method: 'Programación Dinámica Matricial 2D',
    closedForm: '$T(M, N) = \\Theta(M \\cdot N)$',
    explanation: 'Mínimo número de operaciones unitarias de edición entre dos prefijos de cadenas.',
    isMasterTheoremApplicable: false,
  },
  'levenshtein-dp': {
    recurrence: '$D(i, j) = \\min\\bigl(D(i-1,j)+1, D(i,j-1)+1, D(i-1,j-1) + \\operatorname{cost}\\bigr)$',
    method: 'Programación Dinámica Matricial 2D',
    closedForm: '$T(M, N) = \\Theta(M \\cdot N)$',
    explanation: 'Mínimo número de operaciones unitarias de edición entre dos prefijos de cadenas.',
    isMasterTheoremApplicable: false,
  },
  'strongly-connected-components': {
    recurrence: '$\\text{lowlink}(u) = \\min\\bigl(\\text{disc}(u), \\min_{(u,v)\\in E, v \\notin \\text{vis}} \\text{lowlink}(v), \\min_{(u,v)\\in E, v \\in \\text{pila}} \\text{disc}(v)\\bigr)$',
    method: 'Recorrido en Profundidad (DFS) con Pila y Valores Low-Link de Tarjan',
    closedForm: '$T(V, E) = \\Theta(V + E)$',
    explanation: 'En un único recorrido DFS completo, visita cada vértice y cada arista exactamente una vez. Cuando $\\text{lowlink}(u) = \\text{disc}(u)$, todos los nodos acumulados en la pila hasta $u$ forman una componente fuertemente conexa maximal.',
    isMasterTheoremApplicable: false,
  },
  'tarjan-scc': {
    recurrence: '$\\text{lowlink}(u) = \\min\\bigl(\\text{disc}(u), \\min \\text{lowlink}(v), \\min \\text{disc}(w)\\bigr)$',
    method: 'DFS con Low-Link de Tarjan',
    closedForm: '$T(V, E) = \\Theta(V + E)$',
    explanation: 'Extracción de componentes fuertemente conexas maximales y condensación del grafo en un DAG.',
    isMasterTheoremApplicable: false,
  },
};

const DEFAULT_RECURRENCE: AlgorithmRecurrenceInfo = {
  recurrence: '$T(n) = T(n-1) + \\mathcal{O}(1)$',
  method: 'Inducción Estructural',
  closedForm: '$T(n) = \\mathcal{O}(n)$',
  explanation: 'El algoritmo realiza transiciones discretas en tiempo acotado.',
  isMasterTheoremApplicable: false,
};

/**
 * AlgorithmTechnicalSheetModal — Pestaña Flotante de Ficha Técnica y Fundamentos
 *
 * Muestra una tarjeta técnica flotante de alta resolución con estética de libreta de ingeniería,
 * explicando el propósito práctico, analogías del mundo real, mecánica paso a paso,
 * justificación asintótica Big-O e invariantes formales sin robar espacio de la pantalla principal.
 */
export const AlgorithmTechnicalSheetModal: React.FC<AlgorithmTechnicalSheetModalProps> = ({
  isOpen,
  onClose,
  sheet,
  metadata,
}) => {
  const [activeTab, setActiveTab] = useState<SheetTab>('intuition');
  const titleId = useId();

  // Capturar tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Si no está abierto o no hay ficha, no renderizar
  if (!isOpen || !sheet) return null;

  const complexityRecord = sheet.complexity as unknown as Record<string, string | undefined>;
  const bestComplexity =
    complexityRecord.timeBest ??
    sheet.complexity.best ??
    metadata?.timeComplexity?.best ??
    '—';
  const avgComplexity =
    complexityRecord.timeAverage ??
    sheet.complexity.average ??
    metadata?.timeComplexity?.average ??
    '—';
  const worstComplexity =
    complexityRecord.timeWorst ??
    sheet.complexity.worst ??
    metadata?.timeComplexity?.worst ??
    '—';
  const spaceComplexity =
    complexityRecord.space ??
    sheet.complexity.auxiliarySpace ??
    metadata?.spaceComplexity ??
    '—';

  const activeRecInfo =
    (metadata?.id && ALGORITHM_RECURRENCES[metadata.id])
      ? ALGORITHM_RECURRENCES[metadata.id]
      : DEFAULT_RECURRENCE;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink-primary/50 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-paper-surface border-2 border-paper-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col text-ink-primary overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Cabecera estilo Ficha de Cuaderno de Ingeniería */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-border bg-paper-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container border border-paper-border flex items-center justify-center text-ink-primary shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  {metadata?.figureId || 'FICHA TÉCNICA'}
                </span>
                <span className="px-2 py-0.2 rounded font-mono text-[10px] font-semibold bg-surface-container-low border border-paper-border text-ink-secondary">
                  {sheet.properties.paradigm}
                </span>
              </div>
              <h2 id={titleId} className="font-headline font-bold text-base sm:text-lg text-ink-primary leading-tight mt-0.5">
                {metadata?.name ?? 'Algoritmo de Ingeniería'} — Fundamentos y Mecánica
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-container transition-colors cursor-pointer"
            title="Cerrar Ficha Técnica (Esc)"
            aria-label="Cerrar Ficha Técnica"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Barra de Navegación Rápida por Pestañas */}
        <div className="flex items-center gap-1 px-5 pt-2.5 pb-2 border-b border-paper-border bg-surface-container-high/40 overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('intuition')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'intuition'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Intuición & Metáfora</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mechanism')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'mechanism'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mecánica Paso a Paso</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invariant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'invariant'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
            <span>Invariante Formal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('complexity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'complexity'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Complejidad Big-O</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edgeCases')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'edgeCases'
                ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Casos Borde</span>
          </button>
        </div>

        {/* 3. Contenedor de Contenido con Scroll Suave */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-paper-base/30">
          {/* PESTAÑA 1: INTUICIÓN & METÁFORA */}
          {activeTab === 'intuition' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Tarjeta de Metáfora Mental / Analogía del mundo real */}
              {sheet.analogy && (
                <div className="bg-[#FFFBEA] border border-[#FDE047] rounded-lg p-4 shadow-postit relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base select-none">💡</span>
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                      Analogía Mental del Mundo Real
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-primary leading-relaxed font-sans font-medium">
                    {sheet.analogy}
                  </p>
                </div>
              )}

              {/* Objetivo Formal */}
              <div className="bg-paper-surface border border-paper-border rounded-lg p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                    ¿Qué problema resuelve y cuál es su objetivo?
                  </h3>
                </div>
                <div className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  <FormattedMathText text={sheet.objective} />
                </div>
              </div>

              {/* En Palabras Sencillas */}
              {sheet.inPlainWords && (
                <div className="bg-surface-container-low border border-paper-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-ink-secondary" />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                      Explicación en Palabras Sencillas
                    </h3>
                  </div>
                  <div className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                    <FormattedMathText text={sheet.inPlainWords} />
                  </div>
                </div>
              )}

              {/* Badges de Propiedades de Algoritmo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded bg-paper-surface border border-paper-border shadow-xs text-center">
                  <span className="font-mono text-[10px] text-ink-muted uppercase block">Paradigma</span>
                  <span className="font-mono text-xs font-bold text-ink-primary mt-1 block">
                    {sheet.properties.paradigm}
                  </span>
                </div>
                <div className="p-3 rounded bg-paper-surface border border-paper-border shadow-xs text-center">
                  <span className="font-mono text-[10px] text-ink-muted uppercase block">¿In-Place en Memoria?</span>
                  <span className="font-mono text-xs font-bold text-ink-primary mt-1 block">
                    {sheet.properties.isInPlace ? 'Sí (O(1) extra)' : 'No (Requiere memoria auxiliar)'}
                  </span>
                </div>
                <div className="p-3 rounded bg-paper-surface border border-paper-border shadow-xs text-center">
                  <span className="font-mono text-[10px] text-ink-muted uppercase block">¿Es Estable?</span>
                  <span className="font-mono text-xs font-bold text-ink-primary mt-1 block">
                    {sheet.properties.isStable === true
                      ? 'Sí (Preserva orden relativo)'
                      : sheet.properties.isStable === false
                      ? 'No (Puede permutar iguales)'
                      : 'N/A (No aplica)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: MECÁNICA OPERATIVA PASO A PASO */}
          {activeTab === 'mechanism' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-paper-surface border border-paper-border rounded-lg p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                    Mecánica Operativa Paso a Paso
                  </h3>
                </div>
                <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                  Flujo de ejecución secuencial y condiciones de transición entre estados:
                </p>

                <ol className="space-y-3">
                  {sheet.mechanism.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-md bg-surface-container-low/70 border border-paper-border hover:bg-surface-container-low transition-colors"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink-primary text-paper-surface font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </span>
                      <div className="text-xs sm:text-sm text-ink-primary leading-relaxed font-mono">
                        <FormattedMathText text={step} />
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Nota de Costo de Recurrencia por Paso */}
                <div className="p-3.5 rounded-lg bg-surface-container-low border border-paper-border mt-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-primary">
                      Transición de Estados y Consumo por Paso
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Cada paso operativo presentado arriba avanza la ejecución resolviendo la relación recursiva:{' '}
                    <span className="font-bold text-ink-primary">
                      <FormattedMathText text={activeRecInfo.recurrence} />
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: INVARIANTE FORMAL */}
          {activeTab === 'invariant' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-paper-surface border border-paper-border rounded-lg p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Bookmark className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                    Invariante Formal de Ciclo / Recursión
                  </h3>
                </div>

                <div className="bg-surface-container-low border-l-4 border-ink-primary p-4 rounded font-mono text-xs sm:text-sm leading-relaxed text-ink-primary shadow-xs my-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                    CONDICIÓN QUE SE CUMPLE EN CADA ITERACIÓN:
                  </span>
                  <FormattedMathText text={sheet.loopInvariant} />
                </div>

                <div className="mt-4 p-3.5 rounded bg-emerald-50/60 border border-emerald-200 text-xs text-ink-secondary leading-relaxed">
                  <strong className="text-emerald-900 font-bold block mb-1">
                    ¿Por qué garantiza la corrección del algoritmo?
                  </strong>
                  Por el principio de inducción matemática: si el invariante es verdadero antes de iniciar la primera pasada (inicialización), se mantiene verdadero tras cada paso individual (mantenimiento), y cuando la condición de salida se alcanza (terminación), el invariante demuestra de forma irrefutable que el resultado es correcto.
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 4: COMPLEJIDAD BIG-O */}
          {activeTab === 'complexity' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-paper-surface border border-paper-border rounded-lg p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                    Análisis de Complejidad Asintótica (Big-O)
                  </h3>
                </div>

                {/* Grid de Complejidades */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  <div className="p-3 rounded bg-emerald-50/70 border border-emerald-200 text-center">
                    <span className="font-mono text-[10px] text-emerald-800 uppercase font-bold block">
                      Mejor Caso
                    </span>
                    <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-950 mt-1 block">
                      <FormattedMathText text={bestComplexity} />
                    </span>
                  </div>

                  <div className="p-3 rounded bg-amber-50/70 border border-amber-200 text-center">
                    <span className="font-mono text-[10px] text-amber-800 uppercase font-bold block">
                      Caso Promedio
                    </span>
                    <span className="font-mono text-sm sm:text-base font-extrabold text-amber-950 mt-1 block">
                      <FormattedMathText text={avgComplexity} />
                    </span>
                  </div>

                  <div className="p-3 rounded bg-rose-50/70 border border-rose-200 text-center">
                    <span className="font-mono text-[10px] text-rose-800 uppercase font-bold block">
                      Peor Caso
                    </span>
                    <span className="font-mono text-sm sm:text-base font-extrabold text-rose-950 mt-1 block">
                      <FormattedMathText text={worstComplexity} />
                    </span>
                  </div>

                  <div className="p-3 rounded bg-indigo-50/70 border border-indigo-200 text-center">
                    <span className="font-mono text-[10px] text-indigo-800 uppercase font-bold block">
                      Espacio Auxiliar
                    </span>
                    <span className="font-mono text-sm sm:text-base font-extrabold text-indigo-950 mt-1 block">
                      <FormattedMathText text={spaceComplexity} />
                    </span>
                  </div>
                </div>

                {/* Explicación Intuitiva de la Complejidad */}
                {sheet.complexityExplanation && (
                  <div className="p-3.5 rounded bg-surface-container-low border border-paper-border text-xs sm:text-sm text-ink-secondary leading-relaxed mt-4">
                    <strong className="text-ink-primary font-bold block font-mono text-xs uppercase mb-1">
                      Justificación Matemática e Intuitiva:
                    </strong>
                    <FormattedMathText text={sheet.complexityExplanation} />
                  </div>
                )}

                {/* Ecuación de Recurrencia y Resolución Asintótica */}
                <div className="p-4 rounded-lg bg-surface-container-low border border-paper-border space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                        Ecuación de Recurrencia del Algoritmo
                      </h4>
                    </div>
                    {activeRecInfo.isMasterTheoremApplicable && (
                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800">
                        Aplica Teorema Maestro
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-paper-surface border border-paper-border rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="overflow-x-auto py-1.5 max-w-full">
                      <span className="font-mono text-[10px] text-ink-muted uppercase block">
                        Relación de Recurrencia:
                      </span>
                      <div className="font-mono text-sm font-bold text-ink-primary mt-0.5">
                        <FormattedMathText text={activeRecInfo.recurrence} />
                      </div>
                    </div>
                    <div className="sm:text-right overflow-x-auto py-1.5 max-w-full">
                      <span className="font-mono text-[10px] text-ink-muted uppercase block">
                        Forma Cerrada:
                      </span>
                      <div className="font-mono text-sm font-extrabold text-emerald-950 mt-0.5">
                        <FormattedMathText text={activeRecInfo.closedForm} />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-ink-secondary leading-relaxed space-y-1">
                    <p>
                      <strong className="text-ink-primary font-mono text-[11px] uppercase mr-1">
                        Método:
                      </strong>
                      <FormattedMathText text={activeRecInfo.method} />
                    </p>
                    <p>
                      <strong className="text-ink-primary font-mono text-[11px] uppercase mr-1">
                        Justificación:
                      </strong>
                      <FormattedMathText text={activeRecInfo.explanation} />
                    </p>
                  </div>
                </div>

                {/* Marco Teórico Formal: Teorema Maestro para Divide y Vencerás */}
                <div className="p-4 rounded-lg bg-paper-surface border border-paper-border shadow-xs space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                      Marco Teórico: Teorema Maestro (Master Theorem)
                    </h4>
                  </div>

                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Resuelve recurrencias canónicas de algoritmos divide y vencerás de la forma:
                  </p>

                  <div className="p-3 bg-surface-container-low border border-paper-border rounded text-center overflow-x-auto py-1.5">
                    <span className="font-mono text-sm sm:text-base font-bold text-ink-primary">
                      <FormattedMathText text="$T(n) = aT(n/b) + \Theta(n^d)$" />
                    </span>
                    <span className="block font-mono text-[10px] text-ink-muted mt-1">
                      donde <FormattedMathText text="$a \ge 1$" />, <FormattedMathText text="$b > 1$" />, <FormattedMathText text="$d \ge 0$" />
                    </span>
                  </div>

                  {/* 3 Casos del Teorema Maestro */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div
                      className={`p-2.5 rounded border text-xs ${
                        activeRecInfo.masterTheoremDetails?.caseNumber === 1
                            ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                          : 'bg-surface-container-low border-paper-border'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-ink-primary block mb-0.5">
                        Caso 1: <FormattedMathText text="$d < \log_b a$" />
                      </span>
                      <div className="font-mono text-xs font-bold text-indigo-900 mt-1 overflow-x-auto py-1.5">
                        <FormattedMathText text="$T(n) = \Theta(n^{\log_b a})$" />
                      </div>
                      <span className="text-[10px] text-ink-muted leading-tight mt-1 block">
                        Dominan las hojas del árbol.
                      </span>
                    </div>

                    <div
                      className={`p-2.5 rounded border text-xs ${
                        activeRecInfo.masterTheoremDetails?.caseNumber === 2
                          ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                          : 'bg-surface-container-low border-paper-border'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-ink-primary block mb-0.5">
                        Caso 2: <FormattedMathText text="$d = \log_b a$" />
                      </span>
                      <div className="font-mono text-xs font-bold text-indigo-900 mt-1 overflow-x-auto py-1.5">
                        <FormattedMathText text="$T(n) = \Theta(n^d \log n)$" />
                      </div>
                      <span className="text-[10px] text-ink-muted leading-tight mt-1 block">
                        Trabajo equilibrado por nivel.
                      </span>
                    </div>

                    <div
                      className={`p-2.5 rounded border text-xs ${
                        activeRecInfo.masterTheoremDetails?.caseNumber === 3
                          ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                          : 'bg-surface-container-low border-paper-border'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-ink-primary block mb-0.5">
                        Caso 3: <FormattedMathText text="$d > \log_b a$" />
                      </span>
                      <div className="font-mono text-xs font-bold text-indigo-900 mt-1 overflow-x-auto py-1.5">
                        <FormattedMathText text="$T(n) = \Theta(n^d)$" />
                      </div>
                      <span className="text-[10px] text-ink-muted leading-tight mt-1 block">
                        Domina el trabajo en la raíz.
                      </span>
                    </div>
                  </div>

                  {activeRecInfo.masterTheoremDetails && (
                    <div className="p-2.5 bg-indigo-50/60 border border-indigo-200 rounded text-xs text-indigo-950 font-mono">
                      <span>Aplicación en este módulo: </span>
                      <FormattedMathText
                        text={`$a=${activeRecInfo.masterTheoremDetails.a}$, $b=${activeRecInfo.masterTheoremDetails.b}$, $d=${activeRecInfo.masterTheoremDetails.d} \\implies ${activeRecInfo.masterTheoremDetails.condition}$`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 5: CASOS BORDE */}
          {activeTab === 'edgeCases' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-paper-surface border border-paper-border rounded-lg p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                    Casos Borde Críticos y Errores Habituales
                  </h3>
                </div>
                <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                  Escenarios extremos que deben considerarse en una implementación de producción o entrevista técnica:
                </p>

                <ul className="space-y-2.5">
                  {sheet.edgeCases.map((edgeCase, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-md bg-surface-container-low/70 border border-paper-border"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-ink-primary leading-relaxed font-mono">
                        <FormattedMathText text={edgeCase} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 4. Pie de la Ficha Flotante */}
        <div className="px-5 py-3 border-t border-paper-border bg-paper-surface flex items-center justify-between shrink-0">
          <span className="font-mono text-[11px] text-ink-muted hidden sm:inline">
            Presiona <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-paper-border font-bold">Esc</kbd> para cerrar
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-ink-primary text-paper-surface hover:bg-ink-primary/90 font-mono text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
