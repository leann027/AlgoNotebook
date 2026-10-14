---
tipo: artefacto
area: tooling
estado: efimero
tags:
  - proyecto/algonotebook
  - tipo/artefacto
  - area/tooling
  - estado/efimero
---

# Handoff Report — AlgoNotebook (DSA) Architecture & 8-Algorithm Expansion Blueprint

**Agent**: teamwork_preview_explorer (DSA Architecture Explorer)  
**Task**: Exhaustive investigation of AlgoNotebook architecture and implementation blueprint for 8 new algorithms across Introductory, Intermediate, and Advanced tiers (covering R1 of ORIGINAL_REQUEST.md).  
**Working Directory**: `/home/leann027/Documentos/github/AlgoNotebook/.agents/teamwork/explorer_survey_dsa_2`  
**Date**: 2026-10-13  

---

## 1. Observation

### 1.1 Core Contracts and Type Definitions
In `src/core/types.ts`:
- **Supported Languages and Highlighting** (lines 17-25):
  ```typescript
  export type SupportedLang = 'c' | 'python';
  export interface HighlightLines {
    c: number[];
    python: number[];
  }
  ```
- **Semantic States and Actions** (lines 33-49):
  ```typescript
  export type ActiveAction = 'compare' | 'swap' | 'locked' | 'pivot' | 'idle';
  export type ElementState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pointer';
  ```
  Corresponding to tactile highlighters:
  - `compare` / `comparing`: Yellow highlighter (`#FEF08A`, active reading/comparison).
  - `swap` / `swapping`: Coral/peach highlighter (`#FFD7BA`, memory write/mutation).
  - `locked` / `sorted`: Mint sage highlighter (`#BBF7D0`, confirmed sorted boundary).
  - `pivot` / `pointer`: Lavender highlighter (`#E9D5FF`, auxiliary index pointers).
- **Execution Frame Contract (`TraceFrame`)** (lines 313-356):
  ```typescript
  export interface TraceFrame {
    stepIndex: number;
    totalSteps: number;
    highlightLines: { c: number[]; python: number[] };
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
    explanation: { stepLabel: string; text: string; subNote?: string };
    metrics: {
      comparisons: number;
      swaps: number;
      passNumber: number;
      totalPasses?: number;
      maxComparisons?: number;
    };
    event?: TraceEvent;
    snapshot?: TraceSnapshot;
  }
  ```
- **Module and Technical Sheet Contract** (lines 375-452):
  ```typescript
  export type AlgorithmCategory = 'sorting' | 'trees' | 'graphs' | 'dp' | 'pointers';
  export type ViewportType = 'linear' | 'tree' | 'graph' | 'matrix' | 'linked-list';

  export interface AlgorithmMetadata {
    id: string;
    name: string;
    category: AlgorithmCategory;
    figureId: string;
    viewportType?: ViewportType;
    timeComplexity: { best: string; worst: string; average?: string };
    spaceComplexity: string;
    description: string;
  }

  export interface AlgorithmTechnicalSheet {
    objective: string;
    mechanism: string[];
    loopInvariant: string;
    properties: { paradigm: string; isInPlace: boolean; isStable?: boolean };
    complexity: { best: string; average: string; worst: string; auxiliarySpace: string };
    edgeCases: string[];
    analogy?: string;
    inPlainWords?: string;
    complexityExplanation?: string;
  }

  export interface AlgorithmModule<TInput = number[]> {
    metadata: AlgorithmMetadata;
    generateTrace: (initialInput: TInput) => TraceFrame[];
    code: { c: string; python: string };
    technicalSheet?: AlgorithmTechnicalSheet;
  }
  export type AlgorithmDefinition = AlgorithmModule<number[]>;
  ```

### 1.2 Technical Sheet Modal Architecture and Master Theorem
In `src/components/modals/AlgorithmTechnicalSheetModal.tsx`:
- Modal renders exclusively as a centered floating dialog (lines 293-303):
  ```tsx
  <div
    role="dialog"
    aria-modal="true"
    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink-primary/50 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    onClick={onClose}
  >
    <div
      className="bg-paper-surface border-2 border-paper-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col text-ink-primary overflow-hidden relative"
      onClick={(e) => e.stopPropagation()}
    >
  ```
- Supports 5 dedicated tabs:
  1. `'intuition'`: Real-world analogy (`#FFFBEA` sticky post-it), formal objective, plain-words explanation.
  2. `'mechanism'`: Step-by-step numbered breakdown with bullet points.
  3. `'invariant'`: Formal loop invariant and mathematical induction justification.
  4. `'complexity'`: 4-column metric grid (Best, Average, Worst, Auxiliary Space) + intuitive explanation + **KaTeX Recurrence Relation & Master Theorem Box**.
  5. `'edgeCases'`: Boundary conditions checklist.
