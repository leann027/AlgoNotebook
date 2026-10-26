import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  RotateCcw,
  Sun,
  Moon,
  BookOpen,
  Keyboard,
  Bookmark,
  SlidersHorizontal,
} from 'lucide-react';
import {
  TACTILE_BUTTON,
  ARCHIVAL_STAMP,
  HEADER_NAV_TAB,
  HEADER_NAV_TAB_ACTIVE,
  HEADER_NAV_TAB_INACTIVE,
  TACTILE_SWITCH_CONTAINER,
  TACTILE_SWITCH_TRACK,
  TACTILE_SWITCH_THUMB,
} from '../../design-system/tokens';
import { LaboratorySettingsModal } from '../modals/LaboratorySettingsModal';
import { KeyboardShortcutsModal } from '../modals/KeyboardShortcutsModal';

export interface CatalogItem {
  id: string;
  name: string;
  subtitle?: string;
}

export interface CatalogGroup {
  category: string;
  items: CatalogItem[];
}

export interface NavTabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface NotebookBrandConfig {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  archivalStamp: string;
}

export interface UnifiedNotebookHeaderProps {
  currentNotebookId: string;
  brand: NotebookBrandConfig;
  catalogGroups: CatalogGroup[];
  selectedItemId: string;
  onSelectItem: (id: string) => void;
  bookmarkStorageKey: string;
  navTabs: NavTabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isStudyMode: boolean;
  onToggleStudyMode: () => void;
  onReset?: () => void;
  resetLabel?: string;
  onOpenShortcuts?: () => void;
  onOpenSettings?: () => void;
  extraActions?: React.ReactNode;
}

