/**
 * AlgoNotebook — usePlayback Hook
 *
 * Hook de React altamente optimizado para el control temporal de algoritmos.
 * Gestiona estados de reproducción, demoras dinámicas por velocidad (1000ms / speed),
 * y sincronización limpia de setTimeout/clearTimeout con useRef y useEffect para
 * evitar memory leaks, timers huérfanos o desincronizaciones ante scrubs manuales.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { PlaybackSpeed, PlaybackStatus } from './types';

export interface UsePlaybackOptions {
  /** Número total de pasos en la traza (mínimo 1) */
  totalSteps?: number;
  /** Paso inicial (1-based, por defecto 1) */
  initialStep?: number;
  /** Velocidad de reproducción inicial (0.5 | 1.0 | 2.0 | 4.0, por defecto 1.0) */
  initialSpeed?: PlaybackSpeed;
  /** Si debe reiniciar automáticamente al llegar al final */
  loop?: boolean;
}

export interface UsePlaybackReturn {
  /** Índice del paso actual (1-based: 1 .. totalSteps) */
  currentStepIndex: number;
  /** Si la animación está reproduciéndose activamente */
  isPlaying: boolean;
  /** Estado semántico de reproducción ('idle' | 'playing' | 'paused' | 'completed') */
  status: PlaybackStatus;
  /** Velocidad de reproducción activa */
  speed: PlaybackSpeed;
  /** Número total de pasos */
  totalSteps: number;
  /** Inicia la reproducción */
  play: () => void;
  /** Pausa la reproducción */
  pause: () => void;
  /** Alterna entre reproducir y pausar */
  togglePlay: () => void;
  /** Avanza un paso y pausa */
  stepForward: () => void;
  /** Retrocede un paso y pausa */
  stepBackward: () => void;
  /** Salta directamente a un paso específico (1-based) y pausa */
  goToStep: (step: number) => void;
  /** Modifica la velocidad reprogramando el temporizador sin desincronizar */
  setSpeed: (speed: PlaybackSpeed) => void;
  /** Reinicia al paso 1 y detiene la reproducción */
  reset: () => void;
}

/**
 * Hook de React para controlar la reproducción paso a paso de trazas algorítmicas.
 *
 * Soporta dos firmas:
 * - `usePlayback(totalSteps, options?)`
 * - `usePlayback(options)`
 */
export function usePlayback(
  totalStepsOrOptions: number | UsePlaybackOptions = 1,
  extraOptions?: UsePlaybackOptions
): UsePlaybackReturn {
  // Normalización polimórfica de parámetros
  const options: UsePlaybackOptions =
    typeof totalStepsOrOptions === 'number'
      ? { totalSteps: totalStepsOrOptions, ...extraOptions }
      : totalStepsOrOptions;

  const totalSteps = Math.max(1, options.totalSteps ?? 1);
  const initialStep = Math.min(Math.max(1, options.initialStep ?? 1), totalSteps);
  const initialSpeed = options.initialSpeed ?? 1.0;
  const loop = options.loop ?? false;

  // Estados React reactivos
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialStep);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeedState] = useState<PlaybackSpeed>(initialSpeed);

  // Ajuste durante render si totalSteps disminuye por debajo de currentStepIndex (patrón oficial de React para state derived from props)
  const [prevTotalSteps, setPrevTotalSteps] = useState<number>(totalSteps);
  if (totalSteps !== prevTotalSteps) {
    setPrevTotalSteps(totalSteps);
    if (currentStepIndex > totalSteps) {
      setCurrentStepIndex(totalSteps);
    }
  }

  // Referencias mutables para evitar desincronizaciones y stale closures
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalStepsRef = useRef<number>(totalSteps);
  const loopRef = useRef<boolean>(loop);

  useEffect(() => {
    totalStepsRef.current = totalSteps;
  }, [totalSteps]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // Retraso en milisegundos calculado estrictamente como 1000ms / speed:
  // 0.5x -> 2000ms | 1.0x -> 1000ms | 2.0x -> 500ms | 4.0x -> 250ms
  const delayMs = Math.round(1000 / speed);

  // Efecto principal del temporizador de reproducción
  useEffect(() => {
    // Si no está reproduciendo, limpiar cualquier temporizador pendiente
    if (!isPlaying) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Si ya alcanzó el paso final
    if (currentStepIndex >= totalSteps) {
      if (loopRef.current) {
        timerRef.current = setTimeout(() => {
          setCurrentStepIndex(1);
        }, delayMs);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    // Programar el siguiente tick de avance
    timerRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= totalSteps) {
          if (!loopRef.current) {
            setIsPlaying(false);
          }
          return totalSteps;
        }
        return next;
      });
    }, delayMs);

    // Limpieza estricta para evitar timers huérfanos y memory leaks
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speed, currentStepIndex, totalSteps, delayMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // ==========================================================================
  // Métodos de Control Memoizados
  // ==========================================================================

  const play = useCallback(() => {
    setCurrentStepIndex((curr) => (curr >= totalStepsRef.current ? 1 : curr));
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev) {
        setCurrentStepIndex((curr) => (curr >= totalStepsRef.current ? 1 : curr));
        return true;
      }
      return false;
    });
  }, []);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex((curr) => Math.min(totalStepsRef.current, curr + 1));
  }, []);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex((curr) => Math.max(1, curr - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setIsPlaying(false);
    const clamped = Math.min(totalStepsRef.current, Math.max(1, Math.round(step)));
    setCurrentStepIndex(clamped);
  }, []);

  const setSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeedState(newSpeed);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(1);
  }, []);

  // Determinación de estado semántico
  const visibleStepIndex = Math.min(currentStepIndex, totalSteps);
  const status: PlaybackStatus = isPlaying
    ? 'playing'
    : visibleStepIndex >= totalSteps
    ? 'completed'
    : visibleStepIndex === 1
    ? 'idle'
    : 'paused';

  return {
    currentStepIndex: visibleStepIndex,
    isPlaying,
    status,
    speed,
    totalSteps,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    setSpeed,
    reset,
  };
}
