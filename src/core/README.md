---
id: module-core
title: "core/ — Contratos y motor de reproducción"
type: module
status: stable
tags:
  - algonotebook/module
  - area/core
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Diseño - Contrato TraceFrame]]"
  - "[[src/algorithms/README]]"
  - "[[src/math/README]]"
---

# `src/core/` — Núcleo: contratos y reproducción

Aquí viven los **tipos compartidos** y el **motor de reproducción** que todas las capas importan.
Es la dependencia más estable del proyecto (sin dependencias de UI).

## 📄 Archivos

| Archivo | Contenido |
| --- | --- |
| `types.ts` | Contratos de DSA: `SupportedLang`, `HighlightLines`, `ActiveAction`, `ElementState`, `TraceFrame`, `AlgorithmDefinition`, métricas de comparación, etc. |
| `mathTypes.ts` | Contratos de matemáticas: `MathTopic`, `MathTopicModule`, `MathTraceFrame`, `ProofStep`, `ParametricControl` y los `*Snapshot` de cada viewport. |
| `usePlayback.ts` | Hook de React que controla la línea de tiempo (play/pause/step/velocidad) **con limpieza de temporizadores**. |
| `index.ts` | Barrel: `export * from './types' | './mathTypes' | './usePlayback'`. |

## 📐 Notas de diseño

- Sin `any`: todo se modela con **uniones discriminadas**.
- `HighlightLines` es el corazón de la sincronización multilenguaje **C99 ↔ Python 3**: cada fotograma
  indica qué líneas iluminar en cada lenguaje.
- Los colores de resaltador no viven aquí; son responsabilidad del `design-system` y de `ElementState`.
- `usePlayback` es el **único** punto donde se permite gestionar tiempo; la lógica de algoritmos es pura.

> ⚠️ Nota histórica: la documentación antigua mencionaba un `core/PlaybackEngine.ts` que **no existe**;
> la reproducción real vive en `usePlayback.ts`.
