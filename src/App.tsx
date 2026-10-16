import { useState, useMemo, useCallback, memo } from 'react';
import { BookOpen } from 'lucide-react';
import {
  UnifiedNotebookHeader,
  SideNavBar,
  StudyCanvas,
  CodeNotebookCard,
  CallStackWidget,
  AlgorithmTechnicalSheet,
  AlgorithmTechnicalSheetModal,
  RulerControlBar,
  ReloadPrompt,
  CurriculumView,
  NotebooksView,
  ComplexityLabView,
  type CatalogGroup,
  type NavTabItem,
} from './components';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  getAlgorithmById,
  ALGORITHM_REGISTRY,
} from './algorithms';
import {
  usePlayback,
  type SupportedLang,
  type PlaybackSpeed,
  type TraceFrame,
} from './core';

/**
 * Arreglos numéricos iniciales por defecto según categoría
 */
const DEFAULT_SORTING_ARRAY: number[] = [12, 25, 42, 18, 56, 34, 68, 88];
const DEFAULT_BST_KEYS: number[] = [15, 8, 23, 4, 11, 19, 30];
const DEFAULT_LINKED_LIST: number[] = [12, 25, 42, 68, 88];
const DEFAULT_CYCLE_ARRAY: number[] = [10, 25, 38, 47, 62, 75];
const DEFAULT_QUEUE_ARRAY: number[] = [10, 25, 42, 68];
const DEFAULT_KADANE_ARRAY: number[] = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
const DEFAULT_PQ_KEYS: number[] = [38, 20, 15, 42, 10, 8, 25];
const DEFAULT_AVL_KEYS: number[] = [30, 20, 10, 25, 40, 50, 22];
const DEFAULT_COINS_ARRAY: number[] = [1, 2, 5, 10];

function getDefaultInput(category: string, id: string): number[] {
  if (id === 'kadane' || id === 'kadane-dp') return [...DEFAULT_KADANE_ARRAY];
  if (id === 'priority-queue' || id === 'min-max-heap') return [...DEFAULT_PQ_KEYS];
  if (id === 'avl-tree' || id === 'avl') return [...DEFAULT_AVL_KEYS];
  if (category === 'trees') return [...DEFAULT_BST_KEYS];
  if (id === 'cycle-detection') return [...DEFAULT_CYCLE_ARRAY];
  if (id === 'queue-operations') return [...DEFAULT_QUEUE_ARRAY];
  if (id === 'coin-change-dp') return [...DEFAULT_COINS_ARRAY];
  if (category === 'pointers') return [...DEFAULT_LINKED_LIST];
  return [...DEFAULT_SORTING_ARRAY];
}

type NavTab = 'visualizer' | 'curriculum' | 'notebooks' | 'complexity-lab';

