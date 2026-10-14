/**
 * AlgoNotebook — Core Data Contracts & Interfaces
 *
 * Directivas de diseño y arquitectura:
 * - Agents.md: TypeScript estricto, sin `any`, uniones discriminadas, cero UI en lógica.
 * - Stitch/DESIGN.md: Sincronización multilenguaje C (C99) / Python 3, métricas de laboratorio,
 *   y desacoplamiento total de motores de ejecución.
 */

// ============================================================================
// 1. Lenguajes Soportados y Resaltado Sincronizado
// ============================================================================

/**
 * Lenguajes de programación soportados para la trazabilidad sincronizada en el panel de código.
 */
export type SupportedLang = 'c' | 'python';

/**
 * Mapeo estricto de líneas a resaltar por lenguaje (índices base 1).
 */
export interface HighlightLines {
  c: number[];
  python: number[];
}

// ============================================================================
// 2. Estados Visuales y Acciones de Elementos
// ============================================================================

/**
 * Acción algorítmica activa que determina la semántica visual y el color del resaltador:
 * - compare: Resaltador amarillo (#FEF08A) — Lectura y comparación activa.
 * - swap: Resaltador coral (#FFD7BA) — Mutación o intercambio en memoria.
 * - locked: Resaltador menta (#BBF7D0) — Elemento en su posición ordenada definitiva.
 * - pivot: Resaltador lavanda (#E9D5FF) — Selección de pivote o elemento centinela.
 * - idle: Sin acción activa o estado de reposo.
 */
export type ActiveAction = 'compare' | 'swap' | 'locked' | 'pivot' | 'idle';

/**
 * Estado semántico de cada elemento individual en la memoria o array:
 * - default: Estado neutral / sin destacar.
 * - comparing: Elemento participando en una comparación.
 * - swapping: Elemento en proceso de intercambio físico.
 * - sorted: Elemento bloqueado / confirmado como ordenado.
 * - pointer: Elemento señalado por un puntero auxiliar (i, j, low, high, etc.).
 */
export type ElementState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pointer';

// ============================================================================
// 3. Detalles de Comparación, Explicación y Métricas
// ============================================================================

/**
 * Información detallada de una comparación entre dos elementos del arreglo.
 */
export interface ComparisonDetails {
  leftIndex: number;
  rightIndex: number;
  leftValue: number;
  rightValue: number;
  conditionMet: boolean;
}

/**
 * Anotación pedagógica táctil estilo "Post-it" asociada al fotograma.
 */
export interface FrameExplanation {
  stepLabel: string;
  text: string;
  subNote?: string;
}

/**
 * Métricas acumuladas y límites teóricos de la ejecución algorítmica.
 */
export interface TraceMetrics {
  comparisons: number;
  swaps: number;
  passNumber: number;
  totalPasses?: number;
  maxComparisons?: number;
}

// ============================================================================
// 4. Eventos Algorítmicos (Uniones Discriminadas)
// ============================================================================

export interface CompareEvent {
  readonly type: 'compare';
  readonly leftIndex: number;
  readonly rightIndex: number;
  readonly leftValue: number;
  readonly rightValue: number;
  readonly conditionMet: boolean;
}

export interface SwapEvent {
  readonly type: 'swap';
  readonly leftIndex: number;
  readonly rightIndex: number;
  readonly leftValue: number;
  readonly rightValue: number;
}

export interface LockEvent {
  readonly type: 'locked';
  readonly index: number;
  readonly value: number;
}

export interface PivotEvent {
  readonly type: 'pivot';
  readonly index: number;
  readonly value: number;
}

export interface PointerMoveEvent {
  readonly type: 'pointer';
  readonly name: string;
  readonly index: number;
}

export interface IdleEvent {
  readonly type: 'idle';
}

/**
 * Unión discriminada exhaustiva de eventos discretos generados por un algoritmo.
 */
export type TraceEvent =
  | CompareEvent
  | SwapEvent
  | LockEvent
  | PivotEvent
  | PointerMoveEvent
  | IdleEvent;

// ============================================================================
// 5. Snapshots Tipados (Uniones Discriminadas)
// ============================================================================

