import React from 'react';
import { Code2, Gauge, HelpCircle } from 'lucide-react';
import type { LaboratorySettings } from '../LaboratorySettingsModal';

export interface EngineSettingsTabProps {
  settings: LaboratorySettings;
  onSettingsChange: React.Dispatch<React.SetStateAction<LaboratorySettings>>;
}

export const EngineSettingsTab: React.FC<EngineSettingsTabProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
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
              onClick={() => onSettingsChange((prev) => ({ ...prev, defaultLang: l.id }))}
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
              onClick={() => onSettingsChange((prev) => ({ ...prev, defaultSpeed: spd }))}
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
              onClick={() => onSettingsChange((prev) => ({ ...prev, pedagogicalDetail: det.id }))}
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
  );
};