- Master Theorem theoretical box (lines 669-740):
  - Canonical equation: $T(n) = aT(n/b) + \Theta(n^d)$.
  - Case 1: $d < \log_b a \implies T(n) = \Theta(n^{\log_b a})$ (Hojas dominan).
  - Case 2: $d = \log_b a \implies T(n) = \Theta(n^d \log n)$ (Trabajo equilibrado por nivel).
  - Case 3: $d > \log_b a \implies T(n) = \Theta(n^d)$ (Raíz domina).
  - Highlighting of active case via `activeRecInfo.masterTheoremDetails?.caseNumber`.
- `ALGORITHM_RECURRENCES` dictionary (lines 42-225): Maps algorithm IDs to recurrence info (`recurrence`, `method`, `closedForm`, `explanation`, `isMasterTheoremApplicable`, `masterTheoremDetails`).

### 1.3 Viewport Rendering Engines
In `src/renderers/`:
1. `StudyCanvas.tsx` (Default Linear Bar Viewport):
   - Vertical proportional bars with max-width bounding (`maxWidth: min(760, max(300, array.length * 75))px`).
   - Sticky Post-It note card at top-left (`bg-[#FFFBEA]` with `#FDE047` border, `-rotate-1`).
   - Indicator bracket for active comparisons (`ArrowLeftRight`), mutaciones (`swap`), and locked items.
   - Index below baseline with pointer labels (`i=0`, `j=1`, `low=0`, `high=7`, `mid=3`).
2. `TreeHierarchyViewport.tsx`:
   - Interactive SVG canvas (`viewBox="0 0 800 460"`).
   - Centering dynamically adjusted (`shiftX = 400 - (minX + maxX)/2`).
   - Node radii adapt based on tree depth: depth $\le 2 \implies r=22$, depth $=3 \implies r=19$, depth $\ge 4 \implies r=16$.
   - Renders left (`L`) and right (`R`) branch badges at midpoints of edges.
   - Active ring pulsating for `activeNodeId`, green outer ring for `insertedNodeId`.
3. `GraphViewport.tsx`:
   - Interactive SVG canvas (`viewBox="0 0 800 460"`).
   - Weighted edges with plaque badges at midpoints.
   - Floating collapsible distance table (`dijkstraTable`) at top-right for shortest-path inspection.
   - Queue ribbon representation for BFS / topological frontiers.
4. `MatrixGridViewport.tsx`:
   - 2D DP grid with sticky headers for rows (`rowHeaders`) and columns (`colHeaders`).
   - Highlighting for `activeCell`, `dependentCells` (lavender dashed border with reference arrows), and `optimalPathCells` (mint sage with checkmark).
   - Recurrence banner displaying `currentFormula` in real time.
5. `LinkedListViewport.tsx`:
   - Horizontal SVG/DOM chain with memory addresses (`0x7ffe...`), pointer badges (`head`, `curr`, `prev`, `next`), and cycle arrow detection.

### 1.4 Registration and Navigation Pipeline
1. `src/algorithms/index.ts`:
   - `ALGORITHM_REGISTRY: Record<string, AlgorithmDefinition>` (currently 22 algorithms).
   - `AVAILABLE_ALGORITHMS: AlgorithmDefinition[]`.
   - `getAlgorithmById(id: string): AlgorithmDefinition`.
2. `src/App.tsx`:
   - `CATALOG_GROUPS`: Grouped catalog array for `UnifiedNotebookHeader`.
   - `getDefaultInput(category, id)`: Initial array seeding.
   - `handleSelectAlgorithm`: Dispatches algorithm selection and resets playback.
3. `src/components/layout/SideNavBar.tsx`:
   - `ALGORITHM_LEVELS`: Record mapping algorithm IDs to `'introductory' | 'intermediate' | 'advanced'`.
   - `LEVEL_DOT_CLASSES`:
     - `introductory`: `bg-emerald-500` (green dot).
     - `intermediate`: `bg-amber-500` (yellow/amber dot).
     - `advanced`: `bg-indigo-500` (indigo/purple dot).
   - `SIDEBAR_CATEGORIES`: Nav category groups with icons (`BarChart2`, `Search`, `Network`, `GitBranch`, `Grid`, `Sliders`) and lists of `{ id, name }`.
   - Big-O badges rendered dynamically: `algoDef?.metadata.timeComplexity.worst`.
4. `src/components/views/CurriculumView.tsx`:
   - `CURRICULUM_UNITS`: 6 units with title, description, and list of algorithm IDs.
   - `ALGORITHM_LEVELS`: Level badges for curriculum items.
   - Rendered using `UnifiedCurriculumView` with `storageKey="algonotebook"`.
   - `localStorage` key: `"algonotebook_completed"` persists user progress as a JSON string array of IDs.
5. `src/components/layout/UnifiedNotebookHeader.tsx`:
   - Bookmark storage key: `"algonotebook_bookmarks"` persists favorited algorithms.

### 1.5 Baseline Integrity Verification
Execution of project build commands:
- `npm run lint` (`oxlint`): **0 warnings and 0 errors** on 221 files.
- `npm run build` (`tsc -b && vite build`): **Clean compilation with 0 errors** in 1.11s; Service Worker generated cleanly (`dist/sw.js`).

---

## 2. Logic Chain