export interface CompareSnapshot {
  readonly kind: 'compare';
  readonly comparison: ComparisonDetails;
  readonly arrayState: readonly number[];
  readonly elementStates: Readonly<Record<number, ElementState>>;
  readonly pointers: Readonly<Record<string, number>>;
}

export interface SwapSnapshot {
  readonly kind: 'swap';
  readonly swappedIndices: readonly [number, number];
  readonly arrayState: readonly number[];
  readonly elementStates: Readonly<Record<number, ElementState>>;
  readonly pointers: Readonly<Record<string, number>>;
}

export interface LockedSnapshot {
  readonly kind: 'locked';
  readonly lockedIndex: number;
  readonly arrayState: readonly number[];
  readonly elementStates: Readonly<Record<number, ElementState>>;
  readonly pointers: Readonly<Record<string, number>>;
}

export interface PivotSnapshot {
  readonly kind: 'pivot';
  readonly pivotIndex: number;
  readonly arrayState: readonly number[];
  readonly elementStates: Readonly<Record<number, ElementState>>;
  readonly pointers: Readonly<Record<string, number>>;
}

export interface IdleSnapshot {
  readonly kind: 'idle';
  readonly arrayState: readonly number[];
  readonly elementStates: Readonly<Record<number, ElementState>>;
  readonly pointers: Readonly<Record<string, number>>;
}

/**
 * Unión discriminada de snapshots inmutables para pattern matching seguro.
 */
export type TraceSnapshot =
  | CompareSnapshot
  | SwapSnapshot
  | LockedSnapshot
  | PivotSnapshot
  | IdleSnapshot;

// ============================================================================
// 6. Contrato de Fotograma de Ejecución (TraceFrame)
// ============================================================================

export interface StackFrame {
  id: string;
  functionName: string;
  args: Record<string, string | number>;
  isActive?: boolean;
}

export interface TreeNodeData {
  id: string;
  value: number;
  leftId?: string | null;
  rightId?: string | null;
  state?: ElementState;
}

export interface TreeAlgorithmState {
  rootId?: string | null;
  nodes: Record<string, TreeNodeData>;
  activeNodeId?: string | null;
  insertedNodeId?: string | null;
  visitedPath?: string[];
  currentKey?: number | null;
}

export interface GraphNodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  state?: ElementState;
}

export interface GraphEdgeData {
  id: string;
  from: string;
  to: string;
  weight?: number;
  state?: 'default' | 'active' | 'traversed';
}

export interface DijkstraTableEntry {
  vertex: string;
  distance: number | '∞';
  predecessor: string | '-';
  isSettled: boolean;
}

export interface GraphAlgorithmState {
  nodes: Record<string, GraphNodeData>;
  edges: GraphEdgeData[];
  currentNodeId?: string | null;
  activeEdgeId?: string | null;
  queue?: string[];
  dijkstraTable?: Record<string, DijkstraTableEntry>;
}

export interface MatrixCellData {
  row: number;
  col: number;
  value: number | string | null;
  state?: 'default' | 'computing' | 'dependent' | 'optimal' | 'computed';
}

export interface MatrixRowHeader {
  index: number;
  label: string;
  subLabel?: string;
}

export interface MatrixColHeader {
  index: number;
  label: string;
}

export interface MatrixGridAlgorithmState {
  numRows: number;
  numCols: number;
  rowHeaders: MatrixRowHeader[];
  colHeaders: MatrixColHeader[];
  cells: MatrixCellData[][];
  activeCell?: { row: number; col: number } | null;
  dependentCells?: Array<{ row: number; col: number }>;
  optimalPathCells?: Array<{ row: number; col: number }>;
  reconstructedItems?: Array<{ index: number; weight: number; value: number }>;
  capacity?: number;
  currentFormula?: string;
}

export interface LinkedListNodeData {
  id: string;
  value: number;
  address: string;
  nextId: string | null;
  state: ElementState;
}

export interface LinkedListAlgorithmState {
  nodes: LinkedListNodeData[];
  headId: string | null;
  pointers: {
    prev?: string | null;
    curr?: string | null;
    next?: string | null;
    slow?: string | null;
    fast?: string | null;
    top?: string | null;
    front?: string | null;
    rear?: string | null;
  };
  hasCycle?: boolean;
}

