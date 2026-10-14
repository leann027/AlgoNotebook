---
id: module-renderers
title: "renderers/ — Viewports de renderizado"
type: module
status: stable
tags:
  - algonotebook/module
  - area/renderers
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[src/components/README]]"
  - "[[Sistema de Diseño - Tokens y Resaltadores]]"
  - "[[Diseño - Contrato TraceFrame]]"
---

# `src/renderers/` — Viewports de renderizado

Componentes que **pintan** los fotogramas (`TraceFrame[]`) en lienzos visuales
especializados. Son la única capa que traduce estado de datos a SVG/canvas.

## 📄 Viewports especializados de AlgoNotebook

| Archivo | Representa |
| --- | --- |
| `GraphViewport.tsx` | Grafos dirigidos/no dirigidos y recorridos (BFS, DFS, Dijkstra, Kruskal, Topological Sort, Bellman-Ford, SCC) |
| `TreeHierarchyViewport.tsx` | Árboles binarios y jerárquicos (BST, AVL, Min-Heap, Inorder, Preorder, Priority Queue) |
| `MatrixGridViewport.tsx` | Matrices de Programación Dinámica (LCS, Knapsack, Levenshtein, Coin Change) |
| `LinkedListViewport.tsx` | Listas enlazadas y memoria física de punteros (Invertir, Floyd Cycle, Pila LIFO, Cola FIFO) |
| `index.ts` | Barrel de los viewports de renderizado |

## 🧱 Convenciones

- **Componentes** → `PascalCase.tsx`; reciben el snapshot inmutable por props y **no** mutan estado de dominio.
- El layout que los ubica e integra es `components/layout/StudyCanvas.tsx`.