1. **R1 Fulfillment Requirement**: R1 mandates the incorporation of at least 8 new algorithms covering the computer science curriculum:
   - *Introductory:* (1) Búsqueda Lineal vs Binaria con comparador interactivo, (2) Cola de Prioridad / Min-Max Heap.
   - *Intermediate:* (3) Algoritmo de Kadane, (4) Ordenamiento Topológico, (5) Árboles AVL con rotaciones balanceadas automáticas.
   - *Advanced:* (6) Algoritmo de Bellman-Ford, (7) Distancia de Levenshtein, (8) Componentes Fuertemente Conexas.
2. **Structural Parity**: Each of the 8 algorithms requires:
   - `index.ts`: Module export with metadata, dual code imports (`?raw`), technical sheet.
   - `trace.ts`: Pure synchronous trace generator producing `TraceFrame[]`.
   - `code.c` & `code.py`: C99 and Python 3 source codes with 1-based line highlight synchronizations.
   - Floating centered modal technical sheet with KaTeX, recurrence relation, and Master Theorem application where applicable.
3. **Viewport Alignment**:
   - `linear-binary-search`: `viewportType: 'linear'` (dual comparison pointers and step ratio).
   - `priority-queue`: `viewportType: 'tree'` (heap tree structure via `TreeHierarchyViewport`).
   - `kadane`: `viewportType: 'linear'` (1D array contiguous window with sum metrics).
   - `topological-sort`: `viewportType: 'graph'` (directed DAG with in-degree queue via `GraphViewport`).
   - `avl-tree`: `viewportType: 'tree'` (balanced tree with balance factor indicators via `TreeHierarchyViewport`).
   - `bellman-ford`: `viewportType: 'graph'` (weighted directed graph with distance relaxation table via `GraphViewport`).
   - `levenshtein-distance`: `viewportType: 'matrix'` (2D DP grid with string headers and backtrace path via `MatrixGridViewport`).
   - `strongly-connected-components`: `viewportType: 'graph'` (directed graph with Tarjan DFS lowlink stack and component color-coding via `GraphViewport`).
4. **Registration Coherence**:
   - Every algorithm must be registered in 5 locations: `ALGORITHM_REGISTRY` in `algorithms/index.ts`, `CATALOG_GROUPS` in `App.tsx`, `SIDEBAR_CATEGORIES` and `ALGORITHM_LEVELS` in `SideNavBar.tsx`, `CURRICULUM_UNITS` in `CurriculumView.tsx`, and `ALGORITHM_RECURRENCES` in `AlgorithmTechnicalSheetModal.tsx`.
   - Curriculum DAG links (`crossConnections`) must be defined to provide contextual navigation across the learning graph.

---

## 3. Caveats

1. **Pure Trace Generation Principle**: Trace generators must remain 100% pure TypeScript functions without any React hooks or DOM manipulations, returning deterministic `TraceFrame[]` arrays for any valid input.
2. **Negative Weight Clamping in Graph Viewport**: For Bellman-Ford, edge weights can be negative (e.g. `-2`, `-5`). The plaque badge in `GraphViewport` renders `edge.weight` directly; badge width must accommodate negative signs without text clipping (`width={edge.weight < 0 ? 32 : 28}`).
3. **Negative Array Values in Kadane**: Kadane arrays contain negative numbers. In `StudyCanvas`, bar height is computed as `Math.max(16, Math.round((val / maxVal) * 100))`. The top value label displays the exact signed integer, and background grid lines provide a zero-reference baseline.
4. **DAG Graph View Parity**: While MathNotebook uses `KnowledgeGraphViewport` for its DAG view, AlgoNotebook's `CurriculumView.tsx` currently delegates solely to `UnifiedCurriculumView` in units mode. Passing a compiled DSA dependency graph as `graphComponent` elevates AlgoNotebook to full architectural parity with MathNotebook.

---

## 4. Conclusion & Exhaustive Blueprint for the 8 DSA Algorithms

Below is the definitive implementation blueprint for each of the 8 required algorithms.

### 4.1 Introductory Tier

#### Algorithm 1: Búsqueda Lineal vs Binaria (Comparador Interactivo)
- **ID**: `linear-binary-search` (alias: `search-comparator`)
- **Directory**: `src/algorithms/search/linear-binary-search/`
- **Category**: `pointers` (or `search`) | **Viewport**: `linear`
- **Files**:
  - `index.ts`: Defines `LINEAR_BINARY_SEARCH_METADATA`, technical sheet, and module.
  - `trace.ts`: Computes both linear search (step-by-step sequential probe $i = 0, 1, 2, \dots$) and binary search ($low, high, mid$) in lock-step against target key $42$.
  - `code.c`: C99 file with `linear_search` and `binary_search` functions.
  - `code.py`: Python 3 file with sequential and logarithmic probes.
- **Complexity**:
  - Best: $\mathcal{O}(1)$ (target at index 0 for linear, index $N/2$ for binary).
  - Average: Lineal $\mathcal{O}(N)$ vs Binaria $\mathcal{O}(\log N)$.
  - Worst: Lineal $\mathcal{O}(N)$ vs Binaria $\mathcal{O}(\log N)$.
  - Auxiliary Space: $\mathcal{O}(1)$.
