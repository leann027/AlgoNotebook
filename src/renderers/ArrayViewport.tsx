import React from 'react';
import { ArrowUpDown, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import type { ElementState, ActiveAction } from '../core/types';

export interface ArrayViewportProps {
  array: number[];
  elementStates: Record<number, ElementState>;
  pointers?: Record<string, number>;
  activeAction?: ActiveAction;
  isBinarySearch?: boolean;
  transitionDurationMs?: number;
  className?: string;
}

export const ArrayViewport = React.memo<ArrayViewportProps>(({
  array,
  elementStates,
  pointers,
  isBinarySearch = false,
  transitionDurationMs = 200,
  className = '',
}) => {
  const maxVal = Math.max(...array, 1);
  const isLowHighDefined = Boolean(
    pointers &&
    typeof pointers.low === 'number' &&
    typeof pointers.high === 'number'
  );

  const getPointersForIndex = (index: number): string[] => {
    if (!pointers) return [];
    return Object.entries(pointers)
      .filter(([, val]) => val === index)
      .map(([key]) => key);
  };

  return (
    <div className={`w-full flex-1 flex flex-col justify-end pt-4 pb-2 ${className}`}>
      {array.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-ink-muted font-mono text-xs gap-2 select-none">
          <span>No hay elementos cargados en el arreglo.</span>
          <span className="text-[11px] text-ink-secondary">
            Ingresa números en la barra superior o presiona "Aleatorio" para inicializar.
          </span>
        </div>
      ) : (
        <div className="h-64 w-full flex items-end justify-center px-2 md:px-8 border-b-2 border-ink-primary relative">
          {/* Y-Axis Grid reference lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="w-full border-b border-dashed border-ink-primary" />
            <div className="w-full border-b border-dashed border-ink-primary" />
            <div className="w-full border-b border-dashed border-ink-primary" />
            <div className="w-full border-b border-dashed border-ink-primary" />
          </div>

          {/* Contenedor centralizado de barras proporcionales */}
          <div
            className="w-full flex items-end justify-center gap-2 sm:gap-3.5 h-full relative z-10"
            style={{ maxWidth: `${Math.min(760, Math.max(300, array.length * 75))}px` }}
          >
            {/* BARS */}
            {array.map((val, idx) => {
              const state: ElementState = elementStates[idx] || 'default';
              const pointersAtIdx = getPointersForIndex(idx);
              const heightPercent = Math.max(16, Math.round((val / maxVal) * 100));

              const isComparing = state === 'comparing';
              const isSwapping = state === 'swapping';
              const isSorted = state === 'sorted';
              const isPivot = (state as string) === 'pivot';

              const isOutOfSearchRange =
                isBinarySearch &&
                isLowHighDefined &&
                pointers !== undefined &&
                (idx < pointers.low || idx > pointers.high);

              return (
                <div
                  key={idx}
                  className={`flex-1 max-w-[64px] flex flex-col items-center h-full justify-end ${
                    isComparing || isSwapping ? 'z-20' : 'z-10 group'
                  } ${isOutOfSearchRange ? 'opacity-35 grayscale' : ''}`}
                >
                  {/* Top Value Label */}
                  <div className="mb-1 flex flex-col items-center">
                    {isComparing ? (
                      <span className="px-1.5 py-0.5 rounded bg-highlighter-compare border border-ink-primary font-mono text-xs font-bold text-ink-primary shadow-sm">
                        {val}
                      </span>
                    ) : isSwapping ? (
                      <span className="px-1.5 py-0.5 rounded bg-highlighter-swap border border-ink-primary font-mono text-xs font-bold text-ink-primary shadow-sm">
                        {val}
                      </span>
                    ) : isPivot ? (
                      <span className="px-1.5 py-0.5 rounded bg-[#DDD6FE] border-[2.5px] border-[#7C3AED] font-mono text-xs font-bold text-[#7C3AED] shadow-sm">
                        {val}
                      </span>
                    ) : isSorted ? (
                      <span className="px-1.5 py-0.5 rounded bg-highlighter-success border border-ink-primary font-mono text-xs font-bold text-ink-primary">
                        {val}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-ink-primary font-semibold">
                        {val}
                      </span>
                    )}
                  </div>

                  {/* Vertical Bar */}
                  <div
                    style={{
                      height: '100%',
                      transform: `scaleY(${heightPercent / 100})`,
                      transformOrigin: 'bottom',
                      transitionDuration: `${transitionDurationMs}ms`,
                    }}
                    className={`w-full max-w-[56px] rounded-t transition-transform will-change-transform ease-out ${
                      isOutOfSearchRange
                        ? 'opacity-35 grayscale bg-surface-container-low border-dashed border-[2px] border-ink-muted/60'
                        : isComparing
                        ? 'bg-highlighter-compare border-[2.5px] border-ink-primary ring-2 ring-highlighter-compare/50 flex flex-col justify-between items-center py-2'
                        : isSwapping
                        ? 'bg-highlighter-swap border-[2.5px] border-ink-primary ring-2 ring-highlighter-swap/50 flex flex-col justify-between items-center py-2'
                        : isPivot
                        ? 'bg-[#DDD6FE] border-[2.5px] border-[#7C3AED] ring-2 ring-[#DDD6FE]/60 flex flex-col justify-between items-center py-2'
                        : isSorted
                        ? 'bg-highlighter-success border-[2px] border-ink-primary flex flex-col justify-start items-center pt-2'
                        : 'bg-paper-surface border-[2px] border-ink-primary group-hover:bg-surface-container-low'
                    }`}
                  >
                    {isComparing && (
                      <>
                        <ArrowUpDown className="w-3 h-3 text-ink-primary" />
                        <span className="font-mono text-[10px] font-bold text-ink-primary">
                          CMP
                        </span>
                      </>
                    )}
                    {isSwapping && (
                      <>
                        <ArrowLeftRight className="w-3 h-3 text-ink-primary" />
                        <span className="font-mono text-[10px] font-bold text-ink-primary">
                          SWP
                        </span>
                      </>
                    )}
                    {isPivot && (
                      <span className="font-mono text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider">
                        PIVOT
                      </span>
                    )}
                    {isSorted && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-ink-primary" />
                    )}
                  </div>

                  {/* Index and Pointer badges below baseline */}
                  <div className="w-full flex flex-col items-center mt-1">
                    <span
                      className={`font-mono text-xs ${
                        isComparing || isSwapping
                          ? 'font-bold text-ink-primary'
                          : isPivot
                          ? 'font-bold text-[#7C3AED]'
                          : isSorted
                          ? 'font-semibold text-ink-primary'
                          : 'text-ink-muted'
                      }`}
                    >
                      {idx}
                    </span>

                    {/* Sorted Chip */}
                    {isSorted && (
                      <span className="mt-0.5 px-1 bg-highlighter-success text-ink-primary font-mono text-[8px] rounded border border-ink-primary">
                        Ordenado
                      </span>
                    )}

                    {/* Pivot Chip */}
                    {isPivot && (
                      <span className="mt-0.5 px-1 bg-[#DDD6FE] text-[#7C3AED] font-mono text-[8px] font-bold rounded border border-[#7C3AED]">
                        Pivote
                      </span>
                    )}

                    {/* Pointer Cursor Chips */}
                    {pointersAtIdx.map((ptrName) => (
                      <span
                        key={ptrName}
                        className="mt-0.5 px-1 py-0.2 bg-highlighter-pointer text-ink-primary font-mono text-[9px] rounded border border-ink-primary uppercase tracking-tighter"
                      >
                        {ptrName}={idx}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Baseline Sub-Axis Legend */}
      <div className="flex items-center justify-between pt-2 px-4 text-ink-muted font-mono text-xs">
        <span>← Recorrido de Índices y Punteros</span>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-compare border border-ink-primary inline-block" />
          <span className="text-ink-secondary mr-2">Comparar</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-swap border border-ink-primary inline-block" />
          <span className="text-ink-secondary mr-2">Intercambiar</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-[#DDD6FE] border border-[#7C3AED] inline-block" />
          <span className="text-ink-secondary mr-2">Pivote</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-highlighter-success border border-ink-primary inline-block" />
          <span className="text-ink-secondary">Fijado / Ordenado</span>
        </div>
      </div>
    </div>
  );
});

ArrayViewport.displayName = 'ArrayViewport';
