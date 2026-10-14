---
id: src-overview
title: "src/ — Arquitectura del código fuente"
type: architecture
status: stable
tags:
  - algonotebook/module
  - area/raiz
  - src
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[src/algorithms/README]]"
  - "[[MOC — Arquitectura y Frontend]]"
---

# `src/` — Código fuente de AlgoNotebook

PWA de visualización interactiva de **Estructuras de Datos y Algoritmos (DSA)**.
Stack: **React 19 + TypeScript estricto (cero `any`) + Vite 8 + TailwindCSS 3.4**.

## ⚖️ Regla de oro (de `Agents.md`)

> **Zero UI in Logic.** Los algoritmos son funciones puras que reciben un estado
> inicial y devuelven un array inmutable de fotogramas (`TraceFrame[]`). **Nunca** tocan el DOM,
> ni el estado de React, ni usan `setTimeout`/`async`.

La capa de renderizado (componentes y viewports) es la única que consume esos fotogramas.

## 🧭 Arquitectura de la Aplicación

`src/main.tsx` monta directamente la aplicación **AlgoNotebook** (`App.tsx`) envuelta en un `ErrorBoundary` global y `StrictMode`.

Pestañas de trabajo en `App.tsx`:
1. **Visualizador**: Lienzo de ejecución algorítmica interactiva con traza sincronizada paso a paso C/Python.
2. **Currículum DSA**: Plan formativo en 6 unidades con grafo pedagógico (DAG de prerrequisitos).
3. **Cuadernos**: Fichas técnicas, flash quizzes conceptuales y notas de laboratorio.
4. **Lab Complejidad**: Gráficos comparativos de curvas asintóticas Big-O interactivas.

## 🗂️ Mapa de carpetas

| Carpeta | Responsabilidad |
| --- | --- |
| `algorithms/` | Módulos puros de DSA (traza + código C/Python). Ver [algorithms/README.md](algorithms/README.md). |
| `core/` | Contratos de datos (`types.ts`) y motor de reproducción reactivo (`usePlayback.ts`). |
| `renderers/` | Viewports visuales táctiles (grafo, árbol jerárquico, matriz DP, lista enlazada/memoria). |
| `components/` | UI táctil estilo cuaderno de laboratorio (layout, visualizador, controles, código, modales, vistas). |
| `design-system/` | Tokens de papelería táctil (tinta, papel, resaltadores) y contratos de interfaz. |
| `hooks/` | Hooks de React reutilizables (atajos globales de teclado del laboratorio). |
| `assets/` | Recursos estáticos (iconos, SVGs, portada). |
| `index.css` | Variables de papelería de ingeniería, dot-grid y estilos base. |

## 🧱 Convenciones

- Cada carpeta expone su API pública mediante un `index.ts` (barrel).
- **Componentes React** → `PascalCase.tsx`.
- **Hooks** → `useAlgo.ts` (camelCase con prefijo `use`).
- **Módulos de lógica/datos** → `camelCase.ts`.
- **Directorios de algoritmos** → `kebab-case`.
