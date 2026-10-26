import { useState, useMemo, useCallback, memo } from 'react';
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

import {
  DEFAULT_SORTING_ARRAY,
  getDefaultInput,
  CATALOG_GROUPS,
  NAV_TABS,
  HEADER_BRAND,
  FALLBACK_TRACE_FRAME,
  type NavTab,
} from './config/catalogData';

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
      return FALLBACK_TRACE_FRAME;
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
          className={`flex-1 flex flex-col overflow-y-auto ${
            activeTab === 'visualizer' ? 'pb-24' : 'pb-6'
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
