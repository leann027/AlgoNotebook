---
tipo: artefacto
area: tooling
estado: activo
tags:
  - proyecto/algonotebook
  - tipo/artefacto
  - area/tooling
  - estado/activo
---

# Project: AlgoNotebook & MathNotebook Encyclopedic Content Expansion

## Architecture
AlgoNotebook and MathNotebook share an educational visualization platform built with React, TypeScript, Tailwind CSS, KaTeX, and Vite.
Each notebook features:
1. **Interactive Notebook View**:
   - Header with category/cluster dropdown (`UnifiedNotebookHeader`).
   - Sidebar navigation with difficulty dots and Big-O / category tags.
   - Interactive 2D visualizer canvas (SVG/Canvas) with smooth transitions, responsive coordinates, and anti-clipping safeguards.
   - Playback scrubber and timeline control (`usePlayback`).
   - Dual C99 (`code.c`) and Python 3 (`code.py`) syntax-highlighted code panels with step line-highlighting.
   - Centered floating modal technical sheet (`TechnicalSheetModal` / `MathTechnicalSheetModal`) with KaTeX formulas wrapped in `overflow-x-auto py-1.5`.
2. **Curriculum & DAG System**:
   - Curriculum unit view and dynamic dependency DAG graph (`curriculum.ts`, `CurriculumView`, `KnowledgeGraphViewport`).
   - `crossConnections` linking algorithms and mathematical foundations.
   - `localStorage` bookmarking and completion tracking.
