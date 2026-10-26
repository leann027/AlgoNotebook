import React, { useState, useRef, useEffect } from 'react';
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Gauge,
  ChevronDown,
} from 'lucide-react';
import type { TraceFrame } from '../../core/types';

export interface RulerControlBarProps {
  frame: TraceFrame;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onScrub: (step: number) => void;
  onSpeedChange?: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1.0, 2.0, 4.0];

export const RulerControlBar = React.memo<RulerControlBarProps>(({
  frame,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onStepBack,
  onStepForward,
  onScrub,
  onSpeedChange,
}) => {
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const rafScrubRef = useRef<number | null>(null);
  const pendingScrubStepRef = useRef<number | null>(null);

  const handleScrubChange = (newStep: number) => {
    pendingScrubStepRef.current = newStep;
    if (rafScrubRef.current === null) {
      rafScrubRef.current = requestAnimationFrame(() => {
        if (pendingScrubStepRef.current !== null) {
          onScrub(pendingScrubStepRef.current);
          pendingScrubStepRef.current = null;
        }
        rafScrubRef.current = null;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (rafScrubRef.current !== null) {
        cancelAnimationFrame(rafScrubRef.current);
        rafScrubRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setIsSpeedMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalSteps = Math.max(1, frame.totalSteps);
  const currentStep = Math.min(Math.max(1, frame.stepIndex), totalSteps);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-paper-surface border-t border-paper-border shadow-lg z-30 flex flex-col">
      {/* Millimeter & Centimeter Measurement Calibration Ruler */}
      <div className="w-full ruler-ticks border-b border-paper-border/60 opacity-80" />

      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-1.5 sm:py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-1.5 gap-x-2 sm:gap-4">
        {/* Playback Apparatus: Core Transport Triggers */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Step Backward */}
          <button
            type="button"
            onClick={onStepBack}
            disabled={currentStep <= 1}
            className="w-8 h-8 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-ink-primary flex items-center justify-center active:translate-y-0.5 transition-transform shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none cursor-pointer"
            title="Paso anterior"
            aria-label="Paso anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Apparatus Button */}
          <button
            type="button"
            onClick={onPlayPause}
            className="h-8 sm:h-9 px-2.5 sm:px-4 rounded bg-ink-primary hover:bg-ink-primary/90 text-paper-surface flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5 transition-transform font-mono text-xs font-bold shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none cursor-pointer"
            title={isPlaying ? 'Pausar motor de pasos' : 'Ejecutar motor de pasos'}
            aria-label={isPlaying ? 'Pausar motor de pasos' : 'Ejecutar motor de pasos'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-paper-surface" />
                <span className="hidden sm:inline">Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-paper-surface" />
                <span className="hidden sm:inline">Iniciar</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            type="button"
            onClick={onStepForward}
            disabled={currentStep >= totalSteps}
            className="w-8 h-8 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-ink-primary flex items-center justify-center active:translate-y-0.5 transition-transform shrink-0 focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none cursor-pointer"
            title="Paso siguiente"
            aria-label="Paso siguiente"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slide-Rule Scrubber */}
        <div className="order-3 sm:order-none w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 sm:min-w-[80px] max-w-none sm:max-w-md">
          <span className="font-mono text-[11px] sm:text-xs text-ink-muted select-none whitespace-nowrap">
            0
          </span>
          <div className="relative w-full flex items-center min-w-[80px]">
            <input
              type="range"
              min={1}
              max={totalSteps}
              value={currentStep}
              onChange={(e) => handleScrubChange(Number(e.target.value))}
              className="w-full min-w-[80px] h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-ink-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary"
              title="Deslizador de pasos"
              aria-label="Deslizador de pasos"
            />
          </div>
          <span className="font-mono text-[11px] sm:text-xs text-ink-primary font-bold whitespace-nowrap min-w-[3.5rem] sm:min-w-[4.5rem] text-center inline-block">
            {currentStep} / {totalSteps}
          </span>
        </div>

        {/* Right Controls: Speed Selector Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative inline-block text-left" ref={speedMenuRef}>
            <button
              type="button"
              onClick={() => setIsSpeedMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low text-ink-primary font-mono text-xs focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none cursor-pointer"
              aria-expanded={isSpeedMenuOpen}
              aria-haspopup="listbox"
              aria-label="Velocidad de reproducción"
            >
              <Gauge className="w-3.5 h-3.5 text-ink-secondary" />
              <span className="text-[11px] sm:text-xs">{playbackSpeed.toFixed(1)}x<span className="hidden sm:inline"> Vel</span></span>
              <ChevronDown
                className={`w-3 h-3 text-ink-secondary transition-transform ${
                  isSpeedMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isSpeedMenuOpen && (
              <div
                className="absolute right-0 bottom-full mb-1 w-32 bg-paper-surface border border-paper-border rounded shadow-lg py-1 z-40"
                role="listbox"
              >
                <div className="px-3 py-1 font-mono text-[10px] text-ink-muted border-b border-paper-border uppercase">
                  Velocidad
                </div>
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => {
                      onSpeedChange?.(speed);
                      setIsSpeedMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 font-mono text-xs transition-colors flex items-center justify-between cursor-pointer focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none ${
                      playbackSpeed === speed
                        ? 'bg-surface-container-low text-ink-primary font-bold'
                        : 'text-ink-secondary hover:bg-surface-container-low hover:text-ink-primary'
                    }`}
                  >
                    <span>{speed.toFixed(1)}x</span>
                    {playbackSpeed === speed && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
});

RulerControlBar.displayName = 'RulerControlBar';

