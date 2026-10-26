import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AlgorithmTechnicalSheet } from '../../../core/types';
import { FormattedMathText } from '../../common/FormattedMathText';

export interface EdgeCasesTabProps {
  sheet: AlgorithmTechnicalSheet;
}

export const EdgeCasesTab: React.FC<EdgeCasesTabProps> = ({ sheet }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-paper-surface border border-paper-border rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
            Casos Borde Críticos y Errores Habituales
          </h3>
        </div>
        <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
          Escenarios extremos que deben considerarse en una implementación de producción o entrevista técnica:
        </p>

        <ul className="space-y-2.5">
          {sheet.edgeCases.map((edgeCase, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3 rounded-md bg-surface-container-low/70 border border-paper-border"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-ink-primary leading-relaxed font-mono">
                <FormattedMathText text={edgeCase} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
