import React from 'react';

export interface StickyExplanationNoteProps {
  step: number;
  totalSteps: number;
  explanation: string;
  stepLabel?: string;
  subNote?: string;
  subNotes?: string[];
  className?: string;
}

export const StickyExplanationNote: React.FC<StickyExplanationNoteProps> = ({
  step,
  totalSteps,
  explanation,
  stepLabel,
  subNote,
  subNotes,
  className = '',
}) => {
  return (
    <div
      className={`self-start relative max-w-md min-h-[64px] bg-[#FFFBEA] border border-[#FDE047] rounded-sm p-3 shadow-postit transform -rotate-1 transition-all duration-150 hover:rotate-0 z-20 ${className}`}
    >
      {/* Sticky Tape Visual at top center */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-white/70 border-t border-b border-paper-border rotate-2 backdrop-blur-[1px]" />
      <div className="flex items-start gap-2 pt-1">
        <span className="text-sm select-none" role="img" aria-label="pin">
          📌
        </span>
        <div className="text-xs text-ink-primary leading-snug">
          <span className="font-bold font-mono uppercase tracking-wide mr-1.5">
            {stepLabel || `Paso ${step} de ${totalSteps}:`}
          </span>
          <span>{explanation}</span>
          {subNote && (
            <div className="mt-1 text-ink-secondary italic text-[11px]">
              {subNote}
            </div>
          )}
          {subNotes &&
            subNotes.map((sn, idx) => (
              <div key={idx} className="mt-1 text-ink-secondary italic text-[11px]">
                {sn}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
