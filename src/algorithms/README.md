---
id: module-algorithms
title: "algorithms/ — Catálogo de algoritmos (cero UI)"
type: module
status: stable
tags:
  - algonotebook/module
  - area/algoritmos
  - dsa
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[MOC — Algoritmos (DSA)]]"
  - "[[src/core/README]]"
  - "[[src/renderers/README]]"
  - "[[src/math/README]]"
---

# `src/algorithms/` — Catálogo de algoritmos (cero UI)

Módulos **puros y síncronos**. Cada algoritmo recibe una entrada y devuelve una secuencia inmutable
de fotogramas (`TraceFrame[]`) que las capas de UI consumen para animar.

## 🗂️ Categorías

| Categoría | Módulos |
| --- | --- |
| `sorting/` | bubble-sort, insertion-sort, selection-sort, quick-sort, merge-sort |
| `trees/` | bst, inorder-traversal, preorder-traversal, min-heap, priority-queue, avl-tree |
| `graphs/` | bfs, dfs, dijkstra, kruskal, topological-sort, bellman-ford, strongly-connected-components |
| `dp/` | knapsack, lcs, coin-change, kadane, levenshtein |
| `lists/` | reverse-linked-list, cycle-detection, stack-operations, queue-operations, insert-linked-list |
| `search/` | binary-search, linear-binary-search |

## 🧩 Estructura de un módulo

```text
algorithms/sorting/bubble-sort/
├── index.ts     # Exporta `<name>Module: AlgorithmDefinition` (ficha técnica + generador)
├── trace.ts     # Generador PURO de TraceFrame[] (sin DOM, sin timers)
├── code.c       # Fuente C99 idiomática (archivo estático, cargado con ?raw)
└── code.py      # Fuente Python 3 idiomática
```

## 📐 Contrato de datos (`src/core/types.ts`)

- `SupportedLang = 'c' | 'python'`.
- `HighlightLines = { c: number[]; python: number[] }` → líneas resaltadas por lenguaje (índices base 1).
- `TraceFrame` → estado de memoria + `highlightLines` + métricas (comparaciones, swaps, etc.).
- `ActiveAction` / `ElementState` → semántica visual que mapea a los resaltadores del design system
  (`compare` 🟡, `swap` 🟠, `locked` 🟢, `pivot` 🟣).
- `AlgorithmDefinition` → contrato que implementa cada `index.ts`.

## 🔌 Registro y acceso

`src/algorithms/index.ts`:
- Re-exporta todos los módulos.
- Mantiene `ALGORITHM_REGISTRY` (id → módulo).
- `getAlgorithmById(id)` con fallback seguro a Bubble Sort.

## ➕ Añadir un algoritmo

1. Crea `algorithms/<categoria>/<nombre-kebab>/`.
2. Añade `code.c` y `code.py` **reales** (no pseudocódigo).
3. Implementa `trace.ts` devolviendo `TraceFrame[]` con `highlightLines` por lenguaje.
4. En `index.ts`, exporta `<nombre>Module` conforme a `AlgorithmDefinition`.
5. Regístralo (import + `export *`) en `src/algorithms/index.ts` y en `ALGORITHM_REGISTRY`.
