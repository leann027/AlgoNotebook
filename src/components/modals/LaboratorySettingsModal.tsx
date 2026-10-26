import React, { useState, useEffect, useId, useRef } from 'react';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import {
  VisualSettingsTab,
  EngineSettingsTab,
  SystemSettingsTab,
} from './laboratory-settings';

export interface LaboratorySettings {
  gridStyle: 'subtle' | 'clean' | 'dense';
  reducedMotion: boolean;
  defaultSpeed: number;
  fontSize: 'sm' | 'md' | 'lg';
  defaultLang: 'python' | 'c';
  pedagogicalDetail: 'rich' | 'concise';
  theme?: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: LaboratorySettings = {
  gridStyle: 'subtle',
  reducedMotion: false,
  defaultSpeed: 1.0,
  fontSize: 'md',
  defaultLang: 'python',
  pedagogicalDetail: 'rich',
  theme: 'system',
};

export interface LaboratorySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: LaboratorySettings) => void;
}

export const LaboratorySettingsModal: React.FC<LaboratorySettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<LaboratorySettings>(() => {
    try {
      const saved = localStorage.getItem('algonotebook_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeSettingsTab, setActiveSettingsTab] = useState<'visual' | 'engine' | 'system'>('visual');
  const [clearedStorage, setClearedStorage] = useState<boolean>(false);
  const clearNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincronización del tema ('light' | 'dark' | 'system')
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('algonotebook-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
      return 'system';
    } catch {
      return 'system';
    }
  });

  const titleId = useId();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (clearNoticeTimerRef.current !== null) {
        clearTimeout(clearNoticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      try {
        const saved = localStorage.getItem('algonotebook-theme');
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemePreference(saved);
        } else {
          setThemePreference('system');
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('algonotebook-theme-change', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('algonotebook-theme-change', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setThemePreference(newTheme);
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    try {
      localStorage.setItem('algonotebook-theme', newTheme);
      let isDark = false;
      if (newTheme === 'dark') {
        isDark = true;
      } else if (newTheme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      window.dispatchEvent(
        new CustomEvent('algonotebook-theme-change', {
          detail: { theme: newTheme },
        })
      );
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('algonotebook_settings', JSON.stringify(settings));
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
    } catch {
      // ignore
    }
  }, [settings, onSettingsChange]);

  if (!isOpen) return null;

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    handleThemeChange('system');
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('algonotebook_bookmarks');
      localStorage.removeItem('algonotebook_notes');
      setClearedStorage(true);
      if (clearNoticeTimerRef.current !== null) {
        clearTimeout(clearNoticeTimerRef.current);
      }
      clearNoticeTimerRef.current = setTimeout(() => {
        setClearedStorage(false);
        clearNoticeTimerRef.current = null;
      }, 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 bg-ink-primary/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in overscroll-contain"
      onClick={onClose}
    >
      <div
        className="bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card w-full max-w-lg p-5 text-ink-primary relative select-none flex flex-col max-h-[90vh] overflow-hidden animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Panel de Ajustes */}
        <div className="flex items-center justify-between pb-3.5 border-b border-paper-border mb-3 shrink-0 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded bg-surface-container border border-paper-border text-ink-primary shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-ink-primary" />
            </div>
            <div className="min-w-0">
              <h3 id={titleId} className="font-headline font-bold text-sm tracking-tight text-ink-primary truncate">
                Ajustes de Laboratorio (Preferencias del Entorno)
              </h3>
              <p className="font-mono text-[10px] text-ink-secondary truncate">
                Configuración ergonómica, visual y motor algorítmico persistente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-container transition-colors shrink-0 ml-2 cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none"
            title="Cerrar (Esc)"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas de Ajustes */}
        <div className="flex items-center gap-1 border-b border-paper-border pb-2 mb-4 shrink-0 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveSettingsTab('visual')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeSettingsTab === 'visual'
                ? 'bg-ink-primary text-paper-surface font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            Lienzo y Visual
          </button>
          <button
            type="button"
            onClick={() => setActiveSettingsTab('engine')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeSettingsTab === 'engine'
                ? 'bg-ink-primary text-paper-surface font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            Código y Motor
          </button>
          <button
            type="button"
            onClick={() => setActiveSettingsTab('system')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
              activeSettingsTab === 'system'
                ? 'bg-ink-primary text-paper-surface font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            Sistema y Datos
          </button>
        </div>

        {/* Contenido de Opciones con Scroll */}
        <div className="space-y-4 overflow-y-auto overscroll-contain flex-1 pr-1 pb-2">
          {activeSettingsTab === 'visual' && (
            <VisualSettingsTab
              settings={settings}
              themePreference={themePreference}
              onThemeChange={handleThemeChange}
              onSettingsChange={setSettings}
            />
          )}

          {activeSettingsTab === 'engine' && (
            <EngineSettingsTab
              settings={settings}
              onSettingsChange={setSettings}
            />
          )}

          {activeSettingsTab === 'system' && (
            <SystemSettingsTab
              onClearCache={handleClearCache}
              clearedStorage={clearedStorage}
            />
          )}
        </div>

        {/* Pie con botón de reset y cerrar */}
        <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Valores de Fábrica</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-ink-primary text-paper-surface font-bold hover:bg-ink-primary/90 transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none"
            aria-label="Cerrar modal"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