- **KaTeX Technical Sheet & Master Theorem**:
  - Recurrence Lineal: $T_{\text{lin}}(n) = T_{\text{lin}}(n-1) + \Theta(1) \implies \Theta(n)$.
  - Recurrence Binaria: $T_{\text{bin}}(n) = T_{\text{bin}}(n/2) + \Theta(1)$.
  - **Aplica Teorema Maestro (Caso 2)**:
    - Parámetros: $a = 1, b = 2, d = 0$.
    - Condición: $d = \log_b a \iff 0 = \log_2 1 = 0$.
    - Forma Cerrada: $T(n) = \Theta(n^d \log n) = \Theta(\log n)$.
  - Invariante de Bucle: "En el paso $k$, la búsqueda lineal garantiza que target $\notin arr[0 .. k-1]$, mientras que la búsqueda binaria garantiza que target $\in arr[low .. high]$ si existe en el arreglo."
- **Dual Code Highlights Mapping**:
  - Setup: C lines 4-6, Py lines 2-3
  - Linear probe: C line 8, Py line 5
  - Binary probe ($mid$ calculation): C line 16, Py line 12
  - Target evaluation: C lines 18-22, Py lines 14-18
- **Curriculum Registration**:
  - Unit: UNIDAD 2 ("Búsqueda y Reducción Logarítmica")
  - Level: `introductory` | Dot: `bg-emerald-500` | Badge: `O(N) vs O(log N)`
  - Cross-connections: `binary-search` (reducción logarítmica), `analysis.limits-continuity` (orden de crecimiento asintótico).

---

#### Algorithm 2: Cola de Prioridad / Min-Max Heap
- **ID**: `priority-queue` (alias: `min-max-heap`)
- **Directory**: `src/algorithms/trees/priority-queue/`
- **Category**: `trees` | **Viewport**: `tree`
- **Files**:
  - `index.ts`: Metadata `PRIORITY_QUEUE_METADATA`, technical sheet, module.
  - `trace.ts`: Operaciones completas de montículo: `push` con burbujeo ascendente (heapify-up) y `pop` (extract-min) con burbujeo descendente (heapify-down).
  - `code.c`: C99 struct `PriorityQueue` con `pq_push`, `pq_pop`, `pq_peek`.
  - `code.py`: Python 3 class `PriorityQueue` con métodos de sifting.
- **Complexity**:
  - Best: $\mathcal{O}(1)$ (`peek` o inserción que no viola el orden).
  - Average: $\mathcal{O}(\log N)$ (`push` y `pop`).
  - Worst: $\mathcal{O}(\log N)$ (ascenso/descenso por toda la altura $\lfloor \log_2 N \rfloor$).
  - Auxiliary Space: $\mathcal{O}(1)$ auxiliar sobre arreglo contiguo $\mathcal{O}(N)$.
- **KaTeX Technical Sheet & Master Theorem**:
  - Recurrence Heapify: $T(n) \le T(2n/3) + \Theta(1)$.
  - **Aplica Teorema Maestro (Caso 2)**:
    - Parámetros: $a = 1, b = 3/2, d = 0$.
    - Condición: $d = \log_{3/2} 1 = 0$.
    - Forma Cerrada: $T(n) = \Theta(\log n)$.
  - Build-Heap Recurrence: $T(n) = \sum_{h=0}^{\lfloor \log n \rfloor} \lceil \frac{n}{2^{h+1}} \rceil \mathcal{O}(h) = \Theta(n)$ (serie aritmético-geométrica convergente $\sum h/2^h = 2$).
  - Invariante Estructural: "Para todo nodo en el índice $i > 0$, $\text{data}[\lfloor (i-1)/2 \rfloor] \le \text{data}[i]$. La raíz en el índice 0 contiene permanentemente la clave de menor valor (mínimo global)."
- **Dual Code Highlights Mapping**:
  - Push / Insert: C lines 12-16, Py lines 10-13
  - Heapify-up loop: C lines 18-23, Py lines 15-19
  - Extract-min: C lines 26-31, Py lines 22-26
  - Heapify-down loop: C lines 33-44, Py lines 28-37
- **Curriculum Registration**:
  - Unit: UNIDAD 3 ("Estructuras Jerárquicas, Árboles y Montículos")
  - Level: `introductory` | Dot: `bg-emerald-500` | Badge: `O(log N)`
  - Cross-connections: `min-heap` (equivalencia estructural), `dijkstra-graph` (cola de distancias mínimas), `kruskal-graph` (cola de aristas).

---

### 4.2 Intermediate Tier

#### Algorithm 3: Algoritmo de Kadane (Subsuma Máxima Contigua)
- **ID**: `kadane` (alias: `kadane-dp`)
- **Directory**: `src/algorithms/dp/kadane/`
- **Category**: `dp` | **Viewport**: `linear`
- **Files**:
  - `index.ts`: Metadata `KADANE_METADATA`, technical sheet, module.
  - `trace.ts`: Traza sobre arreglo con valores mixtos (e.g. `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`), resaltando la ventana activa $[windowStart .. i]$ y la ventana global óptima $[bestStart .. bestEnd]$ que suma 6.
  - `code.c`: C99 función `int kadane(const int arr[], int n, int *out_start, int *out_end)`.
  - `code.py`: Python 3 función `kadane(arr) -> (max_sum, start, end)`.
