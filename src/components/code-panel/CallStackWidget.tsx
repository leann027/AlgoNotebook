import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';
import type { StackFrame } from '../../core/types';

export interface CallStackWidgetProps {
  callStack?: StackFrame[];
  className?: string;
}

/**
 * CallStackWidget — Visual Call Stack Component for AlgoNotebook
 *
 * Displays the recursion execution stack (LIFO) adhering to the tactile
 * laboratory notebook design system.
 */
export const CallStackWidget: React.FC<CallStackWidgetProps> = ({
  callStack,
  className = '',
}) => {
  const depth = callStack?.length ?? 0;

  // LIFO representation: top/active frame displayed at the top
  const displayedFrames = useMemo(() => {
    if (!callStack || callStack.length === 0) return [];

    // If the first element is explicitly marked as active, caller provided it top-first
    if (callStack[0]?.isActive === true) {
      return [...callStack];
    }
    // If the last element is active or neither end has explicit isActive,
    // standard stack push order has the top of stack at the end.
    // Reversing puts the active/top frame at index 0 (visual top).
    return [...callStack].reverse();
  }, [callStack]);

  return (
    <div
      className={`bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card overflow-hidden flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-paper-border bg-surface-container-high px-3 py-2 select-none">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-ink-primary" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-primary">
            Pila de Llamadas: Traza Recursiva
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded border border-paper-border bg-paper-surface text-ink-secondary shadow-sm">
            {depth === 0 ? 'Profundidad: 0' : `${depth} ${depth === 1 ? 'marco' : 'marcos'}`}
          </span>
        </div>
      </div>

      {/* Call Stack Content */}
      <div className="p-3 bg-paper-surface flex-1 overflow-y-auto">
        {depth === 0 ? (
          <div className="p-4 flex flex-col items-center justify-center text-center text-ink-muted min-h-[140px] bg-surface-container-low/40 border border-dashed border-paper-border rounded">
            <Layers className="w-8 h-8 mb-2 text-ink-muted/50 stroke-[1.5]" />
            <p className="font-mono text-xs font-semibold text-ink-secondary mb-1">
              Sin marcos de llamada activos (Algoritmo iterativo / Contexto único)
            </p>
            <p className="text-[11px] text-ink-muted max-w-xs leading-normal">
              El algoritmo actual se ejecuta de forma iterativa con profundidad de pila constante.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Top of stack label */}
            <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted px-1 select-none">
              <span>▲ TOPE DE LA PILA (LIFO)</span>
              <span>PROFUNDIDAD: {depth}</span>
            </div>

            {/* Frame List */}
            {displayedFrames.map((frame, index) => {
              const isTop = index === 0;
              const isActive = frame.isActive ?? isTop;
              const entries = Object.entries(frame.args);

              return (
                <div
                  key={frame.id || `frame-${index}`}
                  className={`p-2.5 rounded transition-all ${
                    isActive
                      ? 'bg-highlighter-pointer/20 border-l-4 border-ink-primary border-t border-r border-b border-paper-border shadow-sm'
                      : 'bg-surface-container-low/60 border-l-2 border-paper-border border-t border-r border-b border-paper-border/60 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {/* Active/Suspended Badge */}
                    <div className="flex items-center gap-1.5">
                      {isActive ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-ink-primary" />
                          </span>
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-highlighter-pointer text-ink-primary border border-ink-primary/30 tracking-wider">
                            ACTIVO
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-[9px] font-medium px-1.5 py-0.5 rounded bg-surface-container-high text-ink-secondary border border-paper-border tracking-wider">
                          SUSPENDIDO
                        </span>
                      )}
                    </div>

                    {/* Frame index indicator */}
                    <span className="font-mono text-[10px] text-ink-muted">
                      {isTop ? 'marco[tope]' : `marco[#${depth - index}]`}
                    </span>
                  </div>

                  {/* Function Name and Formatted Arguments */}
                  <div className="font-mono text-xs leading-relaxed break-all">
                    <span
                      className={
                        isActive
                          ? 'font-bold text-ink-primary'
                          : 'font-medium text-ink-secondary'
                      }
                    >
                      {frame.functionName}
                    </span>
                    <span className="text-ink-secondary">(</span>
                    {entries.map(([key, val], argIdx) => (
                      <span key={key}>
                        <span className="text-ink-secondary">{key}=</span>
                        <span
                          className={
                            isActive
                              ? 'font-bold text-ink-primary'
                              : 'font-semibold text-ink-secondary'
                          }
                        >
                          {String(val)}
                        </span>
                        {argIdx < entries.length - 1 && (
                          <span className="text-ink-muted mr-1">, </span>
                        )}
                      </span>
                    ))}
                    <span className="text-ink-secondary">)</span>
                  </div>

                  {/* Status annotation */}
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-ink-muted">
                    <span>
                      {isActive
                        ? '↳ Ámbito en ejecución actual'
                        : '↳ Suspendido (esperando retorno)'}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Base call label */}
            <div className="pt-1 text-[10px] font-mono text-ink-muted px-1 text-center select-none border-t border-paper-border/60">
              ▼ LLAMADA BASE (CONTEXTO INICIAL)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