3. **Design System**:
   - Paper / cream palette: base `#FDFBF7`, paper borders `#E5E0D8`, ink typography, and pastel highlighter accents (`#FEF08A`, `#FFD7BA`, `#BBF7D0`, `#E9D5FF`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Linear vs Binary Search | Interactive comparison of O(N) vs O(log N) search traces with Master Theorem Case 2 | M2 (DSA) | ORIGINAL_REQUEST §R1 |
| F02 | Priority Queue / Min-Max Heap | Binary heap tree/array visualizer with sift-up/down and Master Theorem Case 2 | M2 (DSA) | ORIGINAL_REQUEST §R1 |
| F03 | Kadane's Algorithm | Maximum subarray sum in O(N) with current vs global max window tracker | M2 (DSA) | ORIGINAL_REQUEST §R1 |
| F04 | Topological Sort | Kahn's in-degree queue & DFS finish-time on DAGs with cycle detection | M2 (DSA) | ORIGINAL_REQUEST §R1 |
| F05 | AVL Tree | Self-balancing BST with automatic LL, RR, LR, RL rotations and Fibonacci height bound | M2 (DSA) | ORIGINAL_REQUEST §R1 |
| F06 | Bellman-Ford Algorithm | Single-source shortest path with negative edge cycle detection pass | M2 (DSA) | ORIGINAL_REQUEST §R1 |
| F07 | Levenshtein Distance | Matrix DP edit distance with cell dependency and optimal path traceback | M2 (DSA) | ORIGINAL_REQUEST §R1 |
| F08 | Strongly Connected Components | Tarjan's low-link & DFS stack on directed graphs with maximal SCC extraction | M2 (DSA) | ORIGINAL_REQUEST §R1 |
| F09 | Fourier Series Synthesis | Harmonic decomposition, orthogonal basis, and Gibbs phenomenon | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F10 | ODEs: Euler & Separation | 1st order ODE slope field and step numerical integration | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F11 | Singular Value Decomposition | Matrix factorization A = UΣV^T, unit circle to ellipse mapping | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F12 | Gram-Schmidt Process | Vector orthogonalization and QR decomposition in R^2 | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F13 | Polar Coordinates | Non-linear mapping (r, θ), cardioids, and Grandi roses | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F14 | Affine Transformations | 3x3 homogeneous coordinates, translation, rotation, shear | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F15 | Multivariable Newton-Raphson | Iterative root-finding in R^2 using Jacobian matrix | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F16 | Central Limit Theorem | Empirical convergence of sample means to standard normal | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F17 | Binomial & Poisson | Law of rare events convergence B(n, p) -> Pois(λ) | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F18 | Modular Arithmetic & Bézout | Extended Euclidean algorithm, ax + by = gcd(a,b), modular inverse | M3 (Math) | ORIGINAL_REQUEST §R2 |
| F19 | Design Tokens & Cream Theme | Palette tokens (#FDFBF7, #E5E0D8, pastel accents) synchronization | M4 (Integration) | ORIGINAL_REQUEST §R3 |
| F20 | Centered Floating Modals | Technical sheets render as centered floating dialogs in both notebooks | M4 (Integration) | ORIGINAL_REQUEST §R3 |
| F21 | DAG CrossConnections | Cross-links between DSA and Math modules in curriculum.ts | M4 (Integration) | ORIGINAL_REQUEST §R3 |
| F22 | UI Filtering & Counters | Search, category filters, bookmarks, and unit counters reflect all topics | M4 (Integration) | ORIGINAL_REQUEST §R3 |
| F23 | Zero Lint Warnings/Errors | oxlint passes with 0 warnings and 0 errors across all files | M5 (Verification) | ORIGINAL_REQUEST §Acceptance |
| F24 | Strict TypeScript Compilation | tsc -b passes with 0 errors and zero `any` types | M5 (Verification) | ORIGINAL_REQUEST §Acceptance |
| F25 | Production PWA Build | vite build succeeds and generates clean dist/sw.js | M5 (Verification) | ORIGINAL_REQUEST §Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Architectural Surveys & Blueprints | Math blueprint (complete) + DSA architecture survey (complete) | none | DONE |
| M2 | DSA Expansion (AlgoNotebook) | 8 new algorithms (F01–F08): traces, dual code, KaTeX sheets, visualizers, UI registration | M1 | DONE |
| M3 | Math Expansion (MathNotebook) | 10 new modules (F09–F18): traces, dual code, KaTeX sheets with algebraicFoundations, viewports, UI registration | M1 | DONE |
| M4 | Parity, UI & DAG Integration | Final crossConnections, modal floating validation, theme tokens, counters reflection (F19–F22) | M2, M3 | DONE |
| M5 | Comprehensive Verification & Audit | oxlint (0 errors), tsc -b (0 errors), npm run build (clean dist/sw.js), Forensic Integrity Audit (F23–F25) | M4 | IN_PROGRESS |

## Interface Contracts
### DSA Module Contract (`AlgorithmModule` in `src/core/types.ts`)
- `id`: unique string identifier matching folder name.
- `metadata`: `AlgorithmMetadata` (`{ id, name, category, figureId, viewportType, timeComplexity, spaceComplexity, description }`).
- `generateTrace`: `(initialInput: number[]) => TraceFrame[]` (deterministic pure function).
- `code`: `{ c: string, python: string }` via `?raw` imports.
- `technicalSheet`: `AlgorithmTechnicalSheet` (`{ objective, mechanism, loopInvariant, properties, complexity, edgeCases, analogy, inPlainWords, complexityExplanation }`).

### Math Module Contract (`MathTopicModule` in `src/core/math-types.ts`)
- `topic`: `MathTopic` defined in `src/math/curriculum.ts`.
- `code`: `MathCodeSource` (`{ c: string, python: string }` via `?raw` imports).
- `proof`: `readonly ProofStep[]`.
- `generateTrace(controls, customEvaluate?)`: `readonly MathTraceFrame[]`.
- `technicalSheet`: `TechnicalSheet` (`{ definition, hypotheses, invariant, convergence, edgeCases, algebraicFoundations }`).
- `terms`: `readonly SemanticMathTerm[]`.

## Code Layout & File Boundaries
### DSA Expansion File Ownership (Track A — M2)
Exclusive write ownership:
- `src/algorithms/search/linear-binary-search/` (index.ts, trace.ts, code.c, code.py)
- `src/algorithms/trees/priority-queue/` (index.ts, trace.ts, code.c, code.py)
- `src/algorithms/dp/kadane/` (index.ts, trace.ts, code.c, code.py)
- `src/algorithms/graphs/topological-sort/` (index.ts, trace.ts, code.c, code.py)
- `src/algorithms/trees/avl-tree/` (index.ts, trace.ts, code.c, code.py)
- `src/algorithms/graphs/bellman-ford/` (index.ts, trace.ts, code.c, code.py)
- `src/algorithms/dp/levenshtein/` (index.ts, trace.ts, code.c, code.py)
- `src/algorithms/graphs/strongly-connected-components/` (index.ts, trace.ts, code.c, code.py)
- `src/algorithms/index.ts`
- `src/App.tsx`
- `src/components/layout/SideNavBar.tsx`
- `src/components/views/CurriculumView.tsx`
- `src/components/modals/AlgorithmTechnicalSheetModal.tsx`

### Math Expansion File Ownership (Track B — M3)
Exclusive write ownership:
- `src/math/analysis/fourier-series/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/math/analysis/ode-euler/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/math/linear-algebra/svd/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/math/linear-algebra/gram-schmidt/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/math/geometry/polar-coordinates/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/math/geometry/affine-transformations/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/math/optimization/newton-raphson-2d/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/math/probability/central-limit-theorem/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/math/probability/binomial-poisson/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/math/discrete/modular-euclid-bezout/` (index.ts, trace.ts, steps.ts, code.c, code.py)
- `src/renderers/math/SvdViewport.tsx`
- `src/renderers/math/GramSchmidtViewport.tsx`
- `src/renderers/math/AffineTransformationViewport.tsx`
- `src/core/math-types.ts`
- `src/math/curriculum.ts`
- `src/MathNotebookApp.tsx`
- `src/components/math/MathNotebookView.tsx`
- `src/components/math/MathNotebooksView.tsx`
- `src/math/index.ts`

These file sets are 100% disjoint. No concurrent worker writes to the other's files.