- **Complexity**:
  - Best: $\mathcal{O}(N)$ (una única pasada lineal incondicional).
  - Average: $\mathcal{O}(N)$.
  - Worst: $\mathcal{O}(N)$.
  - Auxiliary Space: $\mathcal{O}(1)$ in-place (solo variables escalares `current_sum`, `max_sum`).
- **KaTeX Technical Sheet & Master Theorem**:
  - Ecuación de Optimalidad de Bellman (1D DP):
    $$M(i) = \max\bigl(A[i], \, M(i-1) + A[i]\bigr) \quad \text{con } M(0) = A[0]$$
    $$S_{\max} = \max_{0 \le i < n} M(i)$$
  - Recurrencia Temporal: $T(n) = T(n-1) + \Theta(1) \implies \Theta(n)$.
  - Master Theorem: No aplicable (reducción sustractiva unitaria $n-1$, no división $n/b$).
  - Invariante de Bucle: "Al finalizar la iteración $i$, `current_sum` contiene el valor exacto de la máxima subsuma de cualquier subarreglo contiguo que termine en el índice $i$, y `max_sum` contiene la máxima subsuma de cualquier subarreglo contenido en $A[0 .. i]$."
- **Dual Code Highlights Mapping**:
  - Init: C lines 4-7, Py lines 2-4
  - Update `current_sum`: C lines 11-13, Py lines 7-8
  - Window restart check: C lines 14-16, Py lines 9-11
  - Update `max_sum`: C lines 18-22, Py lines 13-16
- **Curriculum Registration**:
  - Unit: UNIDAD 5 ("Memorización y Programación Dinámica")
  - Level: `intermediate` | Dot: `bg-amber-500` | Badge: `O(N)`
  - Cross-connections: `knapsack-dp` (programación dinámica escalar), `linear-binary-search` (travesía secuencial).

---

#### Algorithm 4: Ordenamiento Topológico (Kahn / DFS en DAGs)
- **ID**: `topological-sort`
- **Directory**: `src/algorithms/graphs/topological-sort/`
- **Category**: `graphs` | **Viewport**: `graph`
- **Files**:
  - `index.ts`: Metadata `TOPOLOGICAL_SORT_METADATA`, technical sheet, module.
  - `trace.ts`: Grafo acíclico canónico de 6 vértices (A..F), mostrando el cálculo de in-degrees (`in_deg`), la cola de fuentes (`queue`), la eliminación progresiva de aristas y la secuencia ordenada resultante en `arrayState`.
  - `code.c`: C99 función `bool topological_sort_kahn(Graph *g, int result[])`.
  - `code.py`: Python 3 función `topological_sort_kahn(adj_list)`.
- **Complexity**:
  - Best / Average / Worst: $\mathcal{O}(V + E)$ (inspecciona cada vértice una vez y descuenta cada arista saliente una vez).
  - Auxiliary Space: $\mathcal{O}(V)$ (arreglo de grados de entrada y cola de exploración).
- **KaTeX Technical Sheet & Master Theorem**:
  - Recurrencia / Sumatoria Estructural:
    $$T(V, E) = \mathcal{O}(V) + \sum_{u \in V} \bigl(1 + \operatorname{deg}^+(u)\bigr) = \Theta(V + E)$$
  - Master Theorem: No aplicable (travesía y descarte de grados en grafos).
  - Invariante de Bucle: "En todo momento, si una arista dirigida $(u, v)$ existe en el grafo original y $u$ aún no ha sido emitido, entonces $\operatorname{in-degree}(v) \ge 1$ y $v$ no puede ingresar a la cola. Todo nodo emitido antecede estrictamente a todos sus dependientes."
  - Condición de Ciclo: Si la cantidad de nodos emitidos es menor a $|V|$, el grafo contiene al menos un ciclo dirigido y no admite ordenamiento topológico.
- **Dual Code Highlights Mapping**:
  - Compute in-degrees: C lines 8-13, Py lines 5-8
  - Enqueue sources ($in=0$): C lines 15-19, Py lines 10-12
  - Dequeue & emit: C lines 22-25, Py lines 14-16
  - Decrement neighbors: C lines 27-33, Py lines 17-21
  - Cycle verification: C lines 35-38, Py lines 23-25
- **Curriculum Registration**:
  - Unit: UNIDAD 4 ("Grafos: Exploración, Rutas y Optimización")
  - Level: `intermediate` | Dot: `bg-amber-500` | Badge: `O(V + E)`
  - Cross-connections: `bfs-graph` (cola FIFO de exploración), `dfs-graph` (alternativa por post-orden inverso), `strongly-connected-components` (condensación en DAG).

---

