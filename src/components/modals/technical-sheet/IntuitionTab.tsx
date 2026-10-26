import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import type { AlgorithmTechnicalSheet } from '../../../core/types';
import { FormattedMathText } from '../../common/FormattedMathText';

export interface IntuitionTabProps {
  sheet: AlgorithmTechnicalSheet;
}

export const IntuitionTab: React.FC<IntuitionTabProps> = ({ sheet }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Tarjeta de Metáfora Mental / Analogía del mundo real */}
      {sheet.analogy && (
        <div className="bg-[#FFFBEA] border border-[#FDE047] rounded-lg p-4 shadow-postit relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base select-none">💡</span>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
              Analogía Mental del Mundo Real
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-ink-primary leading-relaxed font-sans font-medium">
            {sheet.analogy}
          </p>
        </div>
      )}

      {/* Objetivo Formal */}
      <div className="bg-paper-surface border border-paper-border rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
            ¿Qué problema resuelve y cuál es su objetivo?
          </h3>
        </div>
        <div className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
          <FormattedMathText text={sheet.objective} />
        </div>
      </div>

      {/* En Palabras Sencillas */}
      {sheet.inPlainWords && (
        <div className="bg-surface-container-low border border-paper-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-ink-secondary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
              Explicación en Palabras Sencillas
            </h3>
          </div>
          <div className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            <FormattedMathText text={sheet.inPlainWords} />
          </div>
        </div>
      )}

      {/* Badges de Propiedades de Algoritmo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded bg-paper-surface border border-paper-border shadow-xs text-center">
          <span className="font-mono text-[10px] text-ink-muted uppercase block">Paradigma</span>
          <span className="font-mono text-xs font-bold text-ink-primary mt-1 block">
            {sheet.properties.paradigm}
          </span>
        </div>
        <div className="p-3 rounded bg-paper-surface border border-paper-border shadow-xs text-center">
          <span className="font-mono text-[10px] text-ink-muted uppercase block">¿In-Place en Memoria?</span>
          <span className="font-mono text-xs font-bold text-ink-primary mt-1 block">
            {sheet.properties.isInPlace ? 'Sí (O(1) extra)' : 'No (Requiere memoria auxiliar)'}
          </span>
        </div>
        <div className="p-3 rounded bg-paper-surface border border-paper-border shadow-xs text-center">
          <span className="font-mono text-[10px] text-ink-muted uppercase block">¿Es Estable?</span>
          <span className="font-mono text-xs font-bold text-ink-primary mt-1 block">
            {sheet.properties.isStable === true
              ? 'Sí (Preserva orden relativo)'
              : sheet.properties.isStable === false
              ? 'No (Puede permutar iguales)'
              : 'N/A (No aplica)'}
          </span>
        </div>
      </div>
    </div>
  );
};
