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

# Handoff Report — MathNotebook Architecture & 10-Module Expansion Blueprint

**Agent**: teamwork_preview_explorer (investigator & synthesizer)  
**Task**: Exhaustive investigation of MathNotebook architecture and implementation blueprint for 10 new modules across 6 mathematical branches (R2 of ORIGINAL_REQUEST.md).  
**Working Directory**: `/home/leann027/Documentos/github/AlgoNotebook/.agents/teamwork/explorer_survey_math`  
**Date**: 2026-10-13  

---

## 1. Observation

### 1.1 Core Mathematical Types and Module Contract
In `src/core/math-types.ts`:
- **Clusters (`MathClusterId`)** (lines 1-7):
  ```typescript
  export type MathClusterId =
    | 'analysis-calculus'
    | 'linear-algebra'
    | 'discrete-mathematics'
    | 'probability-statistics'
    | 'optimization-numerical'
    | 'geometry-vectorial';
  ```
  These exactly mirror the 6 mathematical branches required by R2.
- **Module Interface (`MathTopicModule`)** (lines 426-436):
  ```typescript
  export interface MathTopicModule {
    readonly topic: MathTopic;
    readonly code: MathCodeSource; // { c: string, python: string } via ?raw imports
    readonly proof: readonly ProofStep[];
    readonly generateTrace: (
      controls: Readonly<Record<string, number>>,
      customEvaluate?: (x: number) => number,
    ) => readonly MathTraceFrame[];
    readonly technicalSheet?: TechnicalSheet;
    readonly terms?: readonly SemanticMathTerm[];
  }
  ```
- **Technical Sheet (`TechnicalSheet`)** (lines 248-259):
  ```typescript
  export interface TechnicalSheet {
    readonly definition: string;
    readonly hypotheses: readonly string[];
    readonly invariant: string;
    readonly convergence?: string;
    readonly edgeCases: readonly string[];
    readonly algebraicFoundations?: readonly {
      readonly title: string;
      readonly formula: string;
      readonly description: string;
    }[];
  }
  ```
- **Trace Frame & Snapshots (`MathTraceFrame`, `MathSnapshot`)** (lines 358-366, 405-419):
  ```typescript
  export type MathSnapshot =
    | CartesianSnapshot
    | VectorSpanSnapshot
    | LinearTransformationSnapshot
    | KnowledgeGraphSnapshot
    | FormulaWalkthroughSnapshot
    | LinearSystemsSnapshot
    | GraphNetworkSnapshot;
  ```
  Every frame supplies `stepIndex`, `totalSteps`, `highlightLines: { c, python }`, `snapshot`, `controls: ParametricControl[]`, `proofStep: ProofStep`, `explanation: { stepLabel, text, subNote }`, `metrics: MathMetrics`, and `event: MathEvent`.

### 1.2 KaTeX Technical Sheet Modal Architecture
In `src/components/math/MathTechnicalSheetModal.tsx`:
- The modal renders as a centered floating modal dialog (`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink-primary/50 backdrop-blur-xs`) with Escape key listener and backdrop dismiss.
- Supports 6 distinct tabs:
  1. `'definition'`: Central formula display in KaTeX + formal definition + pedagogical objective + cluster metadata.
  2. `'hypotheses'`: Domain of validity & precondition checklist (`technicalSheet.hypotheses`).
  3. `'invariant'`: Theoretical invariant and justification for correctness.
  4. `'foundations'`: **`algebraicFoundations`** list with individual titles, KaTeX formulas inside `overflow-x-auto py-1.5 px-3` wrappers, and descriptions.
  5. `'convergence'`: Asymptotic convergence rates and edge cases/singularities (`technicalSheet.edgeCases`).
  6. `'activeStep'`: Step-specific formula (`frame.proofStep.latex`) and explanation.

### 1.3 Viewports and 2D Rendering Engine
Existing viewports in `src/renderers/math/`:
1. `CartesianCoordinateViewport.tsx`:
   - Interactive SVG canvas (`viewBox="0 0 760 420"`).
   - Zoom/pan handling via pointer and wheel events.
   - Millimeter grid with dynamic tick calculation (`niceStep`).
   - Supports: primary curve (`snapshot.samples`), secondary curves (`snapshot.curves`), Riemann rectangles (`snapshot.areaRectangles`), shaded intervals (`frame.visualElements.shadedInterval`), secants, tangents, asymptotes, discontinuities, projections, draggable handles, and sticky note post-it annotation card (`#FFFBEA` with `#FDE047` border).
2. `LinearTransformationViewport.tsx`:
   - Interactive 2D basis distortion with draggable $\vec{i}, \vec{j}$ basis handles, deformed grid lines, orientation detection, and determinant scaling.
3. `VectorSpanViewport.tsx`:
   - 2D vector linear combination $\alpha \vec{u} + \beta \vec{v}$, parallelogram shading, and coordinates.
4. `LinearSystemsViewport.tsx`:
   - 2D line intersection for $2\times 2$ systems + step-by-step augmented matrix Gaussian elimination.
5. `FormulaWalkthroughViewport.tsx`:
   - Stepped algebraic deductions with KaTeX steps, evaluated variables badges, and optional interactive tables (Pascal rows, truth tables).
6. `KnowledgeGraphViewport.tsx`:
   - DAG dependency graph rendering with auto-computed width `Math.max(1100, max(node.x) + 220)` and height `Math.max(650, max(node.y) + 110)`.

### 1.4 UI Registration and Navigation Pipeline
The module registration pipeline spans 5 files:
1. `src/math/curriculum.ts`:
   - `MATH_TOPICS`: Array of `MathTopic` (currently 22 topics).
   - `CLUSTER_ROW_OFFSET`: Y-coordinate mapping per cluster for DAG layout.
   - `buildCurriculumGraph`: Positions nodes at `x = 140 + (order - 1) * 220`, `y = CLUSTER_ROW_OFFSET[cluster]`.
2. `src/MathNotebookApp.tsx`:
   - `MATH_CLUSTER_SPEC`: Categorizes topic IDs into the 6 clusters for `UnifiedNotebookHeader` catalog groups.
3. `src/components/math/MathSideNav.tsx`:
   - Collapsible cluster navigation rendering topic title, level dot (`emerald` for introductory, `amber` for intermediate, `indigo` for advanced), viewport badge, and summary.
4. `src/components/math/MathNotebookView.tsx`:
   - `const MODULES: Readonly<Record<string, MathTopicModule>> = { ... }`: Maps `topicId` to module instances.
   - Controls state (`controlValues`), expression evaluation (`customEvaluate`), and step playback via `usePlayback`.
   - Viewport dispatcher: checks `frame.snapshot.kind` and renders corresponding viewport component.
5. `src/math/index.ts`:
   - Barrel export file re-exporting all math modules.

### 1.5 Baseline Verification
- `npm run lint` (`oxlint`): **0 warnings, 0 errors** on 221 files.
- `npx tsc -b`: **0 errors**.
- `npm run build` (`vite build` + PWA generateSW): **clean build** in 1.17s, generating `dist/sw.js`.

---

## 2. Logic Chain

