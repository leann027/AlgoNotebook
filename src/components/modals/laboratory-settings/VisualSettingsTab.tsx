import React from 'react';
import { Sun, Moon, SlidersHorizontal, Eye, Zap, Type } from 'lucide-react';
import type { LaboratorySettings } from '../LaboratorySettingsModal';

export interface VisualSettingsTabProps {
  settings: LaboratorySettings;
  themePreference: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onSettingsChange: React.Dispatch<React.SetStateAction<LaboratorySettings>>;
}

export const VisualSettingsTab: React.FC<VisualSettingsTabProps> = ({
  settings,
  themePreference,
  onThemeChange,
  onSettingsChange,
}) => {
  return (
    <>
      {/* Selector de Esquema de Color / Tema */}
      <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-ink-primary flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-ink-secondary" />
            Esquema de Color / Modo de Visualización
          </span>
          <span className="font-mono text-[10px] text-ink-secondary uppercase">
            {themePreference === 'light'
              ? 'Claro (Papel)'
              : themePreference === 'dark'
              ? 'Oscuro (Night Lab)'
              : 'Sistema (Auto)'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'light', label: 'Claro', icon: Sun },
            { id: 'dark', label: 'Oscuro', icon: Moon },
            { id: 'system', label: 'Sistema', icon: SlidersHorizontal },
          ] as const).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange(t.id)}
                className={`py-1.5 px-2 text-xs font-mono font-bold rounded border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  themePreference === t.id
                    ? 'bg-paper-surface border-ink-primary text-ink-primary shadow-xs'
                    : 'border-paper-border text-ink-secondary hover:bg-paper-surface'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Estilo de Textura de Cuadrícula */}
      <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-ink-primary flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-ink-secondary" />
            Textura del Papel en Viewports
          </span>
          <span className="font-mono text-[10px] text-ink-secondary uppercase">
            {settings.gridStyle === 'subtle'
              ? 'Cuadrícula Sutil'
              : settings.gridStyle === 'dense'
              ? 'Técnica Densa'
              : 'Papel Liso'}
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
              onClick={() => onSettingsChange((prev) => ({ ...prev, gridStyle: st.id }))}
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
            onSettingsChange((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }))
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
              onClick={() => onSettingsChange((prev) => ({ ...prev, fontSize: size }))}
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
  );
};
