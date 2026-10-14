---
id: contrato-traceframe
title: "Diseño — Contrato TraceFrame"
type: concept
status: stable
tags:
  - algonotebook/concepto
  - area/core
  - arquitectura/contrato
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[src/core/README]]"
  - "[[src/algorithms/README]]"
  - "[[Arquitectura - Zero UI in Logic]]"
---

# Diseño — Contrato TraceFrame

El contrato de datos que hace posible la **sincronización multilenguaje C99 ↔ Python 3** y la
animación determinista. Vive en `src/core/types.ts` (DSA) y `src/core/mathTypes.ts` (matemáticas).

## Piezas clave

| Tipo | Rol |
| --- | --- |
| `SupportedLang` | `'c' \| 'python'` — lenguaje activo del visor. |
| `HighlightLines` | `{ c: number[]; python: number[] }` — líneas a iluminar por lenguaje (índices base 1). |
| `TraceFrame` | Estado de memoria + `highlightLines` + métricas (comparaciones, swaps, …). |
| `ActiveAction` / `ElementState` | Semántica visual que mapea a los resaltadores del design system. |
| `AlgorithmDefinition` | Contrato que implementa cada `index.ts` de módulo. |

## Correspondencia visual de `ElementState`

| Estado | Resaltador |
| --- | --- |
| `compare` | 🟡 Amarillo `#FEF08A` |
| `swap` | 🟠 Coral `#FFD7BA` |
| `locked` | 🟢 Menta `#BBF7D0` |
| `pivot` | 🟣 Lavanda `#E9D5FF` |

## Regla de oro

`HighlightLines` es el **corazón** de la sincronización: cada fotograma declara explícitamente qué
línea de C y qué línea de Python se iluminan, de modo que el visor puede conmutar de lenguaje sin
perder el paso de ejecución.

> [!warning] Sin `any`
> Todo se modela con **uniones discriminadas**; el tipado estricto es obligatorio (ver [[Agents.md]]).