#### Algorithm 5: Árboles AVL con Rotaciones Balanceadas Automáticas
- **ID**: `avl-tree`
- **Directory**: `src/algorithms/trees/avl-tree/`
- **Category**: `trees` | **Viewport**: `tree`
- **Files**:
  - `index.ts`: Metadata `AVL_TREE_METADATA`, technical sheet, module.
  - `trace.ts`: Inserción de claves que provocan los 4 casos de desbalance canónicos (LL, RR, LR, RL), mostrando factores de balance $BF = h_L - h_R$ y reestructuración de punteros en `treeState`.
  - `code.c`: C99 con `rotate_left`, `rotate_right`, y `avl_insert`.
  - `code.py`: Python 3 con clase `AVLTree` y rotaciones simples/dobles.
- **Complexity**:
  - Best: $\mathcal{O}(1)$ (inserción directa en raíz).
  - Average: $\mathcal{O}(\log N)$.
  - Worst: $\mathcal{O}(\log N)$ (estrictamente acotada: $h \le 1.4404 \log_2(N+2)$).
  - Auxiliary Space: $\mathcal{O}(\log N)$ (pila de recursión).
- **KaTeX Technical Sheet & Master Theorem**:
  - Invariante de Altura AVL (Árboles de Fibonacci Mínimos):
    $$N(h) = N(h-1) + N(h-2) + 1 \implies h < 1.4404 \log_2(n+2) - 0.328$$
  - Factor de Balance: $\text{BF}(v) = \text{height}(\text{left}(v)) - \text{height}(\text{right}(v)) \in \{-1, 0, +1\}$.
  - Recurrencia de Inserción: $T(h) = T(h-1) + \Theta(1)$ con $h \in \mathcal{O}(\log n) \implies T(n) = \Theta(\log n)$.
  - Rotaciones: $\mathcal{O}(1)$ reasignaciones locales de punteros (LL/RR 1 rotación, LR/RL 2 rotaciones).
  - Master Theorem: No aplicable directamente (el invariante de balance previene la degeneración lineal del BST).
- **Dual Code Highlights Mapping**:
  - Standard BST insert: C lines 10-18, Py lines 8-15
  - Update height & balance: C lines 20-24, Py lines 17-20
  - Left-Left case (Rotate Right): C lines 27-30, Py lines 22-24
  - Right-Right case (Rotate Left): C lines 32-35, Py lines 26-28
  - Left-Right / Right-Left cases: C lines 37-44, Py lines 30-36
- **Curriculum Registration**:
  - Unit: UNIDAD 3 ("Estructuras Jerárquicas, Árboles y Montículos")
  - Level: `intermediate` | Dot: `bg-amber-500` | Badge: `O(log N)`
  - Cross-connections: `bst-insertion` (BST sin balance), `inorder-traversal` (orden simétrico invariable).

---

### 4.3 Advanced Tier

#### Algorithm 6: Algoritmo de Bellman-Ford (Detección de Ciclos Negativos)
- **ID**: `bellman-ford`
- **Directory**: `src/algorithms/graphs/bellman-ford/`
- **Category**: `graphs` | **Viewport**: `graph`
- **Files**:
  - `index.ts`: Metadata `BELLMAN_FORD_METADATA`, technical sheet, module.
  - `trace.ts`: Grafo dirigido de 5 vértices con aristas negativas, relajando $|V|-1 = 4$ pasadas sobre todas las aristas y ejecutando la pasada 5 para detección de ciclo negativo con alerta post-it.
  - `code.c`: C99 función `bool bellman_ford(int V, int E, Edge edges[], int src, int dist[])`.
  - `code.py`: Python 3 función `bellman_ford(vertices, edges, source)`.
- **Complexity**:
  - Best: $\mathcal{O}(E)$ (con optimización de parada temprana si no hay relajaciones en la pasada 1).
  - Average: $\mathcal{O}(V \cdot E)$.
  - Worst: $\mathcal{O}(V \cdot E)$.
  - Auxiliary Space: $\mathcal{O}(V)$ (tabla de distancias y predecesores).
- **KaTeX Technical Sheet & Master Theorem**:
  - Ecuación de Bellman (Programación Dinámica en Grafos):
    $$D^{(k)}[v] = \min\left( D^{(k-1)}[v], \, \min_{(u, v) \in E} \left( D^{(k-1)}[u] + w(u, v) \right) \right) \quad \text{para } k = 1, \dots, |V|-1$$
  - Condición de Detección de Ciclo Negativo:
    $$\exists (u, v) \in E : D^{(|V|-1)}[u] + w(u, v) < D^{(|V|-1)}[v] \iff \text{Existe ciclo negativo alcanzable}.$$
  - Master Theorem: No aplicable (programación dinámica sobre grafos).
  - Invariante de Bucle: "Tras completar la pasada $k$ ($1 \le k \le |V|-1$), para todo vértice $v$, $dist[v]$ es menor o igual al peso del camino más corto desde $src$ hasta $v$ que utilice a lo sumo $k$ aristas."
- **Dual Code Highlights Mapping**:
  - Init distances: C lines 6-10, Py lines 4-7
  - Outer rounds loop ($V-1$): C line 12, Py line 9
  - Edge relaxation check: C lines 15-20, Py lines 11-15
  - Negative cycle probe ($V$-th round): C lines 23-29, Py lines 18-23
