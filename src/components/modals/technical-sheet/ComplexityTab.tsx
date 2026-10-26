import React from 'react';
import { TrendingUp, Cpu } from 'lucide-react';
import type { AlgorithmTechnicalSheet } from '../../../core/types';
import type { AlgorithmRecurrenceInfo } from '../../../data/algorithmRecurrences';
import { FormattedMathText } from '../../common/FormattedMathText';

export interface ComplexityTabProps {
  sheet: AlgorithmTechnicalSheet;
  activeRecInfo: AlgorithmRecurrenceInfo;
  bestComplexity: string;
  avgComplexity: string;
  worstComplexity: string;
  spaceComplexity: string;
}

export const ComplexityTab: React.FC<ComplexityTabProps> = ({
  sheet,
  activeRecInfo,
  bestComplexity,
  avgComplexity,
  worstComplexity,
  spaceComplexity,
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-paper-surface border border-paper-border rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
            Análisis de Complejidad Asintótica (Big-O)
          </h3>
        </div>

        {/* Grid de Complejidades */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded bg-emerald-50/70 border border-emerald-200 text-center">
            <span className="font-mono text-[10px] text-emerald-800 uppercase font-bold block">
              Mejor Caso
            </span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-950 mt-1 block">
              <FormattedMathText text={bestComplexity} />
            </span>
          </div>

          <div className="p-3 rounded bg-amber-50/70 border border-amber-200 text-center">
            <span className="font-mono text-[10px] text-amber-800 uppercase font-bold block">
              Caso Promedio
            </span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-amber-950 mt-1 block">
              <FormattedMathText text={avgComplexity} />
            </span>
          </div>

          <div className="p-3 rounded bg-rose-50/70 border border-rose-200 text-center">
            <span className="font-mono text-[10px] text-rose-800 uppercase font-bold block">
              Peor Caso
            </span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-rose-950 mt-1 block">
              <FormattedMathText text={worstComplexity} />
            </span>
          </div>

          <div className="p-3 rounded bg-indigo-50/70 border border-indigo-200 text-center">
            <span className="font-mono text-[10px] text-indigo-800 uppercase font-bold block">
              Espacio Auxiliar
            </span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-indigo-950 mt-1 block">
              <FormattedMathText text={spaceComplexity} />
            </span>
          </div>
        </div>

        {/* Explicación Intuitiva de la Complejidad */}
        {sheet.complexityExplanation && (
          <div className="p-3.5 rounded bg-surface-container-low border border-paper-border text-xs sm:text-sm text-ink-secondary leading-relaxed mt-4">
            <strong className="text-ink-primary font-bold block font-mono text-xs uppercase mb-1">
              Justificación Matemática e Intuitiva:
            </strong>
            <FormattedMathText text={sheet.complexityExplanation} />
          </div>
        )}

        {/* Ecuación de Recurrencia y Resolución Asintótica */}
        <div className="p-4 rounded-lg bg-surface-container-low border border-paper-border space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
                Ecuación de Recurrencia del Algoritmo
              </h4>
            </div>
            {activeRecInfo.isMasterTheoremApplicable && (
              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800">
                Aplica Teorema Maestro
              </span>
            )}
          </div>

          <div className="p-3 bg-paper-surface border border-paper-border rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="overflow-x-auto py-1.5 max-w-full">
              <span className="font-mono text-[10px] text-ink-muted uppercase block">
                Relación de Recurrencia:
              </span>
              <div className="font-mono text-sm font-bold text-ink-primary mt-0.5">
                <FormattedMathText text={activeRecInfo.recurrence} />
              </div>
            </div>
            <div className="sm:text-right overflow-x-auto py-1.5 max-w-full">
              <span className="font-mono text-[10px] text-ink-muted uppercase block">
                Forma Cerrada:
              </span>
              <div className="font-mono text-sm font-extrabold text-emerald-950 mt-0.5">
                <FormattedMathText text={activeRecInfo.closedForm} />
              </div>
            </div>
          </div>

          <div className="text-xs text-ink-secondary leading-relaxed space-y-1">
            <p>
              <strong className="text-ink-primary font-mono text-[11px] uppercase mr-1">
                Método:
              </strong>
              <FormattedMathText text={activeRecInfo.method} />
            </p>
            <p>
              <strong className="text-ink-primary font-mono text-[11px] uppercase mr-1">
                Justificación:
              </strong>
              <FormattedMathText text={activeRecInfo.explanation} />
            </p>
          </div>
        </div>

        {/* Marco Teórico Formal: Teorema Maestro para Divide y Vencerás */}
        <div className="p-4 rounded-lg bg-paper-surface border border-paper-border shadow-xs space-y-3 mt-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
              Marco Teórico: Teorema Maestro (Master Theorem)
            </h4>
          </div>

          <p className="text-xs text-ink-secondary leading-relaxed">
            Resuelve recurrencias canónicas de algoritmos divide y vencerás de la forma:
          </p>

          <div className="p-3 bg-surface-container-low border border-paper-border rounded text-center overflow-x-auto py-1.5">
            <span className="font-mono text-sm sm:text-base font-bold text-ink-primary">
              <FormattedMathText text="$T(n) = aT(n/b) + \Theta(n^d)$" />
            </span>
            <span className="block font-mono text-[10px] text-ink-muted mt-1">
              donde <FormattedMathText text="$a \ge 1$" />, <FormattedMathText text="$b > 1$" />, <FormattedMathText text="$d \ge 0$" />
            </span>
          </div>

          {/* 3 Casos del Teorema Maestro */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div
              className={`p-2.5 rounded border text-xs ${
                activeRecInfo.masterTheoremDetails?.caseNumber === 1
                  ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                  : 'bg-surface-container-low border-paper-border'
              }`}
            >
              <span className="font-mono text-[10px] font-bold text-ink-primary block mb-0.5">
                Caso 1: <FormattedMathText text="$d < \log_b a$" />
              </span>
              <div className="font-mono text-xs font-bold text-indigo-900 mt-1 overflow-x-auto py-1.5">
                <FormattedMathText text="$T(n) = \Theta(n^{\log_b a})$" />
              </div>
              <span className="text-[10px] text-ink-muted leading-tight mt-1 block">
                Dominan las hojas del árbol.
              </span>
            </div>

            <div
              className={`p-2.5 rounded border text-xs ${
                activeRecInfo.masterTheoremDetails?.caseNumber === 2
                  ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                  : 'bg-surface-container-low border-paper-border'
              }`}
            >
              <span className="font-mono text-[10px] font-bold text-ink-primary block mb-0.5">
                Caso 2: <FormattedMathText text="$d = \log_b a$" />
              </span>
              <div className="font-mono text-xs font-bold text-indigo-900 mt-1 overflow-x-auto py-1.5">
                <FormattedMathText text="$T(n) = \Theta(n^d \log n)$" />
              </div>
              <span className="text-[10px] text-ink-muted leading-tight mt-1 block">
                Trabajo equilibrado por nivel.
              </span>
            </div>

            <div
              className={`p-2.5 rounded border text-xs ${
                activeRecInfo.masterTheoremDetails?.caseNumber === 3
                  ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                  : 'bg-surface-container-low border-paper-border'
              }`}
            >
              <span className="font-mono text-[10px] font-bold text-ink-primary block mb-0.5">
                Caso 3: <FormattedMathText text="$d > \log_b a$" />
              </span>
              <div className="font-mono text-xs font-bold text-indigo-900 mt-1 overflow-x-auto py-1.5">
                <FormattedMathText text="$T(n) = \Theta(n^d)$" />
              </div>
              <span className="text-[10px] text-ink-muted leading-tight mt-1 block">
                Domina el trabajo en la raíz.
              </span>
            </div>
          </div>

          {activeRecInfo.masterTheoremDetails && (
            <div className="p-2.5 bg-indigo-50/60 border border-indigo-200 rounded text-xs text-indigo-950 font-mono">
              <span>Aplicación en este módulo: </span>
              <FormattedMathText
                text={`$a=${activeRecInfo.masterTheoremDetails.a}$, $b=${activeRecInfo.masterTheoremDetails.b}$, $d=${activeRecInfo.masterTheoremDetails.d} \\implies ${activeRecInfo.masterTheoremDetails.condition}$`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
