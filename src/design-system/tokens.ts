/**
 * Design Tokens & Tactile Stationery Classes
 * Conforme a Stitch / PRD-ALGO-2025
 */

export const DESIGN_TOKENS = {
  colors: {
    paperBase: '#FDFBF7',
    paperSurface: '#FFFFFF',
    paperBorder: '#E5E0D8',
    paperGrid: '#EAE5DC',
    inkPrimary: '#1E232A',
    inkSecondary: '#4B5563',
    inkMuted: '#5A6474',
    highlighterCompare: '#FEF08A',
    highlighterSwap: '#FFD7BA',
    highlighterSuccess: '#BBF7D0',
    highlighterPointer: '#E9D5FF',
    surfaceContainerLow: '#F5F3EF',
    surfaceContainer: '#EFEEEA',
    surfaceContainerHigh: '#EAE8E4',
  },
  darkColors: {
    paperBase: '#0E1116',
    paperSurface: '#161B22',
    paperBorder: '#30363D',
    paperGrid: '#21262D',
    inkPrimary: '#F0F6FC',
    inkSecondary: '#94A3B8',
    inkMuted: '#8B949E',
    highlighterCompare: '#423812',
    highlighterSwap: '#4A2818',
    highlighterSuccess: '#143823',
    highlighterPointer: '#321F4E',
    surfaceContainerLow: '#12161D',
    surfaceContainer: '#1C2129',
    surfaceContainerHigh: '#242B35',
  },
  typography: {
    fontSans: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontHeadline: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
  },
} as const;

/**
 * Clases de utilidad Tailwind para elementos táctiles y estética de papelería de ingeniería.
 */
export const TACTILE_BUTTON =
  'inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low text-ink-primary text-xs font-medium active:translate-y-0.5 transition-transform duration-100 ease-out focus:outline-none focus:ring-1 focus:ring-ink-primary/20 select-none cursor-pointer';

export const TACTILE_BUTTON_PRIMARY =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-ink-primary text-paper-surface hover:bg-ink-primary/90 text-xs font-headline font-bold active:translate-y-0.5 transition-transform duration-100 shadow-xs focus:outline-none select-none cursor-pointer';

export const TACTILE_BUTTON_ICON =
  'p-1.5 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-low text-ink-secondary hover:text-ink-primary active:translate-y-0.5 transition-transform duration-100 focus:outline-none select-none cursor-pointer';

export const TACTILE_BUTTON_GHOST =
  'p-1.5 rounded hover:bg-surface-container-low hover:text-ink-primary text-ink-secondary active:translate-y-0.5 transition-transform duration-100 focus:outline-none select-none cursor-pointer';

export const TACTILE_CARD =
  'bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card';

export const ARCHIVAL_STAMP =
  'inline-flex items-center px-2 py-0.5 rounded border border-paper-border bg-surface-container-low text-ink-secondary font-mono text-[11px] tracking-wide select-none';

export const HEADER_NAV_TAB =
  'pb-1 transition-colors cursor-pointer select-none text-xs font-medium';

export const HEADER_NAV_TAB_ACTIVE =
  'text-ink-primary border-b-2 border-ink-primary font-bold';

export const HEADER_NAV_TAB_INACTIVE =
  'text-ink-secondary hover:text-ink-primary';

export const TACTILE_SWITCH_CONTAINER =
  'flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded border border-paper-border select-none';

export const TACTILE_SWITCH_TRACK =
  'w-7 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none flex items-center cursor-pointer';

export const TACTILE_SWITCH_THUMB =
  'w-3 h-3 bg-paper-surface rounded-full shadow-sm transform transition-transform duration-200';

export const POSTIT_NOTE =
  'bg-highlighter-compare/40 border border-amber-300 dark:border-amber-700/60 rounded p-3 shadow-postit text-ink-primary';

export const DOT_GRID = 'dot-grid';

export const RULER_TICKS = 'ruler-ticks';

export const DROPDOWN_MENU =
  'bg-paper-surface border border-paper-border rounded-lg shadow-tactile-card py-1.5';

export const DROPDOWN_HEADER =
  'px-3.5 py-2 border-b border-paper-border bg-surface-container-low/70 flex justify-between items-center select-none font-mono text-[10px] font-bold text-ink-primary uppercase tracking-wider';

export const DROPDOWN_ITEM =
  'w-full text-left px-3 py-1.5 text-xs transition-colors text-ink-secondary hover:bg-surface-container-low hover:text-ink-primary cursor-pointer';

export const DROPDOWN_ITEM_ACTIVE =
  'bg-surface-container text-ink-primary font-bold';

export const KBD_TAG =
  'px-2 py-0.5 font-mono text-[11px] font-bold bg-paper-surface border border-paper-border rounded shadow-xs text-ink-primary';
