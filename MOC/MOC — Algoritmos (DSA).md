---
id: moc-algoritmos
title: "MOC — Algoritmos (DSA)"
type: concept
status: stable
tags:
  - algonotebook/moc
  - area/algoritmos
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[MOC — AlgoNotebook]]"
  - "[[src/algorithms/README]]"
  - "[[Diseño - Contrato TraceFrame]]"
---

# MOC — Algoritmos (DSA)

Índice del catálogo de algoritmos. Documentación de módulo en [[src/algorithms/README]]; aquí sólo
se organiza la navegación por categoría.

## 🗂️ Categorías

| Categoría | Módulos | Viewport |
| --- | --- | --- |
| `sorting/` | bubble-sort, insertion-sort, selection-sort, quick-sort, merge-sort | Lineal |
| `trees/` | bst, inorder-traversal, preorder-traversal, min-heap, priority-queue, avl-tree | Jerárquico SVG |
| `graphs/` | bfs, dfs, dijkstra, kruskal, topological-sort, bellman-ford, strongly-connected-components | Grafo SVG |
| `dp/` | knapsack, lcs, coin-change, kadane, levenshtein | Matriz DP |
| `lists/` | reverse-linked-list, cycle-detection, stack-operations, queue-operations, insert-linked-list | Memoria de punteros |
| `search/` | binary-search, linear-binary-search | Lineal |

## 🔎 Selección rápida

| Necesidad | Algoritmo |
| --- | --- |
| Ordenar un array | [[src/algorithms/README]] → `sorting/` |
| Buscar en datos ordenados | binary-search |
| Camino mínimo ponderado | dijkstra, bellman-ford |
| Recorridos de grafo | bfs, dfs, topological-sort |
| Optimización combinatoria | knapsack, lcs, levenshtein |
| Estructuras de punteros | reverse-linked-list, cycle-detection |

> [!info] Contrato común
> Cada módulo es una función pura que devuelve `TraceFrame[]`. Ver [[Diseño - Contrato TraceFrame]].

## 📋 Índice dinámico del dominio (Dataview)

```dataview
TABLE title as "Título", status as "Estado", updated as "Actualizado"
FROM #area/algoritmos
WHERE file.name != this.file.name
SORT file.name ASC
```
