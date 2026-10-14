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

export const RulerControlBar: React.FC<RulerControlBarProps> = ({
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

      <div className="max-w-7xl mx-auto w-full px-4 py-2 flex items-center justify-between gap-4">
        {/* Playback Apparatus: Timeline Scrubber & Core Transport Triggers */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 justify-center max-w-2xl">
          {/* Step Backward */}
          <button
            type="button"
            onClick={onStepBack}
            disabled={currentStep <= 1}
            className="w-8 h-8 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-ink-primary flex items-center justify-center active:translate-y-0.5 transition-transform"
            title="Paso anterior"
            aria-label="Paso anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Apparatus Button */}
          <button
            type="button"
            onClick={onPlayPause}
            className="h-9 px-4 rounded bg-ink-primary hover:bg-ink-primary/90 text-paper-surface flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5 transition-transform font-mono text-xs font-bold"
            title={isPlaying ? 'Pausar motor de pasos' : 'Ejecutar motor de pasos'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-paper-surface" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-paper-surface" />
                <span>Iniciar</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            type="button"
            onClick={onStepForward}
            disabled={currentStep >= totalSteps}
            className="w-8 h-8 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-ink-primary flex items-center justify-center active:translate-y-0.5 transition-transform"
            title="Paso siguiente"
            aria-label="Paso siguiente"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Timeline Slide-Rule Scrubber */}
          <div className="flex-1 flex items-center gap-2 max-w-xs">
            <span className="font-mono text-xs text-ink-muted select-none whitespace-nowrap">
              0
            </span>
            <div className="relative w-full flex items-center">
              <input
                type="range"
                min={1}
                max={totalSteps}
                value={currentStep}
                onChange={(e) => onScrub(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-ink-primary focus:outline-none"
                title="Deslizador de pasos"
              />
            </div>
            <span className="font-mono text-xs text-ink-primary font-bold whitespace-nowrap">
              {currentStep} / {totalSteps}
            </span>
          </div>
        </div>

        {/* Right Controls: Speed Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative inline-block text-left" ref={speedMenuRef}>
            <button
              type="button"
              onClick={() => setIsSpeedMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low text-ink-primary font-mono text-xs"
              aria-expanded={isSpeedMenuOpen}
              aria-haspopup="listbox"
            >
              <Gauge className="w-3.5 h-3.5 text-ink-secondary" />
              <span>{playbackSpeed.toFixed(1)}x Vel</span>
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
                    className={`w-full text-left px-3 py-1.5 font-mono text-xs transition-colors flex items-center justify-between ${
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
};