1. **State & Playback Flow**:
   When the user selects a topic in `UnifiedNotebookHeader`, `MathSideNav`, `MathCurriculumView`, or `KnowledgeDAGDrawer`, `selectedTopicId` updates in `MathNotebookApp.tsx`.
   `MathNotebookView` retrieves `activeModule = MODULES[selectedTopicId]`.
   `activeModule.generateTrace(controlValues, customEvaluate)` produces `frames: readonly MathTraceFrame[]`.
   `usePlayback` handles playback speed, play/pause, step scrub, and step back/forward.
   `frame = frames[currentStepIndex - 1]`.

2. **Parametric Reactivity**:
   When controls change in `ParametricControlBar`, `handleControlChange` updates `controlValues` and resets `playback`.
   `activeModule.generateTrace` recomputes the frames deterministically.

3. **Technical Sheet Modal**:
   Clicking the technical sheet card opens `MathTechnicalSheetModal`, populating tabs directly from `activeModule.technicalSheet` and `frame.proofStep`.

4. **Curriculum DAG Extension**:
   Adding new topics to `MATH_TOPICS` with designated `order` and `crossConnections` automatically integrates them into:
   - `buildCurriculumGraph` (dynamic node spacing and connecting bezier curves).
   - `MathCurriculumView` (units view + graph view).
   - `MathSideNav` (grouped by cluster with count badge).
   - `MathNotebookApp`'s `MATH_CATALOG_GROUPS` (in the header dropdown).

---

## 3. Caveats

1. **Snapshots for Linear Algebra and Geometry**:
   While Fourier Series, ODE Euler, Polar Coordinates, Newton-Raphson 2D, Central Limit Theorem, and Binomial/Poisson map directly onto `CartesianSnapshot`, and Modular Euclidean maps onto `FormulaWalkthroughSnapshot`, SVD, Gram-Schmidt, and Affine Transformations can either:
   - (A) Map onto `CartesianSnapshot` or `VectorSpanSnapshot` using curves/samples/vectors.
   - (B) Introduce dedicated snapshot interfaces (`SvdSnapshot`, `GramSchmidtSnapshot`, `AffineTransformationSnapshot`) and dedicated viewport components (`SvdViewport.tsx`, `GramSchmidtViewport.tsx`, `AffineTransformationViewport.tsx`).
   *Recommendation*: Option (B) provides clean mathematical isolation, zero clipping, and the most engaging interactive visualizers.
2. **Missing Clusters in `MathNotebooksView.tsx`**:
   `MathNotebooksView.tsx` (lines 10-15) currently defines `CLUSTERS` with only 4 clusters, omitting `geometry-vectorial` and `optimization-numerical`. Also `MathNotebookView.tsx` line 138 displays a hardcoded string `4 clusters`. Both should be updated to all 6 clusters.
3. **Dual Code Assets (`code.c`, `code.py`)**:
   Every new module directory must include valid, clean C99 (`code.c`) and Python 3 (`code.py`) files, imported via `import cSource from './code.c?raw'` and `import pythonSource from './code.py?raw'`.
4. **KaTeX Overflow Safety**:
   All formulas must be rendered via `<MathFormula>` with `displayMode` inside containers having `overflow-x-auto py-1.5` to prevent horizontal clipping.

---

## 4. Conclusion & Concrete Blueprint

We specify the complete blueprint for **10 new MathNotebook modules** across all 6 mathematical branches, fully satisfying and exceeding R2 ("al menos 8 nuevos módulos pedagógicos").

---

