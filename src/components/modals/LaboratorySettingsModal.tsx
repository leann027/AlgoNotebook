import React, { useState, useEffect, useId, useRef } from 'react';
import {
  X,
  SlidersHorizontal,
  Eye,
  Zap,
  Type,
  RotateCcw,
  Code2,
  Gauge,
  HelpCircle,
  HardDrive,
  Check,
} from 'lucide-react';

export interface LaboratorySettings {
  gridStyle: 'subtle' | 'clean' | 'dense';
  reducedMotion: boolean;
  defaultSpeed: number;
  fontSize: 'sm' | 'md' | 'lg';
  defaultLang: 'python' | 'c';
  pedagogicalDetail: 'rich' | 'concise';
}

const DEFAULT_SETTINGS: LaboratorySettings = {
  gridStyle: 'subtle',
  reducedMotion: false,
  defaultSpeed: 1.0,
  fontSize: 'md',
  defaultLang: 'python',
  pedagogicalDetail: 'rich',
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

  const titleId = useId();

  useEffect(() => {
    return () => {
      if (clearNoticeTimerRef.current !== null) {
        clearTimeout(clearNoticeTimerRef.current);
      }
    };
  }, []);

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
      className="fixed inset-0 bg-ink-primary/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card w-full max-w-lg p-5 text-ink-primary relative select-none flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Panel de Ajustes */}
        <div className="flex items-center justify-between pb-3.5 border-b border-paper-border mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-surface-container border border-paper-border text-ink-primary">
              <SlidersHorizontal className="w-4 h-4 text-ink-primary" />
            </div>
            <div>
              <h3 id={titleId} className="font-headline font-bold text-sm tracking-tight text-ink-primary">
                Ajustes de Laboratorio (Preferencias del Entorno)
              </h3>
              <p className="font-mono text-[10px] text-ink-secondary">
                Configuración ergonómica, visual y motor algorítmico persistente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-container transition-colors"
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas de Ajustes */}
        <div className="flex items-center gap-1 border-b border-paper-border pb-2 mb-4 shrink-0 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveSettingsTab('visual')}
            className={`px-3 py-1 rounded transition-colors ${
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
            className={`px-3 py-1 rounded transition-colors ${
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
            className={`px-3 py-1 rounded transition-colors ${
              activeSettingsTab === 'system'
                ? 'bg-ink-primary text-paper-surface font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low'
            }`}
          >
            Sistema y Datos
          </button>
        </div>

        {/* Contenido de Opciones con Scroll */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1 pb-2">
          {/* SECCIÓN 1: LIENZO Y VISUAL */}
          {activeSettingsTab === 'visual' && (
            <>
              {/* Estilo de Textura de Cuadrícula */}
              <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink-primary flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-ink-secondary" />
                    Textura del Papel en Viewports
                  </span>
                  <span className="font-mono text-[10px] text-ink-secondary uppercase">
                    {settings.gridStyle === 'subtle' ? 'Cuadrícula Sutil' : settings.gridStyle === 'dense' ? 'Técnica Densa' : 'Papel Liso'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'subtle', label: 'Milimétrica Sutil' },
                    { id: 'dense', label: 'Técnica Densa' },
                    { id: 'clean', label: 'Papel Liso' },
                  ] satisfies Array<{ id: LaboratorySettings['gridStyle']; label: string }>).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, gridStyle: st.id }))}
                      className={`py-1.5 px-2 text-xs font-mono font-bold rounded border transition-colors ${
                        settings.gridStyle === st.id
                          ? 'bg-paper-surface border-ink-primary text-ink-primary shadow-xs'
                          : 'border-paper-border text-ink-secondary hover:bg-paper-surface'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animaciones y Transiciones */}
              <div className="flex items-center justify-between p-3 rounded bg-surface-container-low border border-paper-border">
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold text-ink-primary flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-ink-secondary" />
                    Transiciones Interpoladas
                  </span>
                  <p className="text-[11px] text-ink-secondary">
                    Animaciones fluidas en barras, aristas SVG y desplazamiento de punteros
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }))
                  }
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none flex items-center ${
                    !settings.reducedMotion ? 'bg-ink-primary' : 'bg-paper-border'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-paper-surface shadow-xs transform transition-transform duration-200 ${
                      !settings.reducedMotion ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Escala Tipográfica */}
              <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink-primary flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-ink-secondary" />
                    Escala Tipográfica de Código (JetBrains Mono)
                  </span>
                  <span className="font-mono text-[10px] font-bold text-ink-secondary uppercase">
                    {settings.fontSize}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['sm', 'md', 'lg'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, fontSize: size }))}
                      className={`py-1 text-xs font-mono font-bold rounded border transition-colors ${
                        settings.fontSize === size
                          ? 'bg-paper-surface border-ink-primary text-ink-primary shadow-xs'
                          : 'border-paper-border text-ink-secondary hover:bg-paper-surface'
                      }`}
                    >
                      {size === 'sm' ? 'Compacta' : size === 'md' ? 'Estándar' : 'Amplia'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SECCIÓN 2: CÓDIGO Y MOTOR */}
          {activeSettingsTab === 'engine' && (
            <>
              {/* Lenguaje Predeterminado */}
              <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink-primary flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-ink-secondary" />
                    Lenguaje Predeterminado al Cargar
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'python', label: 'Python 3 (Idiomático)' },
                    { id: 'c', label: 'C99 (Punteros & Structs)' },
                  ] satisfies Array<{ id: LaboratorySettings['defaultLang']; label: string }>).map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, defaultLang: l.id }))}
                      className={`py-1.5 text-xs font-mono font-bold rounded border transition-colors ${
                        settings.defaultLang === l.id
                          ? 'bg-paper-surface border-ink-primary text-ink-primary shadow-xs'
                          : 'border-paper-border text-ink-secondary hover:bg-paper-surface'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Velocidad Inicial de Reproducción */}
              <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink-primary flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-ink-secondary" />
                    Velocidad Inicial del Motor
                  </span>
                  <span className="font-mono text-[10px] font-bold text-ink-secondary">
                    {settings.defaultSpeed}x
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0.5, 1.0, 2.0].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, defaultSpeed: spd }))}
                      className={`py-1 text-xs font-mono font-bold rounded border transition-colors ${
                        settings.defaultSpeed === spd
                          ? 'bg-paper-surface border-ink-primary text-ink-primary shadow-xs'
                          : 'border-paper-border text-ink-secondary hover:bg-paper-surface'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Nivel de Detalle Pedagógico */}
              <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink-primary flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-ink-secondary" />
                    Nivel de Detalle Pedagógico en Post-its
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'rich', label: 'Explicativo Amplio' },
                    { id: 'concise', label: 'Conciso & Técnico' },
                  ] satisfies Array<{ id: LaboratorySettings['pedagogicalDetail']; label: string }>).map((det) => (
                    <button
                      key={det.id}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, pedagogicalDetail: det.id }))}
                      className={`py-1.5 text-xs font-mono font-bold rounded border transition-colors ${
                        settings.pedagogicalDetail === det.id
                          ? 'bg-paper-surface border-ink-primary text-ink-primary shadow-xs'
                          : 'border-paper-border text-ink-secondary hover:bg-paper-surface'
                      }`}
                    >
                      {det.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SECCIÓN 3: SISTEMA Y DATOS */}
          {activeSettingsTab === 'system' && (
            <>
              {/* Información de Aplicación y PWA */}
              <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink-primary">Versión de Laboratorio:</span>
                  <span className="px-2 py-0.5 rounded bg-highlighter-success text-ink-primary font-bold">v1.0 Producción</span>
                </div>
                <div className="flex items-center justify-between text-ink-secondary">
                  <span>Modo Offline PWA:</span>
                  <span className="font-bold text-emerald-700">Activo (Precache SW Listo)</span>
                </div>
                <div className="flex items-center justify-between text-ink-secondary">
                  <span>Módulos de Algoritmos Activos:</span>
                  <span className="font-bold text-ink-primary">21 Módulos Canónicos</span>
                </div>
              </div>

              {/* Restablecer Marcadores y Notas */}
              <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink-primary flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-ink-secondary" />
                    Almacenamiento Local (LocalStorage)
                  </span>
                </div>
                <p className="text-[11px] text-ink-secondary leading-snug">
                  Borra los marcadores favoritos guardados y las notas adhesivas de estudio en este navegador.
                </p>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-3 py-1.5 rounded bg-paper-surface border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  {clearedStorage ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Datos Locales Restablecidos!</span>
                    </>
                  ) : (
                    <span>Limpiar Marcadores y Notas Guardadas</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Pie con botón de reset y cerrar */}
        <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Valores de Fábrica</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-ink-primary text-paper-surface font-bold hover:bg-ink-primary/90 transition-colors cursor-pointer"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
