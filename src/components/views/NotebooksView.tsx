import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Search,
  Play,
  Copy,
  Check,
  Filter,
  HelpCircle,
  StickyNote,
  AlertTriangle,
  ListOrdered,
  Sparkles,
  LayoutGrid,
  List,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { AVAILABLE_ALGORITHMS } from '../../algorithms';

export interface NotebooksViewProps {
  onSelectAlgorithm: (id: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'sorting', label: 'Ordenamiento' },
  { id: 'search', label: 'Búsqueda' },
  { id: 'trees', label: 'Árboles' },
  { id: 'graphs', label: 'Grafos' },
  { id: 'dp', label: 'Prog. Dinámica' },
  { id: 'pointers', label: 'Punteros' },
];

import { ALGORITHM_FLASH_QUIZZES } from '../../data/flashQuizzesData';

export const NotebooksView: React.FC<NotebooksViewProps> = ({ onSelectAlgorithm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [codeLangMap, setCodeLangMap] = useState<Record<string, 'python' | 'c'>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>(() => {
    try {
      const saved = localStorage.getItem('algonotebook_view_mode');
      return saved === 'detailed' ? 'detailed' : 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleSetViewMode = (mode: 'grid' | 'detailed') => {
    setViewMode(mode);
    try {
      localStorage.setItem('algonotebook_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // Estados de paneles desplegables por algoritmo
  const [activeTabPerAlgo, setActiveTabPerAlgo] = useState<
    Record<string, 'code' | 'notes' | 'quiz' | 'mechanism'>
  >({});
  const [revealedQuizAnswers, setRevealedQuizAnswers] = useState<Record<string, boolean>>({});

  // Notas personales de estudio persistidas en localStorage
  const [userNotes, setUserNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('algonotebook_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [savedNoteStatus, setSavedNoteStatus] = useState<Record<string, boolean>>({});
  const noticeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = noticeTimersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // Guardar notas en localStorage
  const handleUpdateNote = (algoId: string, text: string) => {
    setUserNotes((prev) => {
      const updated = { ...prev, [algoId]: text };
      try {
        localStorage.setItem('algonotebook_notes', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setSavedNoteStatus((prev) => ({ ...prev, [algoId]: true }));
    noticeTimersRef.current.push(setTimeout(() => {
      setSavedNoteStatus((prev) => ({ ...prev, [algoId]: false }));
    }, 1500));
  };

  const isAlgoInCategory = (algo: (typeof AVAILABLE_ALGORITHMS)[number], catId: string): boolean => {
    if (catId === 'all') return true;
    if (catId === 'search') return algo.metadata.id.includes('search');
    if (catId === 'pointers') return algo.metadata.category === 'pointers' && !algo.metadata.id.includes('search');
    return algo.metadata.category === catId;
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: AVAILABLE_ALGORITHMS.length,
    };
    for (const cat of CATEGORIES) {
      if (cat.id === 'all') continue;
      counts[cat.id] = AVAILABLE_ALGORITHMS.filter((algo) => isAlgoInCategory(algo, cat.id)).length;
    }
    return counts;
  }, []);

  const filteredAlgorithms = useMemo(() => {
    return AVAILABLE_ALGORITHMS.filter((algo) => {
      const matchesCategory = isAlgoInCategory(algo, selectedCategory);

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        algo.metadata.name.toLowerCase().includes(q) ||
        algo.metadata.id.toLowerCase().includes(q) ||
        algo.metadata.description.toLowerCase().includes(q) ||
        (algo.technicalSheet?.objective && algo.technicalSheet.objective.toLowerCase().includes(q)) ||
        (algo.technicalSheet?.analogy && algo.technicalSheet.analogy.toLowerCase().includes(q)) ||
        algo.metadata.timeComplexity.worst.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopyCode = (algoId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(algoId);
    noticeTimersRef.current.push(setTimeout(() => setCopiedCodeId(null), 2000));
  };

  const getLangForAlgo = (algoId: string): 'python' | 'c' => {
    return codeLangMap[algoId] || 'python';
  };

  const setLangForAlgo = (algoId: string, lang: 'python' | 'c') => {
    setCodeLangMap((prev) => ({ ...prev, [algoId]: lang }));
  };

  const getActiveTab = (algoId: string): 'code' | 'notes' | 'quiz' | 'mechanism' => {
    return activeTabPerAlgo[algoId] || 'code';
  };

  const setActiveTab = (algoId: string, tab: 'code' | 'notes' | 'quiz' | 'mechanism') => {
    setActiveTabPerAlgo((prev) => ({ ...prev, [algoId]: tab }));
  };

  const toggleRevealAnswer = (algoId: string) => {
    setRevealedQuizAnswers((prev) => ({ ...prev, [algoId]: !prev[algoId] }));
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-paper-base p-4 lg:p-6 select-none">
      {/* Cabecera del Archivo de Cuadernos */}
      <div className="bg-paper-surface border border-paper-border rounded-lg p-5 shadow-tactile-card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-surface-container border border-paper-border text-ink-primary shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-extrabold text-lg text-ink-primary tracking-tight">
                  Cuadernos de Estudio — Archivo Técnico de Algoritmos
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Interactivo & Apuntes
                </span>
              </div>
              <p className="font-mono text-xs text-ink-secondary mt-0.5">
                Especificaciones formales, desafíos conceptuales, invariantes matemáticos y notas del estudiante
              </p>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, Big-O o invariante..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-paper-surface border border-paper-border rounded-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-ink-primary/30"
            />
          </div>
        </div>

        {/* Filtros de Categoría y Selector de Vista */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-4 mt-4 border-t border-paper-border">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[11px] font-bold text-ink-secondary flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              Filtrar:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-ink-primary text-paper-surface font-bold shadow-xs'
                    : 'bg-surface-container-low border border-paper-border text-ink-secondary hover:text-ink-primary hover:bg-surface-container'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCategory === cat.id
                      ? 'bg-paper-surface/20 text-paper-surface'
                      : 'bg-surface-container border border-paper-border text-ink-muted'
                  }`}
                >
                  {categoryCounts[cat.id] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="font-mono text-[10px] text-ink-muted hidden sm:inline">
              {filteredAlgorithms.length} de {AVAILABLE_ALGORITHMS.length} temas
            </span>
            <div className="flex items-center gap-1 bg-surface-container-low border border-paper-border rounded-lg p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                  viewMode === 'grid'
                    ? 'bg-paper-surface text-ink-primary font-bold shadow-xs border border-paper-border'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
                title="Vista en Cuadrícula Compacta"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Cuadrícula</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('detailed')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                  viewMode === 'detailed'
                    ? 'bg-paper-surface text-ink-primary font-bold shadow-xs border border-paper-border'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
                title="Vista Dossier Detallado"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dossier</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido: Vacío, Cuadrícula o Dossier Detallado */}
      {filteredAlgorithms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-paper-border bg-paper-surface p-12 text-center">
          <p className="font-headline text-base font-bold text-ink-primary mb-1">
            No se encontraron algoritmos
          </p>
          <p className="font-mono text-xs text-ink-muted max-w-md mx-auto">
            Ningún cuaderno coincide con la búsqueda &quot;{searchQuery}&quot; en la categoría seleccionada.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-3.5 py-1.5 rounded bg-ink-primary text-paper-surface font-mono text-xs font-bold hover:bg-ink-primary/90 transition-all shadow-xs"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
          {filteredAlgorithms.map((algo) => {
            const noteText = userNotes[algo.metadata.id] || '';
            const quiz = ALGORITHM_FLASH_QUIZZES[algo.metadata.id];
            const paradigm = algo.technicalSheet?.properties?.paradigm;

            return (
              <div
                key={algo.metadata.id}
                className="bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card overflow-hidden flex flex-col justify-between transition-all hover:border-ink-primary/50 hover:shadow-tactile-hover group"
              >
                <div className="p-4 flex-1 flex flex-col">
                  {/* Etiqueta de Figura y Categoría */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container border border-paper-border text-ink-secondary uppercase">
                      {algo.metadata.figureId || 'LAB DSA'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] uppercase font-bold text-ink-muted px-1.5 py-0.5 rounded bg-surface-container-low border border-paper-border">
                        {algo.metadata.category}
                      </span>
                      {paradigm && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-semibold truncate max-w-[130px]">
                          {paradigm}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Título y Objetivo */}
                  <h3 className="font-headline font-bold text-base text-ink-primary mb-1">
                    {algo.metadata.name}
                  </h3>
                  <p className="text-xs text-ink-secondary leading-relaxed line-clamp-2 mb-3">
                    {algo.technicalSheet?.objective ?? algo.metadata.description}
                  </p>

                  {/* Metáfora / Analogía intuitiva */}
                  {algo.technicalSheet?.analogy && (
                    <div className="mb-3 p-2 rounded bg-[#FFFBEA] border border-[#FDE047] text-xs text-ink-primary flex items-start gap-1.5 shadow-xs">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug font-sans text-[11px] line-clamp-2">
                        {algo.technicalSheet.analogy}
                      </span>
                    </div>
                  )}

                  {/* Métricas de Complejidad */}
                  <div className="flex flex-wrap gap-1.5 mb-3 font-mono text-[10px]">
                    <span
                      className="px-2 py-0.5 rounded bg-surface-container-low border border-paper-border text-ink-primary font-bold"
                      title="Peor caso"
                    >
                      Peor: {algo.metadata.timeComplexity.worst}
                    </span>
                    {algo.metadata.timeComplexity.best && (
                      <span
                        className="px-2 py-0.5 rounded bg-surface-container-low border border-paper-border text-ink-secondary"
                        title="Mejor caso"
                      >
                        Mejor: {algo.metadata.timeComplexity.best}
                      </span>
                    )}
                    <span
                      className="px-2 py-0.5 rounded bg-surface-container-low border border-paper-border text-ink-secondary"
                      title="Espacio auxiliar"
                    >
                      Espacio: {algo.metadata.spaceComplexity}
                    </span>
                  </div>

                  {/* Invariante Formal */}
                  {algo.technicalSheet?.loopInvariant && (
                    <div className="mt-auto pt-2.5 border-t border-paper-border/60">
                      <span className="font-mono text-[9px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
                        INVARIANTE DE CICLO:
                      </span>
                      <p className="font-mono text-[10px] text-ink-secondary line-clamp-2 italic bg-surface-container-low/60 p-1.5 rounded border border-paper-border/40">
                        {algo.technicalSheet.loopInvariant}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pie de Tarjeta */}
                <div className="p-3 bg-surface-container-low border-t border-paper-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {noteText.trim() ? (
                      <span
                        className="font-mono text-[9px] px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 font-bold flex items-center gap-1"
                        title="Posee notas de estudio guardadas"
                      >
                        <StickyNote className="w-2.5 h-2.5 text-amber-600" />
                        Nota
                      </span>
                    ) : quiz ? (
                      <span
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-container border border-paper-border text-ink-muted flex items-center gap-1"
                        title="Contiene desafío conceptual"
                      >
                        <HelpCircle className="w-2.5 h-2.5 text-indigo-500" />
                        Quiz
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        handleSetViewMode('detailed');
                      }}
                      className="font-mono text-[10px] text-ink-secondary hover:text-ink-primary underline underline-offset-2 flex items-center gap-1 ml-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Dossier</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectAlgorithm(algo.metadata.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ink-primary text-paper-surface font-bold text-xs hover:bg-ink-primary/90 transition-all shadow-xs active:translate-y-0.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Abrir Laboratorio</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid de Cuadernos - Modo Dossier Detallado */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-8">
        {filteredAlgorithms.map((algo) => {
          const activeCodeLang = getLangForAlgo(algo.metadata.id);
          const codeSnippet = algo.code[activeCodeLang] || '';
          const activeTab = getActiveTab(algo.metadata.id);
          const quiz = ALGORITHM_FLASH_QUIZZES[algo.metadata.id] || {
            question: `¿Cuál es el caso crítico de complejidad temporal en ${algo.metadata.name}?`,
            answer: `El peor caso reportado es ${algo.metadata.timeComplexity.worst} y el espacio auxiliar es ${algo.metadata.spaceComplexity}.`,
            hint: 'Revisa la ficha técnica y la sección de invariantes formales.',
          };
          const noteText = userNotes[algo.metadata.id] || '';
          const isNoteSaved = savedNoteStatus[algo.metadata.id];
          const isAnswerRevealed = revealedQuizAnswers[algo.metadata.id];

          return (
            <div
              key={algo.metadata.id}
              className="bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card overflow-hidden flex flex-col justify-between"
            >
              {/* Encabezado del Cuaderno */}
              <div className="p-4 border-b border-paper-border bg-surface-container-low/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container border border-paper-border text-ink-secondary uppercase">
                    {algo.metadata.figureId || 'FICHA TÉCNICA'}
                  </span>
                  <span className="font-mono text-[10px] uppercase font-bold text-ink-muted">
                    {algo.metadata.category}
                  </span>
                </div>

                <h3 className="font-headline font-bold text-base text-ink-primary mb-1">
                  {algo.metadata.name}
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  {algo.technicalSheet?.objective ?? algo.metadata.description}
                </p>

                {/* Metáfora / Analogía intuitiva */}
                {algo.technicalSheet?.analogy && (
                  <div className="mt-2.5 p-2.5 rounded bg-[#FFFBEA] border border-[#FDE047] text-xs text-ink-primary flex items-start gap-2 shadow-xs">
                    <span className="text-xs select-none">💡</span>
                    <span className="leading-snug font-sans">{algo.technicalSheet.analogy}</span>
                  </div>
                )}

                {/* Métricas de Complejidad */}
                <div className="flex flex-wrap gap-2 mt-3 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-paper-surface border border-paper-border text-ink-primary font-bold">
                    Peor: {algo.metadata.timeComplexity.worst}
                  </span>
                  {algo.metadata.timeComplexity.best && (
                    <span className="px-2 py-0.5 rounded bg-paper-surface border border-paper-border text-ink-secondary">
                      Mejor: {algo.metadata.timeComplexity.best}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-paper-surface border border-paper-border text-ink-secondary">
                    Espacio: {algo.metadata.spaceComplexity}
                  </span>
                  {noteText.trim() && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 font-bold flex items-center gap-1">
                      <StickyNote className="w-2.5 h-2.5 text-amber-600" />
                      Tiene Apunte
                    </span>
                  )}
                </div>
              </div>

              {/* Invariante Formal */}
              <div className="p-4 bg-paper-surface border-b border-paper-border">
                <div className="bg-surface-container-low border-l-4 border-ink-primary p-3 rounded font-mono text-xs leading-relaxed text-ink-primary">
                  <span className="font-bold block text-[10px] text-ink-muted uppercase tracking-wider mb-1">
                    INVARIANTE DE CICLO / RECURSIÓN:
                  </span>
                  {algo.technicalSheet?.loopInvariant ?? 'Invariante bajo especificación de diseño formal.'}
                </div>
              </div>

              {/* Selector de Pestaña Interactiva del Cuaderno */}
              <div className="flex items-center border-b border-paper-border bg-surface-container px-3 pt-2 gap-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab(algo.metadata.id, 'code')}
                  className={`px-3 py-1.5 rounded-t font-bold transition-colors ${
                    activeTab === 'code'
                      ? 'bg-paper-surface text-ink-primary border-t border-l border-r border-paper-border'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Código Fuente
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(algo.metadata.id, 'notes')}
                  className={`px-3 py-1.5 rounded-t font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'notes'
                      ? 'bg-paper-surface text-ink-primary border-t border-l border-r border-paper-border'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mis Apuntes</span>
                  {noteText.trim() && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(algo.metadata.id, 'quiz')}
                  className={`px-3 py-1.5 rounded-t font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'quiz'
                      ? 'bg-paper-surface text-ink-primary border-t border-l border-r border-paper-border'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Desafío Conceptual</span>
                </button>
                {algo.technicalSheet?.mechanism && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(algo.metadata.id, 'mechanism')}
                    className={`px-3 py-1.5 rounded-t font-bold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'mechanism'
                        ? 'bg-paper-surface text-ink-primary border-t border-l border-r border-paper-border'
                        : 'text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mecánica</span>
                  </button>
                )}
              </div>

              {/* Contenido según la pestaña activa */}
              <div className="bg-paper-surface">
                {/* 1. Pestaña de Código Fuente */}
                {activeTab === 'code' && (
                  <div className="border-b border-paper-border">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-surface-container-low border-b border-paper-border">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => setLangForAlgo(algo.metadata.id, 'python')}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            activeCodeLang === 'python'
                              ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs'
                              : 'text-ink-secondary hover:text-ink-primary'
                          }`}
                        >
                          Python 3
                        </button>
                        <button
                          type="button"
                          onClick={() => setLangForAlgo(algo.metadata.id, 'c')}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            activeCodeLang === 'c'
                              ? 'bg-paper-surface text-ink-primary border border-paper-border shadow-xs'
                              : 'text-ink-secondary hover:text-ink-primary'
                          }`}
                        >
                          C99
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(algo.metadata.id, codeSnippet)}
                        className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-container flex items-center gap-1 font-mono text-[10px]"
                        title="Copiar código al portapapeles"
                      >
                        {copiedCodeId === algo.metadata.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-paper-surface max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed select-text">
                      <pre className="text-ink-primary">{codeSnippet}</pre>
                    </div>
                  </div>
                )}

                {/* 2. Pestaña de Mis Apuntes Personales */}
                {activeTab === 'notes' && (
                  <div className="p-3.5 border-b border-paper-border bg-[#FFFDF5]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-amber-900 dark:text-amber-400 font-bold">
                        <StickyNote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Bloc de Notas del Estudiante</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isNoteSaved && (
                          <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                            <Check className="w-3 h-3" />
                            Guardado ✓
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-ink-muted">
                          Auto-guardado en LocalStorage
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={noteText}
                      onChange={(e) => handleUpdateNote(algo.metadata.id, e.target.value)}
                      placeholder="Escribe aquí tus observaciones, mnemotécnicas, dudas o reflexiones para estudiar este algoritmo..."
                      rows={4}
                      className="w-full p-2.5 text-xs font-sans rounded-md bg-paper-surface border border-amber-200 dark:border-amber-800/60 text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs resize-none"
                    />
                  </div>
                )}

                {/* 3. Pestaña de Desafío Conceptual (Flash Quiz) */}
                {activeTab === 'quiz' && (
                  <div className="p-3.5 border-b border-paper-border bg-surface-container-low/40">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-900 dark:text-indigo-300 font-bold mb-2">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Pregunta de Laboratorio / Desafío Conceptual</span>
                    </div>

                    <p className="font-headline font-bold text-xs text-ink-primary mb-2 leading-relaxed">
                      {quiz.question}
                    </p>

                    <div className="p-2 rounded bg-surface-container/60 border border-paper-border text-[11px] text-ink-secondary mb-3 flex items-start gap-1.5">
                      <span className="font-mono font-bold text-ink-muted shrink-0">Pista:</span>
                      <span>{quiz.hint}</span>
                    </div>

                    {isAnswerRevealed ? (
                      <div className="p-3 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 animate-fade-in">
                        <div className="flex items-center justify-between font-mono text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-1">
                          <span>EXPLICACIÓN DEL INSTRUCTOR</span>
                          <button
                            type="button"
                            onClick={() => toggleRevealAnswer(algo.metadata.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Ocultar
                          </button>
                        </div>
                        <p className="leading-relaxed font-sans">{quiz.answer}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleRevealAnswer(algo.metadata.id)}
                        className="w-full py-1.5 px-3 rounded bg-indigo-600 text-white font-mono text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Revelar Solución y Justificación</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 4. Pestaña de Mecánica Operativa y Casos Borde */}
                {activeTab === 'mechanism' && algo.technicalSheet?.mechanism && (
                  <div className="p-3.5 border-b border-paper-border max-h-48 overflow-y-auto bg-surface-container-low/20">
                    <div className="font-mono text-[11px] font-bold text-ink-secondary mb-2 flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                      <span>MECÁNICA OPERACIONAL PASO A PASO:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-ink-secondary leading-relaxed pl-1 font-sans">
                      {algo.technicalSheet.mechanism.map((step, idx) => (
                        <li key={idx} className="pl-1">
                          {step}
                        </li>
                      ))}
                    </ol>

                    {algo.technicalSheet?.edgeCases && algo.technicalSheet.edgeCases.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-paper-border">
                        <div className="font-mono text-[10px] font-bold text-amber-800 flex items-center gap-1 mb-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>CASOS BORDE CRÍTICOS:</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-ink-secondary pl-1 font-mono">
                          {algo.technicalSheet.edgeCases.map((edge, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-600">•</span>
                              <span>{edge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de Acción para Cargar en Visualizador */}
              <div className="p-3 bg-surface-container-low flex justify-between items-center">
                <span className="font-mono text-[10px] text-ink-muted">
                  {algo.technicalSheet?.properties?.paradigm ?? 'Algoritmo Clásico'}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectAlgorithm(algo.metadata.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ink-primary text-paper-surface font-bold text-xs hover:bg-ink-primary/90 transition-all shadow-xs active:translate-y-0.5"
                >
                  <Play className="w-3 h-3" />
                  <span>Cargar en Visualizador</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
