import React from 'react';
import { Cpu } from 'lucide-react';
import type { AlgorithmTechnicalSheet } from '../../../core/types';
import type { AlgorithmRecurrenceInfo } from '../../../data/algorithmRecurrences';
import { FormattedMathText } from '../../common/FormattedMathText';

export interface MechanismTabProps {
  sheet: AlgorithmTechnicalSheet;
  activeRecInfo: AlgorithmRecurrenceInfo;
}

export const MechanismTab: React.FC<MechanismTabProps> = ({ sheet, activeRecInfo }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-paper-surface border border-paper-border rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
            Mecánica Operativa Paso a Paso
          </h3>
        </div>
        <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
          Flujo de ejecución secuencial y condiciones de transición entre estados:
        </p>

        <ol className="space-y-3">
          {sheet.mechanism.map((step, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3 rounded-md bg-surface-container-low/70 border border-paper-border hover:bg-surface-container-low transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink-primary text-paper-surface font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                {idx + 1}
              </span>
              <div className="text-xs sm:text-sm text-ink-primary leading-relaxed font-mono">
                <FormattedMathText text={step} />
              </div>
            </li>
          ))}
        </ol>

        {/* Nota de Costo de Recurrencia por Paso */}
        <div className="p-3.5 rounded-lg bg-surface-container-low border border-paper-border mt-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-primary">
              Transición de Estados y Consumo por Paso
            </span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Cada paso operativo presentado arriba avanza la ejecución resolviendo la relación recursiva:{' '}
            <span className="font-bold text-ink-primary">
              <FormattedMathText text={activeRecInfo.recurrence} />
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