- **Curriculum Registration**:
  - Unit: UNIDAD 4 ("Grafos: Exploración, Rutas y Optimización")
  - Level: `advanced` | Dot: `bg-indigo-500` | Badge: `O(V · E)`
  - Cross-connections: `dijkstra-graph` (caminos mínimos sin aristas negativas), `knapsack-dp` (principio de optimalidad de Bellman).

---

#### Algorithm 7: Distancia de Levenshtein (Programación Dinámica Matricial)
- **ID**: `levenshtein-distance` (alias: `levenshtein-dp`)
- **Directory**: `src/algorithms/dp/levenshtein/`
- **Category**: `dp` | **Viewport**: `matrix`
- **Files**:
  - `index.ts`: Metadata `LEVENSHTEIN_METADATA`, technical sheet, module.
  - `trace.ts`: Relleno de matriz $(M+1) \times (N+1)$ comparando dos cadenas ("ALGO" vs "MATH" o "KITTEN" vs "SITTING"), con resaltado de dependencias (inserción, eliminación, sustitución) y ruta óptima de alineamiento en `MatrixGridViewport`.
  - `code.c`: C99 función `int levenshtein(const char *s1, const char *s2)`.
  - `code.py`: Python 3 función `levenshtein(s1, s2)`.
- **Complexity**:
  - Best / Average / Worst: $\mathcal{O}(M \cdot N)$ (cada celda se evalúa en $\Theta(1)$ a partir de sus 3 celdas adyacentes).
  - Auxiliary Space: $\mathcal{O}(M \cdot N)$ (matriz completa requerida para reconstrucción de operaciones) u $\mathcal{O}(\min(M, N))$ para valor escalar.
- **KaTeX Technical Sheet & Master Theorem**:
  - Ecuación de Recurrencia Matricial:
    $$D(i, j) = \begin{cases}
    j & \text{si } i = 0 \\
    i & \text{si } j = 0 \\
    D(i-1, j-1) & \text{si } S[i-1] = T[j-1] \\
    1 + \min\begin{cases} D(i-1, j) & (\text{eliminación}) \\ D(i, j-1) & (\text{inserción}) \\ D(i-1, j-1) & (\text{sustitución}) \end{cases} & \text{si } S[i-1] \ne T[j-1]
    \end{cases}$$
  - Master Theorem: No aplicable (programación dinámica tabular bidimensional).
  - Invariante Matricial: "La celda $D[i, j]$ almacena el costo mínimo exacto de transformar el prefijo $S[0 .. i-1]$ en el prefijo $T[0 .. j-1]$ mediante inserciones, eliminaciones y sustituciones unitarias."
- **Dual Code Highlights Mapping**:
  - Matrix allocation & base cases: C lines 8-14, Py lines 5-9
  - Outer row loop: C line 16, Py line 11
  - Cost check ($S[i-1] == T[j-1]$): C lines 19-21, Py lines 14-16
  - Min calculation ($+1$): C lines 23-28, Py lines 17-21
  - Result retrieval $D[M][N]$: C line 32, Py line 24
- **Curriculum Registration**:
  - Unit: UNIDAD 5 ("Memorización y Programación Dinámica")
  - Level: `advanced` | Dot: `bg-indigo-500` | Badge: `O(M · N)`
  - Cross-connections: `lcs-dp` (subsecuencia común más larga dual), `knapsack-dp` (matriz 2D de programación dinámica).

---

#### Algorithm 8: Componentes Fuertemente Conexas (Tarjan / Kosaraju)
- **ID**: `strongly-connected-components` (alias: `tarjan-scc`)
- **Directory**: `src/algorithms/graphs/strongly-connected-components/`
- **Category**: `graphs` | **Viewport**: `graph`
- **Files**:
  - `index.ts`: Metadata `SCC_METADATA`, technical sheet, module.
  - `trace.ts`: Algoritmo de Tarjan sobre grafo dirigido de 7 nodos, calculando `discovery` y `lowlink`, manteniendo la pila de nodos activos, y extrayendo las componentes maximales coloreadas en `GraphViewport`.
  - `code.c`: C99 función `void tarjan_scc(Graph *g)`.
  - `code.py`: Python 3 función `tarjan_scc(graph)`.
- **Complexity**:
  - Best / Average / Worst: $\mathcal{O}(V + E)$ (un único recorrido DFS completo donde cada vértice y arista se visita una sola vez).
  - Auxiliary Space: $\mathcal{O}(V)$ (pila de DFS, marcas de tiempo `disc`, `low`, booleano `on_stack`).
- **KaTeX Technical Sheet & Master Theorem**:
  - Definición de Low-Link de Tarjan:
    $$\text{lowlink}(u) = \min\begin{cases}
    \text{disc}(u) \\
    \min_{(u, v) \in E, v \text{ no visitado}} \text{lowlink}(v) \\
    \min_{(u, v) \in E, v \in \text{pila}} \text{disc}(v)
    \end{cases}$$
  - Condición de Raíz de SCC: Si $\text{lowlink}(u) = \text{disc}(u)$, el subárbol DFS enraizado en $u$ contiene una componente fuertemente conexa maximal; al desapilar nodos hasta $u$, se obtiene el conjunto exacto de vértices de la componente.
  - Master Theorem: No aplicable (búsqueda en profundidad DFS sobre grafos).