const CATALOG_GROUPS: CatalogGroup[] = [
  {
    category: 'Ordenamiento',
    items: [
      { id: 'bubble-sort', name: 'Bubble Sort', subtitle: 'O(N²)' },
      { id: 'insertion-sort', name: 'Insertion Sort', subtitle: 'O(N²)' },
      { id: 'selection-sort', name: 'Selection Sort', subtitle: 'O(N²)' },
      { id: 'quick-sort', name: 'QuickSort (Lomuto)', subtitle: 'O(N log N)' },
      { id: 'merge-sort', name: 'Merge Sort', subtitle: 'O(N log N)' },
    ],
  },
  {
    category: 'Búsqueda Logarítmica',
    items: [
      { id: 'linear-binary-search', name: 'Búsqueda Lineal vs Binaria', subtitle: 'O(N) vs O(log N)' },
      { id: 'binary-search', name: 'Búsqueda Binaria', subtitle: 'O(log N)' },
    ],
  },
  {
    category: 'Árboles y Montículos',
    items: [
      { id: 'bst-insertion', name: 'BST: Inserción Jerárquica', subtitle: 'O(H)' },
      { id: 'inorder-traversal', name: 'Recorrido Inorder (Árbol)', subtitle: 'O(N)' },
      { id: 'preorder-traversal', name: 'Recorrido Preorder (Árbol)', subtitle: 'O(N)' },
      { id: 'min-heap', name: 'Min-Heap (Montículo)', subtitle: 'O(log N)' },
      { id: 'priority-queue', name: 'Cola de Prioridad (Min-Heap)', subtitle: 'O(log N)' },
      { id: 'avl-tree', name: 'Árbol AVL (Rotaciones)', subtitle: 'O(log N)' },
    ],
  },
  {
    category: 'Grafos y Rutas',
    items: [
      { id: 'bfs-graph', name: 'BFS: Recorrido en Anchura', subtitle: 'O(V + E)' },
      { id: 'dfs-graph', name: 'DFS: Recorrido en Profundidad', subtitle: 'O(V + E)' },
      { id: 'dijkstra-graph', name: 'Dijkstra: Camino Mínimo', subtitle: 'O((V+E) log V)' },
      { id: 'kruskal-graph', name: 'Kruskal: Árbol Mínimo (MST)', subtitle: 'O(E log E)' },
      { id: 'topological-sort', name: 'Ordenamiento Topológico (Kahn)', subtitle: 'O(V + E)' },
      { id: 'bellman-ford', name: 'Bellman-Ford: Rutas Negativas', subtitle: 'O(V · E)' },
      { id: 'strongly-connected-components', name: 'Componentes Fuertemente Conexas', subtitle: 'O(V + E)' },
    ],
  },
  {
    category: 'Programación Dinámica',
    items: [
      { id: 'kadane', name: 'Algoritmo de Kadane (Subsuma)', subtitle: 'O(N)' },
      { id: 'knapsack-dp', name: 'Mochila 0/1 (Knapsack DP)', subtitle: 'O(N · W)' },
      { id: 'lcs-dp', name: 'LCS: Subsecuencia Común (2D DP)', subtitle: 'O(M · N)' },
      { id: 'levenshtein-distance', name: 'Distancia de Levenshtein (2D DP)', subtitle: 'O(M · N)' },
      { id: 'coin-change-dp', name: 'Cambio de Monedas (DP)', subtitle: 'O(A · C)' },
    ],
  },
  {
    category: 'Punteros y Memoria',
    items: [
      { id: 'reverse-linked-list', name: 'Lista Enlazada: Invertir', subtitle: 'O(N)' },
      { id: 'cycle-detection', name: 'Detección de Ciclos (Floyd)', subtitle: 'O(N)' },
      { id: 'stack-operations', name: 'Pila LIFO: Operaciones y Memoria', subtitle: 'O(1)' },
      { id: 'queue-operations', name: 'Cola FIFO: Operaciones y Memoria', subtitle: 'O(1)' },
      { id: 'insert-linked-list', name: 'Lista Enlazada: Insertar al Final', subtitle: 'O(N)' },
    ],
  },
];

const NAV_TABS: NavTabItem[] = [
  { id: 'visualizer', label: 'Visualizador' },
  { id: 'curriculum', label: 'Currículum DSA' },
  { id: 'notebooks', label: 'Cuadernos' },
  { id: 'complexity-lab', label: 'Lab Complejidad' },
];

const HEADER_BRAND = {
  name: 'AlgoNotebook',
  icon: BookOpen,
  archivalStamp: 'Laboratorio de Algoritmos DSA',
};

const MemoizedUnifiedNotebookHeader = memo(UnifiedNotebookHeader);
const MemoizedSideNavBar = memo(SideNavBar);
const MemoizedAlgorithmTechnicalSheet = memo(AlgorithmTechnicalSheet);
const MemoizedAlgorithmTechnicalSheetModal = memo(AlgorithmTechnicalSheetModal);
const MemoizedCallStackWidget = memo(CallStackWidget);
const MemoizedCodeNotebookCard = memo(CodeNotebookCard);
const MemoizedCurriculumView = memo(CurriculumView);
const MemoizedNotebooksView = memo(NotebooksView);
const MemoizedComplexityLabView = memo(ComplexityLabView);