/**
 * Fotograma inmutable individual generado por la ejecución paso a paso de un algoritmo.
 * Cumple estrictamente con el contrato de Agents.md y Stitch/DESIGN.md.
 */
export interface TraceFrame {
  stepIndex: number;
  totalSteps: number;
  highlightLines: {
    c: number[];
    python: number[];
  };
  arrayState: number[];
  elementStates: Record<number, ElementState>;
  pointers: Record<string, number>;
  activeAction: ActiveAction;
  callStack?: StackFrame[];
  treeState?: TreeAlgorithmState;
  graphState?: GraphAlgorithmState;
  matrixState?: MatrixGridAlgorithmState;
  linkedListState?: LinkedListAlgorithmState;
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
  /**
   * Evento discriminado opcional para consumidores con exhaustiveness checking.
   */
  event?: TraceEvent;
  /**
   * Snapshot tipado inmutable opcional.
   */
  snapshot?: TraceSnapshot;
}

// ============================================================================
// 7. Complejidad y Metadatos de Algoritmos
// ============================================================================

/**
 * Categorías pedagógicas de algoritmos soportadas en el catálogo.
 */
export type AlgorithmCategory = 'sorting' | 'trees' | 'graphs' | 'dp' | 'pointers';

/**
 * Desglose de complejidad temporal en notación Big-O.
 */
export type ViewportType = 'linear' | 'tree' | 'graph' | 'matrix' | 'linked-list';

/**
 * Metadatos completos de un algoritmo para fichas técnicas y encabezados.
 */
export interface AlgorithmMetadata {
  id: string;
  name: string;
  category: AlgorithmCategory;
  figureId: string;
  viewportType?: ViewportType;
  timeComplexity: {
    best: string;
    worst: string;
    average?: string;
  };
  spaceComplexity: string;
  description: string;
}

/**
 * Elemento resumido para el catálogo y selectores de algoritmos.
 */
// ============================================================================
// 8. Ficha Técnica Funcional (Technical Sheet Contracts)
// ============================================================================

export interface AlgorithmProperties {
  paradigm: string;
  isInPlace: boolean;
  isStable?: boolean;
}

export interface TechnicalComplexity {
  best: string;
  average: string;
  worst: string;
  auxiliarySpace: string;
}

export interface AlgorithmTechnicalSheet {
  objective: string;
  mechanism: string[];
  loopInvariant: string;
  properties: AlgorithmProperties;
  complexity: TechnicalComplexity;
  edgeCases: string[];
  analogy?: string;
  inPlainWords?: string;
  complexityExplanation?: string;
}

// ============================================================================
// 9. Contratos de Generadores Puros y Módulos
// ============================================================================

/**
 * Código fuente estático por lenguaje para el panel de visualización.
 */
export interface AlgorithmSourceCode {
  c: string;
  python: string;
}

/**
 * Función pura y síncrona que calcula la traza completa sin interactuar con el DOM o React.
 */
export type TraceGenerator<TInput = number[]> = (initialInput: TInput) => TraceFrame[];

/**
 * Contrato de módulo completo de un algoritmo para AlgoNotebook.
 */
export interface AlgorithmModule<TInput = number[]> {
  metadata: AlgorithmMetadata;
  generateTrace: TraceGenerator<TInput>;
  code: AlgorithmSourceCode;
  technicalSheet?: AlgorithmTechnicalSheet;
}

/**
 * Definición estándar de un algoritmo para arreglos numéricos en el catálogo.
 */
export type AlgorithmDefinition = AlgorithmModule<number[]>;

// ============================================================================
// 9. Contratos del Motor de Reproducción (Playback Engine)
// ============================================================================

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed';

export type PlaybackSpeed = 0.5 | 1.0 | 2.0 | 4.0;

export interface PlaybackState {
  status: PlaybackStatus;
  currentStepIndex: number;
  totalSteps: number;
  speed: PlaybackSpeed;
  isLooping: boolean;
}
