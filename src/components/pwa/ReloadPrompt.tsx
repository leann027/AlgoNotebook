import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, CheckCircle2, X } from 'lucide-react';

/**
 * ReloadPrompt — Notificación táctil PWA de estado offline y actualización
 *
 * Muestra una tarjeta adhesiva flotante (estilo post-it de papel crema con sombra táctil)
 * cuando la aplicación está disponible sin conexión o cuando se publica una nueva versión.
 */
export const ReloadPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.warn('PWA ServiceWorker registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <aside
      role="alert"
      aria-live="polite"
      className="fixed bottom-16 right-4 sm:right-6 z-50 max-w-sm bg-[#FFFBEA] border border-[#FDE047] rounded shadow-postit p-3.5 text-ink-primary transition-all animate-in slide-in-from-bottom duration-200 select-none"
    >
      <div className="flex items-start gap-2.5">
        {needRefresh ? (
          <RefreshCw className="w-4 h-4 text-ink-primary shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        )}

        <div className="flex-1 text-xs">
          <p className="font-semibold font-mono tracking-tight text-ink-primary">
            {needRefresh ? 'Nueva versión disponible' : 'Cuaderno listo para uso sin conexión'}
          </p>
          <p className="mt-0.5 text-ink-secondary text-[11px] leading-snug">
            {needRefresh
              ? 'Hay una actualización lista para aplicarse en el navegador.'
              : 'Todos los recursos de visualización han sido cacheados localmente (PWA).'}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            {needRefresh && (
              <button
                type="button"
                onClick={() => updateServiceWorker(true)}
                className="px-2.5 py-1 rounded bg-ink-primary text-paper-surface hover:bg-ink-primary/90 font-mono text-[11px] font-semibold transition-all active:scale-[0.98] shadow-sm"
              >
                Recargar
              </button>
            )}
            <button
              type="button"
              onClick={close}
              className="px-2.5 py-1 rounded bg-paper-surface border border-paper-border hover:bg-surface-container-high text-ink-secondary hover:text-ink-primary font-mono text-[11px] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={close}
          className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-black/5 transition-colors"
          title="Descartar aviso"
          aria-label="Descartar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

