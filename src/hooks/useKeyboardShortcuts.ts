import { useEffect } from 'react';

export interface KeyboardShortcutsHandlers {
  onTogglePlay?: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onReset?: () => void;
  onSetSpeed?: (speed: number) => void;
  onToggleLang?: () => void;
  onToggleHelp?: () => void;
  onToggleTechnicalSheet?: () => void;
}

export interface ShortcutItem {
  key: string;
  description: string;
  category: 'Transporte' | 'Velocidad' | 'Editor';
}

export const SHORTCUTS_HELP_LIST: readonly ShortcutItem[] = [
  { key: 'Space', description: 'Reproducir / Pausar ejecución', category: 'Transporte' },
  { key: '→', description: 'Avanzar un paso (Step Forward)', category: 'Transporte' },
  { key: '←', description: 'Retroceder un paso (Step Backward)', category: 'Transporte' },
  { key: 'R', description: 'Reiniciar datos y ejecución al inicio', category: 'Transporte' },
  { key: 'T', description: 'Abrir / cerrar Ficha Técnica', category: 'Editor' },
  { key: '?', description: 'Abrir / cerrar ayuda de atajos', category: 'Transporte' },
  { key: '1', description: 'Fijar velocidad a 0.5x', category: 'Velocidad' },
  { key: '2', description: 'Fijar velocidad a 1.0x', category: 'Velocidad' },
  { key: '3', description: 'Fijar velocidad a 2.0x', category: 'Velocidad' },
  { key: 'L', description: 'Conmutar visor de código entre C y Python', category: 'Editor' },
];

/**
 * Determina si el evento de teclado se originó en un control editable de formulario.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

/**
 * useKeyboardShortcuts — Captura global de eventos de teclado de laboratorio.
 *
 * Mapeo oficial:
 * - Space: Reproducir / Pausa
 * - ArrowRight: Paso adelante
 * - ArrowLeft: Paso atrás
 * - KeyR / 'r': Reiniciar
 * - Digit1 / Digit2 / Digit3: 0.5x, 1x, 2x
 * - KeyL / 'l': Alternar lenguaje C / Python
 */
export function useKeyboardShortcuts({
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  onSetSpeed,
  onToggleLang,
  onToggleHelp,
  onToggleTechnicalSheet,
}: KeyboardShortcutsHandlers): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar si el usuario está interactuando con inputs de texto
      if (isEditableTarget(event.target)) {
        return;
      }

      // Ignorar combinaciones con modificadores ctrl/meta/alt (ej. Ctrl+R para recarga del navegador)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      // Capturar tecla '?' o 'h' para ayuda
      if (event.key === '?' || (!event.ctrlKey && !event.metaKey && !event.altKey && (event.key === 'h' || event.key === 'H'))) {
        event.preventDefault();
        onToggleHelp?.();
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          onTogglePlay?.();
          break;

        case 'ArrowRight':
          event.preventDefault();
          onStepForward?.();
          break;

        case 'ArrowLeft':
          event.preventDefault();
          onStepBackward?.();
          break;

        case 'KeyR':
          event.preventDefault();
          onReset?.();
          break;

        case 'Digit1':
        case 'Numpad1':
          event.preventDefault();
          onSetSpeed?.(0.5);
          break;

        case 'Digit2':
        case 'Numpad2':
          event.preventDefault();
          onSetSpeed?.(1.0);
          break;

        case 'Digit3':
        case 'Numpad3':
          event.preventDefault();
          onSetSpeed?.(2.0);
          break;

        case 'KeyL':
          event.preventDefault();
          onToggleLang?.();
          break;

        case 'KeyT':
          event.preventDefault();
          onToggleTechnicalSheet?.();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onTogglePlay,
    onStepForward,
    onStepBackward,
    onReset,
    onSetSpeed,
    onToggleLang,
    onToggleHelp,
    onToggleTechnicalSheet,
  ]);
}