### Module 1: Fourier Series — Harmonic Decomposition & Synthesis
- **Branch**: Análisis y Cálculo (`analysis-calculus`)
- **Topic ID**: `analysis.fourier-series`
- **Module ID**: `fourier-series`
- **Order**: 6
- **Level**: `advanced`
- **Viewport**: `CartesianCoordinateViewport` (`snapshot.kind = 'cartesian'`)
- **Directory**: `src/math/analysis/fourier-series/`
- **Files to Create**:
  1. `src/math/analysis/fourier-series/index.ts`
  2. `src/math/analysis/fourier-series/trace.ts`
  3. `src/math/analysis/fourier-series/steps.ts`
  4. `src/math/analysis/fourier-series/code.c`
  5. `src/math/analysis/fourier-series/code.py`
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Series de Fourier y Síntesis Armónica'
  - `summary`: 'Descomposición en base ortonormal trigonométrica y fenómeno de Gibbs.'
  - `centralFormula`: 'f(x) = \\frac{a_0}{2} + \\sum_{n=1}^N \\left(a_n \\cos\\left(\\frac{n\\pi x}{L}\\right) + b_n \\sin\\left(\\frac{n\\pi x}{L}\\right)\\right)'
  - `viewportLabel`: 'Cartesiano 2D'
  - `crossConnections`:
    - `{ targetId: 'analysis.taylor-series', relationship: 'Aproximación por base trigonométrica vs polinomial' }`
    - `{ targetId: 'analysis.integral', relationship: 'Cálculo de coeficientes mediante producto interno' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$f(x) \sim \frac{a_0}{2} + \sum_{n=1}^\infty \left(a_n \cos\left(\frac{n\pi x}{L}\right) + b_n \sin\left(\frac{n\pi x}{L}\right)\right)$$
  - **Hypotheses**:
    1. $f$ satisface las condiciones de Dirichlet en $[-L, L]$: acotada, continua a trozos con finitas discontinuidades de salto y finitos extremos locales.
    2. Período fundamental $T = 2L$ con extensión periódica en todo $\mathbb{R}$.
    3. Ortogonalidad de la base trigonométrica: $\int_{-L}^L \sin(n\pi x/L)\cos(m\pi x/L)dx = 0$, $\int_{-L}^L \sin(n\pi x/L)\sin(m\pi x/L)dx = L\delta_{nm}$.
  - **Invariant**:
    Conservación de la energía según la Identidad de Parseval: $\frac{1}{2L}\int_{-L}^L |f(x)|^2 dx = \frac{a_0^2}{4} + \frac{1}{2}\sum_{n=1}^\infty (a_n^2 + b_n^2)$.
  - **Convergence**:
    Convergencia puntual en puntos de continuidad $S_N(x) \to f(x)$; en discontinuidades converge a $\frac{f(x^+) + f(x^-)}{2}$ con sobreimpulso asintótico de Gibbs de $\approx 8.95\%$.
  - **Edge Cases**:
    - Discontinuidades de salto (fenómeno de Gibbs persistente al aumentar $N$).
    - Crecimiento de armónicos pares en ondas impares (coeficientes idénticamente nulos).
  - **Algebraic Foundations**:
    1. *Ortogonalidad en $L^2[-L, L]$*: $\langle \phi_n, \phi_m \rangle = \int_{-L}^L \phi_n(x)\phi_m(x)dx = L \delta_{nm}$.
    2. *Fórmula de Coeficientes de Euler-Fourier*: $b_n = \frac{1}{L}\int_{-L}^L f(x)\sin\left(\frac{n\pi x}{L}\right)dx$.
    3. *Identidad de Parseval*: $\|f\|^2 = \frac{a_0^2}{2} + \sum_{n=1}^\infty (a_n^2 + b_n^2)$.
    4. *Forma Exponencial Compleja*: $f(x) = \sum_{n=-\infty}^\infty c_n e^{i n \pi x / L},\quad c_n = \frac{1}{2}(a_n - i b_n)$.
- **Trace Generator & Controls**:
  - Controls: `harmonics` (integer, min: 1, max: 15, step: 2, default: 5), `waveform` (select: 'square', 'sawtooth', 'triangle').
  - Trace steps: Base signal $\to$ Fundamental harmonic $n=1 \to$ Odd harmonics accumulation $n=3, 5 \dots N \to$ Synthesis analysis with Gibbs overshoot measurement.
  - Visualizer clipping prevention: `xDomain: [-Math.PI * 1.5, Math.PI * 1.5]`, `yDomain: [-1.6, 1.6]` with 25% vertical buffer for Gibbs peaks.

---

### Module 2: Ordinary Differential Equations (ODEs) — Euler & Separation
- **Branch**: Análisis y Cálculo (`analysis-calculus`)
- **Topic ID**: `analysis.ode-euler`
- **Module ID**: `ode-euler`
- **Order**: 7
- **Level**: `intermediate`
- **Viewport**: `CartesianCoordinateViewport` (`snapshot.kind = 'cartesian'`)
- **Directory**: `src/math/analysis/ode-euler/`
- **Files to Create**:
  1. `src/math/analysis/ode-euler/index.ts`
  2. `src/math/analysis/ode-euler/trace.ts`
  3. `src/math/analysis/ode-euler/steps.ts`
  4. `src/math/analysis/ode-euler/code.c`
  5. `src/math/analysis/ode-euler/code.py`
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Ecuaciones Diferenciales: Euler y Separación'
  - `summary`: 'Integración de EDO de 1er orden por campos de pendientes y discretización.'
  - `centralFormula`: 'y_{k+1} = y_k + h \\cdot f(x_k, y_k),\\quad \\frac{dy}{dx} = f(x, y)'
  - `viewportLabel`: 'Cartesiano 2D'
  - `crossConnections`:
    - `{ targetId: 'analysis.derivative', relationship: 'Aproximación por recta tangente local' }`
    - `{ targetId: 'analysis.integral', relationship: 'Solución analítica por cuadratura e integración' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$y'(x) = f(x, y(x)),\quad y(x_0) = y_0 \implies y_{k+1} = y_k + h f(x_k, y_k)$$
  - **Hypotheses**:
    1. $f(x, y)$ es continua y satisface condición de Lipschitz respecto a $y$: $|f(x, y_1) - f(x, y_2)| \le L |y_1 - y_2|$ (Teorema de Picard-Lindelöf).
    2. Tamaño de paso uniforme $h = \Delta x > 0$ en $[x_0, x_n]$.
    3. Condición inicial de Cauchy $(x_0, y_0)$ bien definida.
  - **Invariant**:
    En cada paso $k$, el segmento poligonal une $(x_k, y_k)$ con $(x_{k+1}, y_{k+1})$ con pendiente exactamente igual a $f(x_k, y_k)$.
  - **Convergence**:
    Error de truncamiento local $\mathcal{O}(h^2)$ por Taylor; error global acumulado $\mathcal{O}(h)$ (método de primer orden). Estable si $|1 - \lambda h| < 1$.
  - **Edge Cases**:
    - Paso $h$ excesivamente grande genera inestabilidad numérica u oscilaciones divergentes.
    - Problemas rígidos (*stiff*) requieren métodos implícitos o pasos microscópicos.
  - **Algebraic Foundations**:
    1. *Separación de Variables*: $g(y)dy = h(x)dx \implies \int g(y)dy = \int h(x)dx + C$.
    2. *Desarrollo de Taylor de Primer Orden*: $y(x_0+h) = y(x_0) + h y'(x_0) + \frac{h^2}{2}y''(\xi)$.
    3. *Constante de Lipschitz*: $|f(x, u) - f(x, v)| \le L|u - v| \implies$ Existencia y unicidad global.
    4. *Cota de Error Global*: $|y(x_n) - y_n| \le \frac{M h}{2L}(e^{L(x_n - x_0)} - 1)$.
- **Trace Generator & Controls**:
  - Controls: `h` (continuous, min: 0.05, max: 0.5, step: 0.05, default: 0.2), `y0` (continuous, min: 0.5, max: 3, default: 1.5).
  - Target problem: $\frac{dy}{dx} = -0.8 y + 0.5 x$, analytical solution curve plotted vs Euler step polygonal trajectory with slope vector indicators.
  - Visualizer clipping prevention: `xDomain: [0, 5]`, `yDomain: [0, 3.5]`.

---

### Module 3: Singular Value Decomposition (SVD)
- **Branch**: Álgebra Lineal (`linear-algebra`)
- **Topic ID**: `linear.svd`
- **Module ID**: `svd`
- **Order**: 6
- **Level**: `advanced`
- **Viewport**: `SvdViewport` (`snapshot.kind = 'svd'`)
- **Directory**: `src/math/linear-algebra/svd/`
- **Files to Create**:
  1. `src/math/linear-algebra/svd/index.ts`
  2. `src/math/linear-algebra/svd/trace.ts`
  3. `src/math/linear-algebra/svd/steps.ts`
  4. `src/math/linear-algebra/svd/code.c`
  5. `src/math/linear-algebra/svd/code.py`
  6. `src/renderers/math/SvdViewport.tsx` (dedicated 2D visualizer for circle-to-ellipse geometry)
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Descomposición en Valores Singulares (SVD)'
  - `summary`: 'Factorización $A = U\\Sigma V^T$: rotación, escalado y deformación elipsoidal.'
  - `centralFormula`: 'A = U \\Sigma V^T = \\sum_{i=1}^r \\sigma_i \\vec u_i \\vec v_i^T'
  - `viewportLabel`: 'Deformación SVD'
  - `crossConnections`:
    - `{ targetId: 'linear.eigen', relationship: 'Autovalores de matrices simétricas $A^T A$ y $A A^T$' }`
    - `{ targetId: 'linear.matrices-transformations', relationship: 'Geometría de la acción de una matriz sobre el círculo unitario' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$A = U \Sigma V^T,\quad U \in O(m),\; V \in O(n),\; \Sigma = \operatorname{diag}(\sigma_1, \dots, \sigma_r),\; \sigma_1 \ge \sigma_2 \ge \dots \ge 0$$
  - **Hypotheses**:
    1. Matriz $A \in \mathbb{R}^{m \times n}$ de rango $r \le \min(m, n)$.
    2. Las columnas de $V$ ($\vec{v}_i$) son autovectores ortonormales de $A^T A$.
    3. Las columnas de $U$ ($\vec{u}_i$) son autovectores ortonormales de $A A^T$ con $\vec{u}_i = \frac{1}{\sigma_i} A \vec{v}_i$.
  - **Invariant**:
    $\|A\|_2 = \sigma_1$; la imagen del círculo unitario $S^1$ bajo $A$ es un elipsoide cuyos semiejes principales tienen longitudes $\sigma_1, \sigma_2$ dirigidos a lo largo de $\vec{u}_1, \vec{u}_2$.
  - **Convergence**:
    Teorema de Eckart-Young-Mirsky: $A_k = \sum_{i=1}^k \sigma_i \vec{u}_i \vec{v}_i^T$ es la mejor aproximación de rango $k$ bajo norma espectral y de Frobenius con error $\|A - A_k\|_2 = \sigma_{k+1}$.
  - **Edge Cases**:
    - Matriz singular o con rango deficiente ($\sigma_2 = 0$: el elipsoide colapsa a un segmento de recta).
    - Valores singulares iguales ($\sigma_1 = \sigma_2$: rotación y dilatación isotrópica sin eje preferencial).
  - **Algebraic Foundations**:
    1. *Descomposición Canónica*: $A = U \Sigma V^T \iff A \vec{v}_i = \sigma_i \vec{u}_i$.
    2. *Autovalores del Gramiano*: $A^T A = V (\Sigma^T \Sigma) V^T \implies \sigma_i = \sqrt{\lambda_i(A^T A)}$.
    3. *Pseudoinversa de Moore-Penrose*: $A^+ = V \Sigma^+ U^T,\quad \Sigma^+ = \operatorname{diag}(1/\sigma_1, \dots, 1/\sigma_r, 0)$.
    4. *Número de Condición Espectral*: $\kappa(A) = \frac{\sigma_{\max}}{\sigma_{\min}} \ge 1$.
- **Trace Generator & Controls**:
  - Controls: `theta` (continuous, rotation of $V$, default: 0.5 rad), `sigma1` (continuous, scale 1, default: 2.2), `sigma2` (continuous, scale 2, default: 0.9), `phi` (continuous, rotation of $U$, default: 0.8 rad).
  - 4-step pedagogical sequence:
    1. Base unit circle with right singular basis $\{v_1, v_2\}$.
    2. Action of $V^T$: Alignment with coordinate axes.
    3. Action of $\Sigma$: Axis scaling into canonical ellipse $(\sigma_1, \sigma_2)$.
    4. Action of $U$: Final rotation into oriented ellipse along $\{u_1, u_2\}$.
  - Visualizer clipping prevention: Dynamic canvas centering with scale factor `scale = 55`, bounding circle diameter `< 440px` inside `500x420` SVG.

---

### Module 4: Orthogonal Projections & Gram-Schmidt Process
- **Branch**: Álgebra Lineal (`linear-algebra`)
- **Topic ID**: `linear.gram-schmidt`
- **Module ID**: `gram-schmidt`
- **Order**: 7
- **Level**: `intermediate`
- **Viewport**: `GramSchmidtViewport` (`snapshot.kind = 'gram-schmidt'`)
- **Directory**: `src/math/linear-algebra/gram-schmidt/`
- **Files to Create**:
  1. `src/math/linear-algebra/gram-schmidt/index.ts`
  2. `src/math/linear-algebra/gram-schmidt/trace.ts`
  3. `src/math/linear-algebra/gram-schmidt/steps.ts`
  4. `src/math/linear-algebra/gram-schmidt/code.c`
  5. `src/math/linear-algebra/gram-schmidt/code.py`
  6. `src/renderers/math/GramSchmidtViewport.tsx`
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Proyecciones Ortogonales y Gram-Schmidt'
  - `summary`: 'Ortogonalización algorítmica y descomposición QR en espacios euclidianos.'
  - `centralFormula`: '\\vec u_k = \\vec v_k - \\sum_{j=1}^{k-1} \\frac{\\langle \\vec v_k, \\vec u_j\\rangle}{\\|\\vec u_j\\|^2} \\vec u_j,\\quad \\vec e_k = \\frac{\\vec u_k}{\\|\\vec u_k\\|}'
  - `viewportLabel`: 'Ortogonalización'
  - `crossConnections`:
    - `{ targetId: 'linear.vectors-span', relationship: 'Base que genera el mismo subespacio span' }`
    - `{ targetId: 'linear.systems-intersections', relationship: 'Mínimos cuadrados lineales mediante proyección' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$\vec{u}_1 = \vec{v}_1,\quad \vec{u}_2 = \vec{v}_2 - \operatorname{proj}_{\vec{u}_1}(\vec{v}_2) = \vec{v}_2 - \frac{\vec{v}_2 \cdot \vec{u}_1}{\|\vec{u}_1\|^2}\vec{u}_1,\quad \vec{e}_i = \frac{\vec{u}_i}{\|\vec{u}_i\|}$$
  - **Hypotheses**:
    1. Conjunto $\{\vec{v}_1, \vec{v}_2\}$ linealmente independiente en $\mathbb{R}^2$ ($\vec{v}_1 \nparallel \vec{v}_2$).
    2. Producto interno euclidiano estándar $\langle \vec{x}, \vec{y} \rangle = x_1 y_1 + x_2 y_2$.
    3. Vectores no nulos $\|\vec{v}_i\| > 0$.
  - **Invariant**:
    $\operatorname{span}(\vec{u}_1, \dots, \vec{u}_k) = \operatorname{span}(\vec{v}_1, \dots, \vec{v}_k)$ para todo $k$, con $\langle \vec{u}_i, \vec{u}_j \rangle = 0$ para $i \neq j$.
  - **Convergence**:
    Proceso finito exacto en $n$ iteraciones ($n=2$ en $\mathbb{R}^2$).
  - **Edge Cases**:
    - Vectores casi colineales provocan pérdida de ortogonalidad por cancelación en coma flotante (requiere Gram-Schmidt Modificado).
    - Vector nulo $\vec{v}_k = \vec{0}$ genera división por cero en la normalización.
  - **Algebraic Foundations**:
    1. *Fórmula de Proyección Ortogonal*: $\operatorname{proj}_{\vec{u}}(\vec{v}) = \frac{\langle \vec{v}, \vec{u} \rangle}{\|\vec{u}\|^2} \vec{u}$.
    2. *Teorema de Pitágoras Euclidiano*: $\|\vec{v}\|^2 = \|\operatorname{proj}_W(\vec{v})\|^2 + \|\vec{v} - \operatorname{proj}_W(\vec{v})\|^2$.
    3. *Descomposición Matricial QR*: $A = Q R$, con $Q^T Q = I$ y $R$ triangular superior.
    4. *Desigualdad de Cauchy-Schwarz*: $|\langle \vec{u}, \vec{v} \rangle| \le \|\vec{u}\| \|\vec{v}\|$.
- **Trace Generator & Controls**:
  - Controls: `v1x`, `v1y` (default: 3, 1), `v2x`, `v2y` (default: 1, 2.5).
  - 4 trace steps:
    1. Entrada original $\{\vec{v}_1, \vec{v}_2\}$.
    2. Fijación de $\vec{u}_1 = \vec{v}_1$ y cálculo de la sombra de proyección $\operatorname{proj}_{\vec{u}_1}(\vec{v}_2)$.
    3. Sustracción ortogonal $\vec{u}_2 = \vec{v}_2 - \operatorname{proj}_{\vec{u}_1}(\vec{v}_2)$ con símbolo de ángulo recto $90^\circ$.
    4. Normalización final a base ortonormal $\{\vec{e}_1, \vec{e}_2\}$ sobre el círculo unitario.
  - Visualizer clipping prevention: Dynamic normalization scaling so vectors never exceed SVG canvas margins ($[-4, 4]$ coordinates in $480\times 400$ viewport).

---

### Module 5: Polar Coordinates & Classical Curves
- **Branch**: Geometría Vectorial (`geometry-vectorial`)
- **Topic ID**: `geometry.polar-coordinates`
- **Module ID**: `polar-coordinates`
- **Order**: 2
- **Level**: `introductory`
- **Viewport**: `CartesianCoordinateViewport` (`snapshot.kind = 'cartesian'`)
- **Directory**: `src/math/geometry/polar-coordinates/`
- **Files to Create**:
  1. `src/math/geometry/polar-coordinates/index.ts`
  2. `src/math/geometry/polar-coordinates/trace.ts`
  3. `src/math/geometry/polar-coordinates/steps.ts`
  4. `src/math/geometry/polar-coordinates/code.c`
  5. `src/math/geometry/polar-coordinates/code.py`
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Coordenadas Polares y Curvas Canónicas'
  - `summary`: 'Sistemas $(r, \\theta)$, mapeo no lineal, cardioides y rosas de Grandi.'
  - `centralFormula`: 'x = r\\cos\\theta,\\quad y = r\\sin\\theta,\\quad r^2 = x^2+y^2'
  - `viewportLabel`: 'Plano Polar'
  - `crossConnections`:
    - `{ targetId: 'geometry.unit-circle', relationship: 'Parametrización trigonométrica elemental' }`
    - `{ targetId: 'analysis.integral', relationship: 'Elementos de área polar y jacobiano de transformación' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$\Phi(r, \theta) = (r\cos\theta, r\sin\theta),\quad r \in \mathbb{R},\;\theta \in [0, 2\pi)$$
  - **Hypotheses**:
    1. Polo fijado en el origen $(0,0)$ y eje polar coincidente con el semieje positivo de abscisas.
    2. Radio $r = f(\theta)$ función continua a trozos sobre el dominio angular.
    3. Ángulo $\theta$ medido en radianes en sentido antihorario.
  - **Invariant**:
    $x^2 + y^2 = r^2$ y $\tan\theta = y/x$ ($x \neq 0$); conservación de la distancia al polo independientemente de la base ortogonal.
  - **Convergence**:
    Curvas cerradas con período angular $T$ ($2\pi$ para cardioides $r = a(1+\cos\theta)$, $\pi$ o $2\pi$ para rosas de Grandi $r = a\cos(k\theta)$).
  - **Edge Cases**:
    - Polo $r = 0$: el ángulo $\theta$ es indeterminado (singularidad de coordenadas).
    - Valores negativos de radio $r < 0$ representan reflexión central a través del polo: $(-r, \theta) \equiv (|r|, \theta + \pi)$.
  - **Algebraic Foundations**:
    1. *Transformación Inversa*: $r = \sqrt{x^2 + y^2},\quad \theta = \operatorname{atan2}(y, x)$.
    2. *Jacobiano de la Transformación*: $\det J = \frac{\partial(x, y)}{\partial(r, \theta)} = r \implies dA = r\,dr\,d\theta$.
    3. *Ecuación de la Cardioide*: $r(\theta) = a(1 + \cos\theta)$.
    4. *Rosa de Grandi*: $r(\theta) = a\cos(k\theta)$ (produce $k$ pétalos si $k$ es impar, $2k$ pétalos si $k$ es par).
    5. *Diferencial de Longitud de Arco*: $ds = \sqrt{r^2 + \left(\frac{dr}{d\theta}\right)^2} d\theta$.
- **Trace Generator & Controls**:
  - Controls: `curveType` (select: 'cardioid', 'rose', 'spiral'), `a` (continuous, scale factor 0.5 to 2, default: 1.2), `petals` (integer: 2 to 6, default: 4), `theta` (continuous, sweeping angle $0$ to $2\pi$).
  - Trace steps: Sweeping angle frame by frame, drawing the complete trace, active radius vector $\vec{r}$, and orthogonal projection components $x, y$.
  - Visualizer clipping prevention: `xDomain: [-3.2, 3.2]`, `yDomain: [-3.2, 3.2]`, polar grid concentric rings at $r=1, 2, 3$.

---

### Module 6: Affine Transformations in $\mathbb{R}^2$
- **Branch**: Geometría Vectorial (`geometry-vectorial`)
- **Topic ID**: `geometry.affine-transformations`
- **Module ID**: `affine-transformations`
- **Order**: 3
- **Level**: `intermediate`
- **Viewport**: `AffineTransformationViewport` (`snapshot.kind = 'affine-transformation'`)
- **Directory**: `src/math/geometry/affine-transformations/`
- **Files to Create**:
  1. `src/math/geometry/affine-transformations/index.ts`
  2. `src/math/geometry/affine-transformations/trace.ts`
  3. `src/math/geometry/affine-transformations/steps.ts`
  4. `src/math/geometry/affine-transformations/code.c`
  5. `src/math/geometry/affine-transformations/code.py`
  6. `src/renderers/math/AffineTransformationViewport.tsx`
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Transformaciones Afines en R²'
  - `summary`: 'Coordenadas homogéneas $3\\times 3$, traslaciones, rotaciones y deformación afín.'
  - `centralFormula`: 'T(\\vec x) = A\\vec x + \\vec b = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}\\vec x + \\begin{bmatrix} t_x \\\\ t_y \\end{bmatrix}'
  - `viewportLabel`: 'Plano Afín'
  - `crossConnections`:
    - `{ targetId: 'linear.matrices-transformations', relationship: 'Extensión afín de las aplicaciones lineales que incorpora traslación' }`
    - `{ targetId: 'linear.determinants', relationship: 'Factor de dilatación de áreas preservado por det(A)' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} = \begin{bmatrix} a & b & t_x \\ c & d & t_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$$
  - **Hypotheses**:
    1. Espacio afín $\mathbb{A}^2$ modelado sobre el espacio vectorial $\mathbb{R}^2$.
    2. Matriz lineal asociada $A \in \mathbb{R}^{2\times 2}$ con $\det(A) \neq 0$ para garantizar invertibilidad afín.
    3. Vector de desplazamiento $\vec{b} = (t_x, t_y)^T \in \mathbb{R}^2$.
  - **Invariant**:
    Preservación del paralelismo entre rectas, collinearidad de puntos y razones simples de distancias sobre rectas paralelas; el área de cualquier polígono se escala por $|\det(A)|$.
  - **Convergence**:
    Propiedad de grupo afín $\operatorname{Aff}(2, \mathbb{R})$ cerrado bajo composición asociativa.
  - **Edge Cases**:
    - $\det(A) = 0$: la transformación colapsa el plano a una recta o a un punto (pérdida de biyectividad).
    - Traslación pura ($A = I$): preserva todas las distancias e isometrías euclidianas.
  - **Algebraic Foundations**:
    1. *Representación en Coordenadas Homogéneas*: Composición de mapas afines mediante multiplicación de matrices $3\times 3$.
    2. *Conservación de Combinaciones Baricéntricas*: $T\left(\sum \lambda_i p_i\right) = \sum \lambda_i T(p_i)$ para $\sum \lambda_i = 1$.
    3. *Descomposición Canónica de Mapas Afines*: Traslación $\circ$ Rotación $\circ$ Escalado $\circ$ Cizalladura (*Shear*).
    4. *Relación de Áreas*: $\operatorname{Área}(T(\Omega)) = |\det(A)| \cdot \operatorname{Área}(\Omega)$.
- **Trace Generator & Controls**:
  - Controls: `tx` (continuous, -2 to 2, default: 1), `ty` (continuous, -2 to 2, default: 0.8), `rotation` (continuous, angle in deg: 0 to 180, default: 30), `sx` (scale X: 0.5 to 2, default: 1.2), `sy` (scale Y: 0.5 to 2, default: 0.9).
  - Trace steps: Original geometric polygon $\to$ Linear rotation & stretch $\to$ Translation vector displacement $\to$ Final transformed shape with area change calculation.
  - Visualizer clipping prevention: Bounded coordinate frame $[-4, 4]$ with clear SVG view centering.

---

### Module 7: Multivariable Newton-Raphson in 2D
- **Branch**: Optimización Numérica (`optimization-numerical`)
- **Topic ID**: `optimization.newton-raphson-2d`
- **Module ID**: `newton-raphson-2d`
- **Order**: 5
- **Level**: `advanced`
- **Viewport**: `CartesianCoordinateViewport` (`snapshot.kind = 'cartesian'`)
- **Directory**: `src/math/optimization/newton-raphson-2d/`
- **Files to Create**:
  1. `src/math/optimization/newton-raphson-2d/index.ts`
  2. `src/math/optimization/newton-raphson-2d/trace.ts`
  3. `src/math/optimization/newton-raphson-2d/steps.ts`
  4. `src/math/optimization/newton-raphson-2d/code.c`
  5. `src/math/optimization/newton-raphson-2d/code.py`
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Newton-Raphson Multivariable en 2D'
  - `summary`: 'Resolución iterativa de sistemas no lineales mediante la matriz jacobiana.'
  - `centralFormula`: '\\mathbf{x}_{k+1} = \\mathbf{x}_k - [J_F(\\mathbf{x}_k)]^{-1} F(\\mathbf{x}_k),\\quad F: \\mathbb{R}^2 \\to \\mathbb{R}^2'
  - `viewportLabel`: 'Cartesiano 2D'
  - `crossConnections`:
    - `{ targetId: 'analysis.optimization-roots', relationship: 'Generalización multivariable del método unidimensional' }`
    - `{ targetId: 'linear.systems-intersections', relationship: 'Resolución de sistemas lineales en cada paso $J \\Delta x = -F$' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$F(\mathbf{x}) = \begin{bmatrix} f_1(x, y) \\ f_2(x, y) \end{bmatrix} = \mathbf{0} \implies J_F(\mathbf{x}_k) \Delta \mathbf{x}_k = -F(\mathbf{x}_k),\quad \mathbf{x}_{k+1} = \mathbf{x}_k + \Delta \mathbf{x}_k$$
  - **Hypotheses**:
    1. $F: \mathbb{R}^2 \to \mathbb{R}^2$ de clase $C^2$ en un entorno de la raíz $\mathbf{x}^*$.
    2. Matriz Jacobiana $J_F(\mathbf{x}) = \begin{bmatrix} \partial f_1/\partial x & \partial f_1/\partial y \\ \partial f_2/\partial x & \partial f_2/\partial y \end{bmatrix}$ no singular en la raíz ($\det J_F(\mathbf{x}^*) \neq 0$).
    3. Punto inicial $\mathbf{x}_0$ en la cuenca de atracción de $\mathbf{x}^*$ (Teorema de Kantorovich).
  - **Invariant**:
    En cada iteración, $\mathbf{x}_{k+1}$ es la intersección de los dos planos tangentes que linealizan $f_1$ y $f_2$ en $\mathbf{x}_k$ con el plano $z=0$.
  - **Convergence**:
    Convergencia cuadrática local: $\|\mathbf{x}_{k+1} - \mathbf{x}^*\| \le C \|\mathbf{x}_k - \mathbf{x}^*\|^2$.
  - **Edge Cases**:
    - $\det(J_F(\mathbf{x}_k)) = 0$: la matriz jacobiana no se puede invertir (paso indefinido).
    - Ciclos límite o trayectorias caóticas cuando $\mathbf{x}_0$ se elige lejos de la raíz.
  - **Algebraic Foundations**:
    1. *Linealización por Serie de Taylor Multivariable*: $F(\mathbf{x}_k + \Delta \mathbf{x}) \approx F(\mathbf{x}_k) + J_F(\mathbf{x}_k) \Delta \mathbf{x} = \mathbf{0}$.
    2. *Fórmula de Inversión Analítica 2×2*: $J^{-1} = \frac{1}{\det J} \begin{bmatrix} \partial_y f_2 & -\partial_y f_1 \\ -\partial_x f_2 & \partial_x f_1 \end{bmatrix}$.
    3. *Teorema de Convergencia de Kantorovich*: Si $\|J(\mathbf{x}_0)^{-1} F(\mathbf{x}_0)\| \le \alpha$ y $\|J(\mathbf{x}_0)^{-1}\| \cdot \operatorname{Lip}(J) \le \beta$ con $2\alpha\beta \le 1$, la convergencia está garantizada.
    4. *Criterio de Parada*: Parar cuando $\|F(\mathbf{x}_k)\| < \epsilon$ y $\|\Delta \mathbf{x}_k\| < \delta$.
- **Trace Generator & Controls**:
  - Target system: Circle $x^2 + y^2 - 4 = 0$ and hyperbola $x y - 1 = 0$ with exact root $(\approx 1.93, \approx 0.52)$.
  - Controls: `x0` (continuous, 0.5 to 3, default: 1.2), `y0` (continuous, 0.5 to 3, default: 2.0).
  - Trace steps: $k=0, 1, 2, 3, 4$, displaying curves of $f_1=0$ and $f_2=0$, active point $\mathbf{x}_k$, update arrow $\Delta \mathbf{x}$, and error metrics norm $\|F(\mathbf{x}_k)\|$.
  - Visualizer clipping prevention: `xDomain: [-0.5, 3.5]`, `yDomain: [-0.5, 3.5]`.

---

### Module 8: Central Limit Theorem (Empirical Convergence)
- **Branch**: Probabilidad y Estadística (`probability-statistics`)
- **Topic ID**: `probability.central-limit-theorem`
- **Module ID**: `central-limit-theorem`
- **Order**: 6
- **Level**: `advanced`
- **Viewport**: `CartesianCoordinateViewport` (`snapshot.kind = 'cartesian'`)
- **Directory**: `src/math/probability/central-limit-theorem/`
- **Files to Create**:
  1. `src/math/probability/central-limit-theorem/index.ts`
  2. `src/math/probability/central-limit-theorem/trace.ts`
  3. `src/math/probability/central-limit-theorem/steps.ts`
  4. `src/math/probability/central-limit-theorem/code.c`
  5. `src/math/probability/central-limit-theorem/code.py`
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Teorema del Límite Central (TLC)'
  - `summary`: 'Convergencia asintótica de promedios independientes a la normal estándar.'
  - `centralFormula`: 'Z_n = \\frac{\\bar X_n - \\mu}{\\sigma / \\sqrt{n}} \\xrightarrow{d} \\mathcal{N}(0, 1),\\quad n \\to \\infty'
  - `viewportLabel`: 'Distribución 2D'
  - `crossConnections`:
    - `{ targetId: 'probability.gaussian-distribution', relationship: 'Distribución límite normal como atractor universal' }`
    - `{ targetId: 'probability.expectation-variance', relationship: 'Ley de los grandes números y escala de varianza $\\sigma^2/n$' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$X_1, \dots, X_n \stackrel{\text{iid}}{\sim} (\mu, \sigma^2) \implies \lim_{n\to\infty} P\left(\frac{\sum_{i=1}^n X_i - n\mu}{\sigma\sqrt{n}} \le z\right) = \Phi(z) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^z e^{-u^2/2} du$$
  - **Hypotheses**:
    1. Secuencia de variables aleatorias $X_i$ independientes e idénticamente distribuidas (i.i.d.).
    2. Esperanza matemática finita $E[X_i] = \mu < \infty$.
    3. Varianza finita y estrictamente positiva $\operatorname{Var}(X_i) = \sigma^2 \in (0, \infty)$ (Condición de Lindeberg-Lévy).
  - **Invariant**:
    $E[\bar{X}_n] = \mu$ invariante para todo $n$; varianza $\operatorname{Var}(\bar{X}_n) = \frac{\sigma^2}{n}$ decrece monótonamente hacia 0.
  - **Convergence**:
    Teorema de Berry-Esseen: $\sup_{z} |F_n(z) - \Phi(z)| \le \frac{C \rho}{\sigma^3 \sqrt{n}}$, donde $\rho = E[|X-\mu|^3]$ es el tercer momento absoluto.
  - **Edge Cases**:
    - Distribuciones con colas pesadas o varianza infinita (ej. Cauchy, Lévy) convergen a leyes estables alfa, no a la normal.
    - Asimetría marcada (distribución exponencial o Bernoulli sesgada) requiere mayor $n$ para aproximar la simetría normal.
  - **Algebraic Foundations**:
    1. *Función Característica y Límite*: $\varphi_{Z_n}(t) = \left[\varphi\left(\frac{t}{\sigma\sqrt{n}}\right)\right]^n \to e^{-t^2/2}$.
    2. *Desigualdad de Berry-Esseen*: Cota superior del error de aproximación en métrica de Kolmogorov.
    3. *Estandarización de la Media Muestral*: $Z_n = \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}}$.
    4. *Teorema de Continuidad de Lévy*: La convergencia puntual de funciones características implica convergencia en distribución.
- **Trace Generator & Controls**:
  - Controls: `sampleSize` (integer: $n \in [1, 30]$, default: 10), `distribution` (select: 'uniform', 'exponential', 'bernoulli').
  - Trace steps: $n=1$ (distribución base pura) $\to n=3$ (suavizado inicial) $\to n=10$ (campana reconocible) $\to n=30$ (coincidencia con $\mathcal{N}(0,1)$).
  - Visualizer: Normalized histogram bins via `snapshot.areaRectangles` with theoretical standard normal bell curve $\phi(z)$ overlaid via `snapshot.curves`.
  - Clipping prevention: `xDomain: [-3.5, 3.5]`, `yDomain: [0, 0.48]`.

---

### Module 9: Binomial and Poisson Distributions
- **Branch**: Probabilidad y Estadística (`probability-statistics`)
- **Topic ID**: `probability.binomial-poisson`
- **Module ID**: `binomial-poisson`
- **Order**: 7
- **Level**: `intermediate`
- **Viewport**: `CartesianCoordinateViewport` (`snapshot.kind = 'cartesian'`)
- **Directory**: `src/math/probability/binomial-poisson/`
- **Files to Create**:
  1. `src/math/probability/binomial-poisson/index.ts`
  2. `src/math/probability/binomial-poisson/trace.ts`
  3. `src/math/probability/binomial-poisson/steps.ts`
  4. `src/math/probability/binomial-poisson/code.c`
  5. `src/math/probability/binomial-poisson/code.py`
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Distribuciones Binomial y Poisson'
  - `summary`: 'Ley de eventos raros: aproximación $B(n, p) \\to \\operatorname{Pois}(\\lambda)$ con $\\lambda = np$.'
  - `centralFormula`: 'P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k} \\xrightarrow{n\\to\\infty,\\,np=\\lambda} \\frac{\\lambda^k e^{-\\lambda}}{k!}'
  - `viewportLabel`: 'Distribución 2D'
  - `crossConnections`:
    - `{ targetId: 'discrete.combinatorics', relationship: 'Coeficientes binomiales $\\binom{n}{k}$ y álgebra factorial' }`
    - `{ targetId: 'probability.random-variables', relationship: 'Funciones de masa de probabilidad discretas (PMF)' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$\lim_{\substack{n\to\infty \\ p \to 0 \\ np = \lambda}} \binom{n}{k} p^k (1-p)^{n-k} = \frac{\lambda^k e^{-\lambda}}{k!},\quad k \in \{0, 1, 2, \dots\}$$
  - **Hypotheses**:
    1. Ensayos de Bernoulli independientes con probabilidad idéntica $p \in (0, 1)$ en $n$ repeticiones.
    2. Tasa esperada constante $\lambda = n p > 0$ en el límite asintótico con $n \to \infty$ y $p \to 0$.
    3. Espacio muestral discreto no negativo $k \in \mathbb{N}_0$.
  - **Invariant**:
    Normalización de masa de probabilidad $\sum_{k=0}^n P(X=k) = 1$; para Poisson, media y varianza son exactamente iguales: $E[Y] = \operatorname{Var}(Y) = \lambda$.
  - **Convergence**:
    Teorema de Le Cam: $\sum_{k=0}^\infty |P_{\text{bin}}(k) - P_{\text{pois}}(k)| \le 2 n p^2 = \frac{2\lambda^2}{n} \to 0$.
  - **Edge Cases**:
    - Si $p$ no es pequeño (ej. $p \approx 0.5$), la distribución binomial aproxima mejor a una Gaussiana que a una Poisson.
    - Valores grandes de $k$ requieren cálculo mediante log-factoriales $\ln(k!)$ para prevenir overflow.
  - **Algebraic Foundations**:
    1. *Función Generadora de Probabilidad Binomial*: $G_X(s) = (1 - p + ps)^n \to e^{\lambda(s-1)} = G_Y(s)$.
    2. *Recurrencia de Poisson*: $P(Y = k) = \frac{\lambda}{k} P(Y = k - 1),\quad P(Y=0) = e^{-\lambda}$.
    3. *Cota de Le Cam en Distancia de Variación Total*: $d_{TV}(\operatorname{Bin}(n, p), \operatorname{Pois}(\lambda)) \le n p^2$.
    4. *Aproximación de Stirling*: $n! \approx \sqrt{2\pi n}\left(\frac{n}{e}\right)^n$.
- **Trace Generator & Controls**:
  - Controls: `lambda` (continuous, 1 to 8, default: 3.5), `n` (integer: 10 to 100, default: 20, with $p = \lambda/n$).
  - Trace steps: Compare Binomial PMF bars side-by-side with Poisson discrete points, varying $n$ from 10 to 100 to show convergence.
  - Visualizer clipping prevention: `xDomain: [0, Math.max(12, lambda * 3)]`, `yDomain: [0, 0.35]`.

---

### Module 10: Modular Arithmetic & Extended Euclidean Algorithm / Bézout's Identity
- **Branch**: Matemática Discreta (`discrete-mathematics`)
- **Topic ID**: `discrete.modular-euclid-bezout`
- **Module ID**: `modular-euclid-bezout`
- **Order**: 6
- **Level**: `intermediate`
- **Viewport**: `FormulaWalkthroughViewport` (`snapshot.kind = 'formula-walkthrough'`)
- **Directory**: `src/math/discrete/modular-euclid-bezout/`
- **Files to Create**:
  1. `src/math/discrete/modular-euclid-bezout/index.ts`
  2. `src/math/discrete/modular-euclid-bezout/trace.ts`
  3. `src/math/discrete/modular-euclid-bezout/steps.ts`
  4. `src/math/discrete/modular-euclid-bezout/code.c`
  5. `src/math/discrete/modular-euclid-bezout/code.py`
- **Curriculum Registration (`curriculum.ts`)**:
  - `title`: 'Aritmética Modular y Euclides Extendido'
  - `summary`: 'Identidad de Bézout $a x + b y = \\gcd(a, b)$ e inversos multiplicativos modulares.'
  - `centralFormula`: 'a \\cdot x + b \\cdot y = \\gcd(a, b) = d,\\quad a \\equiv r \\pmod m'
  - `viewportLabel`: 'Paso a Paso Formal'
  - `crossConnections`:
    - `{ targetId: 'discrete.induction-recurrence', relationship: 'Inducción de divisiones sucesivas y descenso finito' }`
    - `{ targetId: 'discrete.sets-relations', relationship: 'Relación de congruencia como partición en clases de equivalencia $\\mathbb{Z}/m\\mathbb{Z}$' }`
- **KaTeX Technical Sheet**:
  - **Definition**:
    $$\forall a, b \in \mathbb{Z}^+,\;\exists x, y \in \mathbb{Z} : a \cdot x + b \cdot y = \gcd(a, b)$$
  - **Hypotheses**:
    1. Enteros positivos $a, b \in \mathbb{Z}^+$ con $a \ge b > 0$.
    2. Algoritmo de la división: $r_{i-1} = q_i r_i + r_{i+1}$ con $0 \le r_{i+1} < r_i$.
    3. Término de parada: primer resto nulo $r_{k+1} = 0 \implies \gcd(a, b) = r_k$.
  - **Invariant**:
    En cada paso $i$, $\gcd(r_{i-1}, r_i) = \gcd(r_i, r_{i+1})$ y $r_i = a x_i + b y_i$ para coeficientes enteros $(x_i, y_i)$.
  - **Convergence**:
    Teorema de Lamé: El número de divisiones euclidianas requeridas es como máximo $5 \log_{10}(\min(a, b))$; complejidad logarítmica $\mathcal{O}(\log(\min(a, b)))$.
  - **Edge Cases**:
    - Si $\gcd(a, m) = 1$, el inverso multiplicativo $a^{-1} \pmod m$ existe y es único; si $\gcd(a, m) > 1$, el inverso no existe (divisor de cero).
    - Números coprimos generan $\gcd(a, b) = 1$.
  - **Algebraic Foundations**:
    1. *Lema de Euclides*: Si $d \mid a$ y $d \mid b$, entonces $d \mid (a - q b)$ para todo $q \in \mathbb{Z}$.
    2. *Recurrencia de los Coeficientes de Bézout*: $x_{i+1} = x_{i-1} - q_i x_i,\quad y_{i+1} = y_{i-1} - q_i y_i$.
    3. *Inverso Multiplicativo Modular*: $a x \equiv 1 \pmod m \iff a x + m y = 1$.
    4. *Teorema Chino del Resto (CRT)*: Isomorfismo de anillos $\mathbb{Z}/(m n)\mathbb{Z} \cong \mathbb{Z}/m\mathbb{Z} \times \mathbb{Z}/n\mathbb{Z}$ cuando $\gcd(m, n) = 1$.
- **Trace Generator & Controls**:
  - Controls: `a` (integer: 2 to 300, default: 240), `b` (integer: 2 to 300, default: 46).
  - Snapshot: `FormulaWalkthroughSnapshot` with interactive table:
    - Headers: `['Paso i', 'Dividendo', 'Divisor', 'Cociente q_i', 'Resto r_i', 'x_i', 'y_i']`.
    - Rows showing the exact forward Euclidean divisions and backward substitution.
  - Trace steps: Forward divisions $\to$ Identification of GCD as last non-zero remainder $\to$ Backward substitution $\to$ Final Bézout identity verification $a x + b y = d$.

---

### UI Registration Matrix & Updates Summary

| File | Change Required |
|---|---|
| `src/math/curriculum.ts` | Append all 10 `MathTopic` seeds with `cluster`, sequential `order`, `centralFormula`, `crossConnections`. |
| `src/MathNotebookApp.tsx` | Add the 10 topic IDs to `MATH_CLUSTER_SPEC` under their respective category. |
| `src/components/math/MathNotebookView.tsx` | Import and add 10 new modules to `const MODULES`. Update any hardcoded "4 clusters" string to "6 clusters". |
| `src/components/math/MathNotebooksView.tsx` | Add `'geometry-vectorial'` and `'optimization-numerical'` to `CLUSTERS` so all 6 clusters are displayed. |
| `src/math/index.ts` | Re-export all 10 new module directories. |
| `src/core/math-types.ts` | Add `SvdSnapshot`, `GramSchmidtSnapshot`, and `AffineTransformationSnapshot` to `MathSnapshot` (if dedicated viewports are used). |

---

## 5. Verification Method

To independently verify the implementation when the implementation agents execute this blueprint:

1. **Static Analysis & Linting**:
   ```bash
   npm run lint
   ```
   *Expected outcome*: 0 warnings, 0 errors reported by `oxlint` across all files.

2. **Strict TypeScript Compilation**:
   ```bash
   npx tsc -b
   ```
   *Expected outcome*: Exit code 0, no diagnostic errors, zero `any` types.

3. **Production Build & PWA Generation**:
   ```bash
   npm run build
   ```
   *Expected outcome*: Successful Vite bundle creation in `dist/` and clean service worker generation in `dist/sw.js`.

4. **Interactive UI Verification**:
   - Navigate to each of the 10 new topics in `MathSideNav`.
   - Verify playback scrubber runs through all steps smoothly.
   - Click "Ficha Técnica" on each module and verify the floating modal opens with all 6 tabs populated.
   - Verify all KaTeX formulas render without horizontal clipping or scroll leakage.
   - Open the "Currículum DAG" tab and verify the new nodes and cross-connection edges are displayed cleanly.
