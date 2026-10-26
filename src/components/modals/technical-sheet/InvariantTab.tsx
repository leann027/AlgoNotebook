import React from 'react';
import { Bookmark } from 'lucide-react';
import type { AlgorithmTechnicalSheet } from '../../../core/types';
import { FormattedMathText } from '../../common/FormattedMathText';

export interface InvariantTabProps {
  sheet: AlgorithmTechnicalSheet;
}

export const InvariantTab: React.FC<InvariantTabProps> = ({ sheet }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-paper-surface border border-paper-border rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark className="w-4 h-4 text-emerald-600" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
            Invariante Formal de Ciclo / Recursión
          </h3>
        </div>

        <div className="bg-surface-container-low border-l-4 border-ink-primary p-4 rounded font-mono text-xs sm:text-sm leading-relaxed text-ink-primary shadow-xs my-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
            CONDICIÓN QUE SE CUMPLE EN CADA ITERACIÓN:
          </span>
          <FormattedMathText text={sheet.loopInvariant} />
        </div>

        <div className="mt-4 p-3.5 rounded bg-emerald-50/60 border border-emerald-200 text-xs text-ink-secondary leading-relaxed">
          <strong className="text-emerald-900 font-bold block mb-1">
            ¿Por qué garantiza la corrección del algoritmo?
          </strong>
          Por el principio de inducción matemática: si el invariante es verdadero antes de iniciar la primera pasada (inicialización), se mantiene verdadero tras cada paso individual (mantenimiento), y cuando la condición de salida se alcanza (terminación), el invariante demuestra de forma irrefutable que el resultado es correcto.
        </div>
      </div>
    </div>
  );
};
