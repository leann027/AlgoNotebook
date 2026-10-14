import { Component, type ErrorInfo, type ReactNode } from 'react';

import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallbackTitle?: string;
  readonly onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper-base p-4 text-ink-primary selection:bg-highlighter-compare">
          <section
            role="alert"
            className="w-full max-w-lg rounded-xl border border-paper-border bg-paper-surface p-6 shadow-tactile-card"
          >
            <div className="flex items-center gap-3 border-b border-paper-border pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-300 bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-headline text-base font-extrabold text-ink-primary">
                  {this.props.fallbackTitle ?? 'Error al inicializar el cuaderno'}
                </h1>
                <p className="font-mono text-[11px] text-ink-muted">
                  Se interceptó una anomalía en el ciclo de renderizado.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded border border-paper-border bg-surface-container-low/70 p-3 font-mono text-xs">
              <p className="font-bold text-rose-700">
                {this.state.error?.name ?? 'Error'}: {this.state.error?.message ?? 'Error inesperado'}
              </p>
              {this.state.error?.stack && (
                <pre className="mt-2 max-h-32 overflow-x-auto overflow-y-auto text-[10px] leading-relaxed text-ink-secondary">
                  {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                </pre>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center gap-1.5 rounded border border-paper-border bg-paper-surface px-3 py-1.5 font-mono text-[11px] font-medium text-ink-secondary hover:bg-surface-container-low hover:text-ink-primary transition-colors cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Volver al inicio</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-1.5 rounded border border-ink-primary bg-ink-primary px-3.5 py-1.5 font-mono text-[11px] font-bold text-paper-surface hover:bg-ink-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reiniciar laboratorio</span>
              </button>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}
