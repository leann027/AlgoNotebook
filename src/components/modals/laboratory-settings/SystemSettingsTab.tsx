import React from 'react';
import { HardDrive, Check } from 'lucide-react';

export interface SystemSettingsTabProps {
  onClearCache: () => void;
  clearedStorage: boolean;
}

export const SystemSettingsTab: React.FC<SystemSettingsTabProps> = ({
  onClearCache,
  clearedStorage,
}) => {
  return (
    <>
      {/* Información de Aplicación y PWA */}
      <div className="p-3 rounded bg-surface-container-low border border-paper-border space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-ink-primary">Versión de Laboratorio:</span>
          <span className="px-2 py-0.5 rounded bg-highlighter-success text-ink-primary font-bold">
            v1.0 Producción
          </span>
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
          onClick={onClearCache}
          className="px-3 py-1.5 rounded bg-paper-surface border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
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
  );
};