- **Dual Code Highlights Mapping**:
  - DFS entry & timestamp: C lines 8-13, Py lines 6-9
  - Push to SCC stack: C lines 14-16, Py lines 10-12
  - Edge inspection loop: C lines 18-26, Py lines 14-20
  - Root check ($\text{low} == \text{disc}$): C line 28, Py line 22
  - Pop component members: C lines 30-36, Py lines 24-29
- **Curriculum Registration**:
  - Unit: UNIDAD 4 ("Grafos: Exploración, Rutas y Optimización")
  - Level: `advanced` | Dot: `bg-indigo-500` | Badge: `O(V + E)`
  - Cross-connections: `dfs-graph` (árbol de recubrimiento en profundidad), `topological-sort` (grafo condensado de SCCs es acíclico).

---

### 4.4 Summary Table: 8-Algorithm Expansion Matrix

| # | Algorithm Name | ID | Tier | Category | Viewport | Time Complexity | Master Theorem? | Unit |
|---|---|---|---|---|---|---|---|---|
| 1 | Búsqueda Lineal vs Binaria | `linear-binary-search` | Introductory | `pointers` | `linear` | $\mathcal{O}(N)$ vs $\mathcal{O}(\log N)$ | Sí (Caso 2: $a=1, b=2, d=0$) | Unidad 2 |
| 2 | Cola de Prioridad (Min-Heap) | `priority-queue` | Introductory | `trees` | `tree` | $\mathcal{O}(\log N)$ | Sí (Caso 2: $a=1, b=3/2, d=0$) | Unidad 3 |
| 3 | Algoritmo de Kadane | `kadane` | Intermediate | `dp` | `linear` | $\mathcal{O}(N)$ | No (DP 1D sustractivo) | Unidad 5 |
| 4 | Ordenamiento Topológico (Kahn) | `topological-sort` | Intermediate | `graphs` | `graph` | $\mathcal{O}(V + E)$ | No (Amortización de grados) | Unidad 4 |
| 5 | Árboles AVL (Rotaciones) | `avl-tree` | Intermediate | `trees` | `tree` | $\mathcal{O}(\log N)$ | No (Invariante Fibonacci) | Unidad 3 |
| 6 | Algoritmo de Bellman-Ford | `bellman-ford` | Advanced | `graphs` | `graph` | $\mathcal{O}(V \cdot E)$ | No (DP sobre aristas) | Unidad 4 |
| 7 | Distancia de Levenshtein | `levenshtein-distance` | Advanced | `dp` | `matrix` | $\mathcal{O}(M \cdot N)$ | No (DP matricial 2D) | Unidad 5 |
| 8 | Componentes Fuertemente Conexas | `strongly-connected-components` | Advanced | `graphs` | `graph` | $\mathcal{O}(V + E)$ | No (Travesía DFS Tarjan) | Unidad 4 |

---

## 5. Verification Method

To verify this survey report and subsequent implementation:

1. **Static Analysis & Linting**:
   ```bash
   npm run lint
   ```
   *Expected output*: 0 warnings and 0 errors reported by `oxlint`.
2. **Type Checking & Production Build**:
   ```bash
   npm run build
   ```
   *Expected output*: `tsc -b` completes with zero type errors, zero `any` types, and `vite build` bundles successfully in `< 2s` generating `dist/sw.js`.
3. **Registration File Inspection**:
   - Inspect `src/algorithms/index.ts` to ensure all 8 algorithms are in `ALGORITHM_REGISTRY` and `AVAILABLE_ALGORITHMS`.
   - Inspect `src/App.tsx` to verify `CATALOG_GROUPS` contains all 8 algorithms under their respective categories.
   - Inspect `src/components/layout/SideNavBar.tsx` to verify `ALGORITHM_LEVELS` and `SIDEBAR_CATEGORIES` include all 8 items with correct level dots (`bg-emerald-500`, `bg-amber-500`, `bg-indigo-500`) and Big-O badges.
   - Inspect `src/components/views/CurriculumView.tsx` to verify `CURRICULUM_UNITS` includes all 8 items and `localStorage` tracking functions seamlessly.
   - Inspect `src/components/modals/AlgorithmTechnicalSheetModal.tsx` to verify `ALGORITHM_RECURRENCES` contains formal KaTeX formulas, recurrence relations, and Master Theorem breakdowns for all 8 algorithms.
4. **Invalidation Conditions**:
   - Any runtime exception or NaN coordinate on SVG rendering.
   - Clipping or horizontal scrollbars without `overflow-x-auto py-1.5` wrapper in KaTeX containers.
   - Technical sheets opening as collapsible sidebar accordions instead of centered floating modal dialogs.
   - Non-deterministic or side-effectful trace generators.

