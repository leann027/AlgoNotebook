---
id: module-hooks
title: "hooks/ — Hooks de React reutilizables"
type: module
status: stable
tags:
  - algonotebook/module
  - area/hooks
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[src/core/README]]"
  - "[[src/components/README]]"
---

# `src/hooks/` — Hooks de React reutilizables

Utilidades de React compartidas por las distintas apps del proyecto. Convención: `useXxx.ts` (camelCase).

## 📄 `useKeyboardShortcuts.ts`

Captura global de atajos de teclado del laboratorio. Ignora eventos originados en campos editables
(`input`, `textarea`, `select`, `contenteditable`).

Interfaz: `KeyboardShortcutsHandlers` (callbacks opcionales) y `SHORTCUTS_HELP_LIST` (para el modal de ayuda).

| Tecla | Acción |
| --- | --- |
| `Space` | Reproducir / Pausar |
| `→` | Paso adelante |
| `←` | Paso atrás |
| `R` | Reiniciar |
| `1` / `2` / `3` | Velocidad 0.5x / 1.0x / 2.0x |
| `L` | Alternar visor de código C ↔ Python |
| `?` | Abrir/cerrar la ayuda de atajos |

> El hook de reproducción **no** vive aquí, sino en `src/core/usePlayback.ts` (es dependencia de
> contratos del dominio). Este directorio es para hooks transversales de UI.
