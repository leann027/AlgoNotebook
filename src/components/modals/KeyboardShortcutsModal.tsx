import React, { useEffect, useId } from 'react';
import { Keyboard, X } from 'lucide-react';
import { SHORTCUTS_HELP_LIST } from '../../hooks/useKeyboardShortcuts';
import { TACTILE_CARD } from '../../design-system/tokens';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const titleId = useId();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 bg-ink-primary/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-fade-in overscroll-contain"
      onClick={onClose}
    >
      <div
        className={`bg-paper-surface border border-paper-border rounded-lg ${TACTILE_CARD} w-full max-w-md p-5 text-ink-primary relative select-none animate-modal-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-paper-border mb-4 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Keyboard className="w-5 h-5 text-ink-primary shrink-0" />
            <h3
              id={titleId}
              className="font-headline font-bold text-sm tracking-tight text-ink-primary truncate"
            >
              Atajos de Teclado del Laboratorio
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-container-high transition-colors shrink-0 ml-2 cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none"
            title="Cerrar (Esc)"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto overscroll-contain pr-1">
          {SHORTCUTS_HELP_LIST.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface-container-low border border-paper-border text-xs"
            >
              <span className="text-ink-secondary font-medium">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] font-bold bg-paper-surface border border-paper-border rounded shadow-xs text-ink-primary">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-paper-border text-[11px] font-mono text-ink-muted leading-relaxed">
          💡 Presiona <kbd className="px-1 bg-surface-container border border-paper-border rounded text-[10px]">Esc</kbd> para cerrar. Los atajos se ignoran al escribir en campos de texto.
        </div>
      </div>
    </div>
  );
};