export const UnifiedNotebookHeader: React.FC<UnifiedNotebookHeaderProps> = ({
  currentNotebookId: _currentNotebookId,
  brand,
  catalogGroups,
  selectedItemId,
  onSelectItem,
  bookmarkStorageKey,
  navTabs,
  activeTab,
  onSelectTab,
  isStudyMode,
  onToggleStudyMode,
  onReset,
  resetLabel = 'Reiniciar Datos',
  onOpenShortcuts,
  onOpenSettings,
  extraActions,
}) => {
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
  const [isBuiltInShortcutsOpen, setIsBuiltInShortcutsOpen] = useState(false);
  const [isBuiltInSettingsOpen, setIsBuiltInSettingsOpen] = useState(false);

  const catalogDropdownRef = useRef<HTMLDivElement>(null);

  // Marcadores guardados en localStorage
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(bookmarkStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      try {
        localStorage.setItem(bookmarkStorageKey, JSON.stringify(next));
      } catch {
        // Ignorar errores de cuota o modo privado
      }
      return next;
    });
  };

  // Estado y persistencia del tema (Modo Claro / Modo Oscuro)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('algonotebook-theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const applyTheme = () => {
      try {
        const saved = localStorage.getItem('algonotebook-theme');
        let isDark = false;
        if (saved === 'dark') {
          isDark = true;
        } else if (saved === 'light') {
          isDark = false;
        } else {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        setIsDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch {
        // ignore
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const saved = localStorage.getItem('algonotebook-theme');
      if (!saved || saved === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    const handleThemeChange = () => applyTheme();
    window.addEventListener('algonotebook-theme-change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('algonotebook-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    try {
      localStorage.setItem('algonotebook-theme', nextDark ? 'dark' : 'light');
      if (nextDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      window.dispatchEvent(
        new CustomEvent('algonotebook-theme-change', {
          detail: { theme: nextDark ? 'dark' : 'light' },
        })
      );
    } catch {
      // ignore
    }
  };

  // Cierre de dropdowns al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(target)) {
        setIsCatalogDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCatalogDropdownOpen(false);
        setIsBuiltInShortcutsOpen(false);
        setIsBuiltInSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Encontrar el elemento actual y su categoría
  const currentItemInfo = (() => {
    for (const group of catalogGroups) {
      const found = group.items.find((item) => item.id === selectedItemId);
      if (found) {
        return { ...found, category: group.category };
      }
    }
    const fallback = catalogGroups[0]?.items[0];
    return {
      id: selectedItemId,
      name: fallback?.name ?? selectedItemId,
      category: catalogGroups[0]?.category ?? '',
    };
  })();

  const isCurrentBookmarked = bookmarks.includes(selectedItemId);
  const BrandIcon = brand.icon;

  const handleShortcutClick = () => {
    if (onOpenShortcuts) {
      onOpenShortcuts();
    } else {
      setIsBuiltInShortcutsOpen(true);
    }
  };

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      setIsBuiltInSettingsOpen(true);
    }
  };

  return (
    <header className="bg-paper-surface border-b border-paper-border shadow-sm top-0 z-30 flex flex-col w-full shrink-0">
      <div className="flex justify-between items-center w-full px-3 md:px-4 lg:px-6 h-14 shrink-0 min-w-0">
        {/* 1. Lado Izquierdo: Brand, Stamp & Catalog Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Brand Icon & Title */}
          <div className="flex items-center gap-2 px-1 py-1 text-ink-primary select-none shrink-0">
            <BrandIcon className="w-5 h-5 text-ink-primary shrink-0" />
            <span className="font-headline font-extrabold text-sm tracking-tight hidden md:inline">
              {brand.name}
            </span>
          </div>

          {/* Archival Stamp */}
          <div className={`hidden sm:inline-flex ${ARCHIVAL_STAMP}`}>
            {brand.archivalStamp}
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-4 w-px bg-paper-border mx-0.5" />

          {/* Grouped Category Dropdown with Bookmark star button */}
          {catalogGroups.length > 0 && (
            <div className="relative flex items-center gap-1 min-w-0" ref={catalogDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCatalogDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-paper-border bg-paper-surface hover:bg-surface-container-low text-ink-primary text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary max-w-[200px] sm:max-w-xs truncate cursor-pointer"
                aria-expanded={isCatalogDropdownOpen}
                aria-haspopup="listbox"
              >
                {currentItemInfo.category && (
                  <span className="text-ink-secondary font-normal hidden md:inline truncate">
                    {currentItemInfo.category} /
                  </span>
                )}
                <span className="font-semibold truncate">{currentItemInfo.name}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-ink-secondary shrink-0 transition-transform duration-150 ${
                    isCatalogDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Bookmark star button */}
              <button
                type="button"
                onClick={() => toggleBookmark(selectedItemId)}
                className={`p-1.5 rounded border transition-colors shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none cursor-pointer ${
                  isCurrentBookmarked
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-paper-surface border-paper-border text-ink-muted hover:text-ink-primary hover:bg-surface-container-low'
                }`}
                title={isCurrentBookmarked ? 'Marcador guardado' : 'Guardar marcador'}
                aria-label="Guardar en marcadores"
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isCurrentBookmarked ? 'fill-amber-500 text-amber-500' : ''
                  }`}
                />
              </button>

              {/* Menú Desplegable Agrupado por Categorías */}
              {isCatalogDropdownOpen && (
                <div
                  className={`absolute left-0 top-full mt-1 w-64 sm:w-72 max-h-96 overflow-y-auto bg-paper-surface border border-paper-border rounded shadow-md z-50 py-1 animate-slide-down`}
                  role="listbox"
                >
                  <div className="px-3 py-1 font-mono text-[10px] text-ink-muted border-b border-paper-border uppercase tracking-wider select-none flex justify-between items-center bg-surface-container-low">
                    <span>Explorar Catálogo</span>
                    <span>{bookmarks.length} ★</span>
                  </div>

                  {catalogGroups.map((group) => (
                    <div
                      key={group.category}
                      className="border-b border-paper-border/60 last:border-b-0"
                    >
                      <div className="px-3 pt-2 pb-0.5 font-mono text-[9px] font-bold text-ink-muted uppercase tracking-wider bg-surface-container-low/40">
                        {group.category}
                      </div>
                      {group.items.map((item) => {
                        const isSelected = item.id === selectedItemId;
                        const isItemBookmarked = bookmarks.includes(item.id);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onSelectItem(item.id);
                              setIsCatalogDropdownOpen(false);
                            }}
                            className={`w-full text-left flex items-center justify-between px-3 py-1.5 text-xs transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
                              isSelected
                                ? 'bg-surface-container text-ink-primary font-bold'
                                : 'text-ink-secondary hover:bg-surface-container-low hover:text-ink-primary'
                            }`}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {isItemBookmarked && (
                                <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                              )}
                              <div className="truncate">
                                <div className="truncate">{item.name}</div>
                                {item.subtitle && (
                                  <div className="text-[10px] text-ink-muted font-mono truncate">
                                    {item.subtitle}
                                  </div>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-ink-primary shrink-0 ml-1.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Central Navigation Tabs (Desktop >= 1024px) */}
        {navTabs.length > 0 && (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 ${HEADER_NAV_TAB} focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none cursor-pointer ${
                    isActive ? HEADER_NAV_TAB_ACTIVE : HEADER_NAV_TAB_INACTIVE
                  }`}
                >
                  {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* 3. Lado Derecho: Controles de Acción */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Selector de Tema Claro/Oscuro */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-1.5 rounded hover:bg-surface-container-low hover:text-ink-primary active:translate-y-0.5 transition-transform flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary text-ink-secondary cursor-pointer border border-transparent hover:border-paper-border"
            title={isDarkMode ? 'Cambiar a Modo Claro (Papel)' : 'Cambiar a Modo Oscuro (Night Lab)'}
            aria-label={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-500 hover:text-amber-400 transition-colors" />
            ) : (
              <Moon className="w-4 h-4 text-ink-secondary hover:text-ink-primary transition-colors" />
            )}
            <span className="hidden xl:inline font-mono text-[11px] font-semibold text-ink-secondary hover:text-ink-primary">
              {isDarkMode ? 'Claro' : 'Oscuro'}
            </span>
          </button>

          {/* Modo Estudio Toggle */}
          <div
            className={TACTILE_SWITCH_CONTAINER}
            title="Modo de Estudio Libre de Distracciones (Ocultar Barra Lateral)"
          >
            <BookOpen className="w-3.5 h-3.5 text-ink-secondary" />
            <span className="text-[11px] font-medium text-ink-secondary hidden md:inline">
              Modo Estudio
            </span>
            <button
              type="button"
              onClick={onToggleStudyMode}
              className={`${TACTILE_SWITCH_TRACK} focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none cursor-pointer ${
                isStudyMode ? 'bg-ink-primary' : 'bg-paper-border'
              }`}
              aria-label="Alternar modo de estudio"
            >
              <div
                className={`${TACTILE_SWITCH_THUMB} ${
                  isStudyMode ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Botón de Reset opcional */}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className={`hidden sm:flex ${TACTILE_BUTTON} focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none cursor-pointer`}
              title="Reiniciar datos del visualizador"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{resetLabel}</span>
            </button>
          )}

          {/* Grupo de Atajos, Extra Actions y Ajustes */}
          <div className="flex items-center border-l border-paper-border pl-2 gap-1 text-ink-secondary">
            {/* Botón de Atajos */}
            <button
              type="button"
              onClick={handleShortcutClick}
              className="p-1.5 rounded hover:bg-surface-container-low hover:text-ink-primary active:translate-y-0.5 transition-transform flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary cursor-pointer"
              title="Atajos de Teclado"
              aria-label="Atajos de Teclado"
            >
              <Keyboard className="w-4 h-4 text-ink-primary" />
              <span className="hidden md:inline font-mono text-[11px] font-semibold text-ink-secondary hover:text-ink-primary">
                Atajos
              </span>
            </button>

            {/* Slot de Extra Actions (p.ej. Knowledge DAG, exportadores, etc.) */}
            {extraActions}

            {/* Botón de Ajustes */}
            <button
              type="button"
              onClick={handleSettingsClick}
              className="p-1.5 rounded hover:bg-surface-container-low hover:text-ink-primary active:translate-y-0.5 transition-transform flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary cursor-pointer"
              title="Ajustes de Laboratorio"
              aria-label="Ajustes de Laboratorio"
            >
              <SlidersHorizontal className="w-4 h-4 text-ink-primary" />
              <span className="hidden md:inline font-mono text-[11px] font-semibold text-ink-secondary hover:text-ink-primary">
                Ajustes
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Tabs (< 1024px) */}
      {navTabs.length > 0 && (
        <nav
          className="flex lg:hidden items-center gap-1.5 px-3 py-1.5 overflow-x-auto border-t border-paper-border/60 bg-paper-surface text-xs select-none scrollbar-none shrink-0"
          aria-label="Navegación móvil"
        >
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none cursor-pointer ${
                  isActive
                    ? 'bg-ink-primary text-paper-surface font-semibold shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
                }`}
              >
                {TabIcon && <TabIcon className="w-3.5 h-3.5 shrink-0" />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Fallback Built-in Modal: Atajos de Teclado */}
      {!onOpenShortcuts && (
        <KeyboardShortcutsModal
          isOpen={isBuiltInShortcutsOpen}
          onClose={() => setIsBuiltInShortcutsOpen(false)}
        />
      )}

      {/* Fallback Built-in Modal: Ajustes */}
      {!onOpenSettings && (
        <LaboratorySettingsModal
          isOpen={isBuiltInSettingsOpen}
          onClose={() => setIsBuiltInSettingsOpen(false)}
        />
      )}
    </header>
  );
};
