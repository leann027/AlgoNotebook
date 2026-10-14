import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Check,
  AlertCircle,
} from 'lucide-react';

export interface CustomInputBarProps {
  currentValues: number[];
  onApplyInput: (values: number[]) => void;
  maxElements?: number;
  minElements?: number;
  className?: string;
}

/**
 * CustomInputBar — Barra de Control de Datos Dinámicos para el Lienzo de Estudio
 *
 * Permite ingresar arreglos numéricos personalizados separados por comas,
 * generar secuencias aleatorias calibradas (6-10 elementos entre 5 y 99),
 * validar en tiempo real y reiniciar la ejecución de algoritmos compatibles.
 */
export const CustomInputBar: React.FC<CustomInputBarProps> = ({
  currentValues,
  onApplyInput,
  maxElements = 10,
  minElements = 2,
  className = '',
}) => {
  const serialized = currentValues.join(', ');
  const [prevSerialized, setPrevSerialized] = useState<string>(serialized);
  const [inputValue, setInputValue] = useState<string>(serialized);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<boolean>(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuccessNotice = useCallback(() => {
    if (successTimerRef.current !== null) {
      clearTimeout(successTimerRef.current);
    }
    setSuccessNotice(true);
    successTimerRef.current = setTimeout(() => {
      setSuccessNotice(false);
      successTimerRef.current = null;
    }, 1500);
  }, []);

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // Sincronizar campo si los valores externos cambian (patrón oficial de React para ajustar estado según props)
  if (prevSerialized !== serialized) {
    setPrevSerialized(serialized);
    setInputValue(serialized);
    setErrorMessage(null);
  }

  // Generar conjunto aleatorio óptimo (6 a 10 valores entre 5 y 99)
  const handleGenerateRandom = useCallback(() => {
    const count = Math.floor(Math.random() * 5) + 6; // 6 a 10 elementos
    const generated: number[] = [];
    for (let i = 0; i < count; i++) {
      generated.push(Math.floor(Math.random() * 95) + 5); // 5 a 99
    }
    setInputValue(generated.join(', '));
    setErrorMessage(null);
    onApplyInput(generated);
    showSuccessNotice();
  }, [onApplyInput, showSuccessNotice]);

  // Parsear y validar entrada
  const handleApply = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      const rawItems = inputValue.split(/[\s,]+/);
      const parsed: number[] = [];
      const invalidTokens: string[] = [];

      for (const token of rawItems) {
        const trimmed = token.trim();
        if (!trimmed) continue;
        const num = Number(trimmed);
        if (Number.isInteger(num) && num > 0 && num <= 999) {
          parsed.push(num);
        } else {
          invalidTokens.push(trimmed);
        }
      }

      if (invalidTokens.length > 0) {
        setErrorMessage(`Valores inválidos ignorados: ${invalidTokens.slice(0, 3).join(', ')}`);
        return;
      }

      if (parsed.length < minElements) {
        setErrorMessage(`Ingresa al menos ${minElements} números positivos.`);
        return;
      }

      const clamped = parsed.slice(0, maxElements);
      if (parsed.length > maxElements) {
        setErrorMessage(`Limitado a los primeros ${maxElements} elementos para legibilidad.`);
      } else {
        setErrorMessage(null);
      }

      onApplyInput(clamped);
      showSuccessNotice();
    },
    [inputValue, minElements, maxElements, onApplyInput, showSuccessNotice]
  );

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2.5 px-4 py-2 bg-surface-container-low/70 border-b border-paper-border text-xs ${className}`.trim()}
    >
      {/* Etiqueta e Icono */}
      <div className="flex items-center gap-1.5 text-ink-secondary select-none shrink-0 font-mono text-[11px]">
        <SlidersHorizontal className="w-3.5 h-3.5 text-ink-primary" />
        <span className="font-semibold text-ink-primary">Entrada de Datos:</span>
      </div>

      {/* Formulario de entrada */}
      <form onSubmit={handleApply} className="flex-1 flex items-center gap-2 min-w-[240px]">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="ej. 12, 25, 42, 18, 56, 34"
            className="w-full px-2.5 py-1 font-mono text-xs bg-paper-surface border border-paper-border rounded text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-ink-primary focus:border-ink-primary transition-all"
            aria-label="Valores numéricos de entrada"
          />
        </div>

        {/* Botón Cargar / Reiniciar */}
        <button
          type="submit"
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-ink-primary text-paper-surface hover:bg-ink-primary/90 font-mono text-[11px] font-semibold active:scale-[0.98] transition-all shadow-sm shrink-0"
          title="Cargar datos y reiniciar ejecución del algoritmo"
        >
          {successNotice ? (
            <>
              <Check className="w-3 h-3 text-highlighter-success" />
              <span>Cargado</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-3 h-3" />
              <span>Cargar / Reiniciar</span>
            </>
          )}
        </button>

        {/* Botón Generar Aleatorio */}
        <button
          type="button"
          onClick={handleGenerateRandom}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-paper-surface hover:bg-surface-container-high border border-paper-border text-ink-primary font-mono text-[11px] font-medium active:scale-[0.98] transition-all shrink-0"
          title="Generar entre 6 y 10 valores aleatorios calibrados"
        >
          <Sparkles className="w-3 h-3 text-ink-secondary" />
          <span className="hidden sm:inline">Aleatorio</span>
        </button>
      </form>

      {/* Aviso de error / límite */}
      {errorMessage && (
        <div className="flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shrink-0">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
