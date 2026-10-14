import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  RotateCcw,
  Sun,
  Keyboard,
  X,
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
  TACTILE_CARD,
} from '../../design-system/tokens';
import { SHORTCUTS_HELP_LIST } from '../../hooks/useKeyboardShortcuts';
import { LaboratorySettingsModal } from '../modals/LaboratorySettingsModal';

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
    <header className="bg-paper-surface border-b border-paper-border shadow-sm top-0 z-30 flex justify-between items-center w-full px-3 md:px-4 lg:px-6 h-14 shrink-0">
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-paper-border bg-paper-surface hover:bg-surface-container-low text-ink-primary text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ink-primary/20 max-w-[200px] sm:max-w-xs truncate"
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
              className={`p-1.5 rounded border transition-colors shrink-0 ${
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
                className={`absolute left-0 top-full mt-1 w-64 sm:w-72 max-h-96 overflow-y-auto bg-paper-surface border border-paper-border rounded shadow-md z-50 py-1 animate-in fade-in duration-100`}
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
                          className={`w-full text-left flex items-center justify-between px-3 py-1.5 text-xs transition-colors ${
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

      {/* 2. Central Navigation Tabs */}
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
                className={`flex items-center gap-1.5 ${HEADER_NAV_TAB} ${
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
        {/* Modo Estudio Toggle */}
        <div
          className={TACTILE_SWITCH_CONTAINER}
          title="Modo de Estudio Libre de Distracciones"
        >
          <Sun className="w-3.5 h-3.5 text-ink-secondary" />
          <span className="text-[11px] font-medium text-ink-secondary hidden md:inline">
            Modo Estudio
          </span>
          <button
            type="button"
            onClick={onToggleStudyMode}
            className={`${TACTILE_SWITCH_TRACK} ${
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
            className={`hidden sm:flex ${TACTILE_BUTTON}`}
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
            className="p-1.5 rounded hover:bg-surface-container-low hover:text-ink-primary active:translate-y-0.5 transition-transform flex items-center gap-1.5 focus:outline-none"
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
            className="p-1.5 rounded hover:bg-surface-container-low hover:text-ink-primary active:translate-y-0.5 transition-transform flex items-center gap-1.5 focus:outline-none"
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

      {/* Fallback Built-in Modal: Atajos de Teclado */}
      {!onOpenShortcuts && isBuiltInShortcutsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unified-shortcuts-title"
          className="fixed inset-0 bg-ink-primary/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsBuiltInShortcutsOpen(false)}
        >
          <div
            className={`bg-paper-surface border border-paper-border rounded-lg ${TACTILE_CARD} w-full max-w-md p-5 text-ink-primary relative select-none`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-paper-border mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-ink-primary" />
                <h3
                  id="unified-shortcuts-title"
                  className="font-headline font-bold text-sm tracking-tight text-ink-primary"
                >
                  Atajos de Teclado del Laboratorio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBuiltInShortcutsOpen(false)}
                className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-container-high transition-colors"
                title="Cerrar (Esc)"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {SHORTCUTS_HELP_LIST.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface-container-low border border-paper-border text-xs"
                >
                  <span className="text-ink-secondary font-medium">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-0.5 font-mono text-[11px] font-bold bg-paper-surface border border-paper-border rounded shadow-xs text-ink-primary">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-paper-border text-[11px] font-mono text-ink-muted leading-relaxed">
              💡 Presiona <kbd className="px-1 bg-surface-container border border-paper-border rounded text-[10px]">Esc</kbd> para cerrar. Los atajos se ignoran al escribir en campos de texto.
            </div>
          </div>
        </div>
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