function App() {
  // Pestaña de navegación activa en el espacio de trabajo principal
  const [activeTab, setActiveTab] = useState<NavTab>('visualizer');
  // Estado para la ventana flotante de la Ficha Técnica
  const [isTechSheetOpen, setIsTechSheetOpen] = useState<boolean>(false);
  // Estado del arreglo numérico sobre el que se genera la traza
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('bubble-sort');
  const [rawArray, setRawArray] = useState<number[]>(DEFAULT_SORTING_ARRAY);
  const [isStudyMode, setIsStudyMode] = useState<boolean>(false);
  const [activeLang, setActiveLang] = useState<SupportedLang>('python');

  // Módulo de algoritmo activo seleccionado desde el catálogo unificado
  const currentAlgorithm = useMemo(() => {
    return getAlgorithmById(selectedAlgorithm);
  }, [selectedAlgorithm]);

  // Generación reactiva e inmutable de la traza algorítmica completa
  const frames = useMemo<TraceFrame[]>(() => {
    return currentAlgorithm.generateTrace(rawArray);
  }, [currentAlgorithm, rawArray]);

  // Paso inicial para arranque interactivo siempre en el paso 1
  const initialStep = 1;

  // Motor centralizado de reproducción reactivo
  const {
    currentStepIndex,
    isPlaying,
    speed,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
  } = usePlayback({
    totalSteps: frames.length,
    initialStep,
    initialSpeed: 1.0,
  });

  // Fotograma activo sincronizado estrictamente con el motor de reproducción
  const currentFrame = useMemo<TraceFrame>(() => {
    if (frames.length === 0) {
      return {
        stepIndex: 1,
        totalSteps: 1,
        highlightLines: { python: [], c: [] },
        arrayState: [],
        elementStates: {},
        pointers: {},
        activeAction: 'idle',
        explanation: {
          stepLabel: 'Step 1 of 1:',
          text: 'Arreglo vacío o no inicializado.',
        },
        metrics: {
          comparisons: 0,
          swaps: 0,
          passNumber: 0,
          totalPasses: 0,
          maxComparisons: 0,
        },
      };
    }
    return frames[currentStepIndex - 1] ?? frames[0];
  }, [frames, currentStepIndex]);

  // Manejador: Reiniciar datos al arreglo por defecto
  const handleResetData = useCallback(() => {
    setRawArray(
      getDefaultInput(currentAlgorithm.metadata.category, currentAlgorithm.metadata.id)
    );
    reset();
  }, [currentAlgorithm.metadata.category, currentAlgorithm.metadata.id, reset]);

  // Manejador: Selección de algoritmo desde el Navbar / catálogo
  const handleSelectAlgorithm = useCallback((algoId: string) => {
    if (ALGORITHM_REGISTRY[algoId]) {
      const targetAlgo = ALGORITHM_REGISTRY[algoId];
      setSelectedAlgorithm(algoId);
      setRawArray(
        getDefaultInput(targetAlgo.metadata.category, targetAlgo.metadata.id)
      );
      reset();
    } else {
      window.alert(
        `Módulo pedagógico de ${algoId.toUpperCase()} en preparación.`
      );
    }
  }, [reset]);

  const handleSelectAndGoToVisualizer = useCallback((algoId: string) => {
    handleSelectAlgorithm(algoId);
    setActiveTab('visualizer');
  }, [handleSelectAlgorithm]);

  const handleSelectTab = useCallback((tab: string) => {
    setActiveTab(tab as NavTab);
  }, []);

  const handleToggleStudyMode = useCallback(() => {
    setIsStudyMode((prev) => !prev);
  }, []);

  const handleOpenTechnicalSheet = useCallback(() => {
    setIsTechSheetOpen(true);
  }, []);

  const handleCloseTechnicalSheet = useCallback(() => {
    setIsTechSheetOpen(false);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed as PlaybackSpeed);
  }, [setSpeed]);

  const handleToggleLang = useCallback(() => {
    setActiveLang((prev) => (prev === 'python' ? 'c' : 'python'));
  }, []);

  const handleSelectLang = useCallback((lang: SupportedLang) => {
    setActiveLang(lang);
  }, []);

  // Atajos de teclado globales del laboratorio (Space, Arrows, R, 1, 2, 3, L, T)
  useKeyboardShortcuts({
    onTogglePlay: togglePlay,
    onStepForward: stepForward,
    onStepBackward: stepBackward,
    onReset: handleResetData,
    onSetSpeed: handleSpeedChange,
    onToggleLang: handleToggleLang,
    onToggleTechnicalSheet: handleOpenTechnicalSheet,
  });

  const isDynamicInputSupported =
    currentAlgorithm.metadata.category === 'sorting' ||
    currentAlgorithm.metadata.category === 'trees' ||
    currentAlgorithm.metadata.category === 'pointers';

  const handleApplyCustomInput = useCallback(
    (values: number[]) => {
      setRawArray([...values]);
      reset();
    },
    [reset]
  );

  return (
    <div className="bg-paper-base text-ink-primary font-body-md min-h-screen flex flex-col selection:bg-highlighter-compare selection:text-ink-primary">
      {/* 1. Header unificado con selector por categorías, bookmarks y navegación */}
      <MemoizedUnifiedNotebookHeader
        currentNotebookId="algonotebook"
        brand={HEADER_BRAND}
        catalogGroups={CATALOG_GROUPS}
        selectedItemId={selectedAlgorithm}
        onSelectItem={handleSelectAndGoToVisualizer}
        bookmarkStorageKey="algonotebook_bookmarks"
        navTabs={NAV_TABS}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isStudyMode={isStudyMode}
        onToggleStudyMode={handleToggleStudyMode}
        onReset={handleResetData}
        resetLabel="Reiniciar Datos"
      />

      {/* 2. Contenedor de escritorio principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Barra lateral de navegación con categorías agrupadas (oculta en Study Mode) */}
        {!isStudyMode && (
          <MemoizedSideNavBar
            selectedAlgorithm={selectedAlgorithm}
            onSelectAlgorithm={handleSelectAndGoToVisualizer}
          />
        )}

        <main
          className={`flex-1 flex flex-col overflow-y-auto lg:overflow-hidden ${
            activeTab === 'visualizer' ? 'pb-20' : 'pb-6'
          }`}
        >
          {/* Pestaña: Visualizador Interactivo */}
          {activeTab === 'visualizer' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-space-md p-space-md min-h-0">
              {/* Visualizador interactivo */}
              <StudyCanvas
                frame={currentFrame}
                metadata={currentAlgorithm.metadata}
                currentValues={rawArray}
                onApplyInput={isDynamicInputSupported ? handleApplyCustomInput : undefined}
                onOpenTechnicalSheet={handleOpenTechnicalSheet}
                isPlaying={isPlaying}
                playbackSpeed={speed}
              />

              {/* Panel lateral derecho: Botón Ficha Técnica + Código fuente + Pila de llamadas */}
              <div className="lg:col-span-4 flex flex-col gap-3.5 overflow-y-auto">
                {/* Botón táctil para desplegar la Ficha Técnica Flotante */}
                <MemoizedAlgorithmTechnicalSheet
                  sheet={currentAlgorithm.technicalSheet}
                  onClick={handleOpenTechnicalSheet}
                  className="w-full shrink-0"
                />

                <MemoizedCodeNotebookCard
                  activeLang={activeLang}
                  onSelectLang={handleSelectLang}
                  frame={currentFrame}
                  sourceCode={currentAlgorithm.code}
                  className="w-full"
                />

                {/* Widget de pila de llamadas (Call Stack) */}
                <MemoizedCallStackWidget
                  callStack={currentFrame.callStack}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Pestaña: Currículum Académico */}
          {activeTab === 'curriculum' && (
            <div className="flex-1 p-space-md min-h-0 overflow-y-auto">
              <MemoizedCurriculumView
                selectedAlgorithm={selectedAlgorithm}
                onSelectAlgorithm={handleSelectAndGoToVisualizer}
              />
            </div>
          )}

          {/* Pestaña: Biblioteca de Cuadernos Técnicos */}
          {activeTab === 'notebooks' && (
            <div className="flex-1 p-space-md min-h-0 overflow-y-auto">
              <MemoizedNotebooksView
                onSelectAlgorithm={handleSelectAndGoToVisualizer}
              />
            </div>
          )}

          {/* Pestaña: Laboratorio Comparativo Big-O */}
          {activeTab === 'complexity-lab' && (
            <div className="flex-1 p-space-md min-h-0 overflow-y-auto">
              <MemoizedComplexityLabView
                onSelectAlgorithm={handleSelectAndGoToVisualizer}
              />
            </div>
          )}
        </main>
      </div>

      {/* 3. Barra de control calibrada estilo Regla de Cálculo (solo en pestaña Visualizador) */}
      {activeTab === 'visualizer' && (
        <RulerControlBar
          frame={currentFrame}
          isPlaying={isPlaying}
          playbackSpeed={speed}
          onPlayPause={togglePlay}
          onStepBack={stepBackward}
          onStepForward={stepForward}
          onScrub={goToStep}
          onSpeedChange={handleSpeedChange}
        />
      )}

      {/* 4. Notificación táctil PWA de estado offline y actualización */}
      <ReloadPrompt />

      {/* 5. Ventana Flotante de Ficha Técnica y Fundamentos Teóricos */}
      <MemoizedAlgorithmTechnicalSheetModal
        isOpen={isTechSheetOpen}
        onClose={handleCloseTechnicalSheet}
        sheet={currentAlgorithm.technicalSheet}
        metadata={currentAlgorithm.metadata}
      />
    </div>
  );
}

export default App;
