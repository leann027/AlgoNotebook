---
id: algonotebook-readme
title: "AlgoNotebook — Engineering Lab"
type: architecture
status: stable
tags:
  - algonotebook/readme
  - area/raiz
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[MOC — AlgoNotebook]]"
  - "[[Agents.md]]"
  - "[[Guía - Instalación y Desarrollo]]"
---

# AlgoNotebook — Engineering Lab

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20(0%20any)-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready%20Offline-green.svg)](https://vite-pwa-org.netlify.app/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

> **AlgoNotebook** es un visualizador interactivo de Estructuras de Datos y Algoritmos (DSA),
> con la estética táctil de un **cuaderno de laboratorio de ingeniería**.
> Ejecuta paso a paso con código sincronizado entre **C (C99)** y **Python 3**.

> [!tip] Empieza aquí (vault de Obsidian o GitHub)
> - 🧭 Índice general → [MOC — AlgoNotebook](MOC/MOC%20—%20AlgoNotebook.md)
> - 📐 Reglas obligatorias → [Agents.md](Agents.md)
> - ⚙️ Instalación y scripts → [Guía - Instalación y Desarrollo](guides/Guía%20-%20Instalación%20y%20Desarrollo.md)
> - 🗂️ Navegación dinámica → [[Notas del Proyecto.base]]

---

## 📐 Principios de arquitectura

| Principio | Nota |
| --- | --- |
| **Zero UI in Logic** — lógica pura y desacoplada del render | [Arquitectura - Zero UI in Logic](concepts/Arquitectura%20-%20Zero%20UI%20in%20Logic.md) |
| **Sincronización C99 ↔ Python 3** vía `TraceFrame` | [Diseño - Contrato TraceFrame](concepts/Diseño%20-%20Contrato%20TraceFrame.md) |
| **Identidad visual** (papel, tinta y resaltadores) | [Sistema de Diseño - Tokens y Resaltadores](concepts/Sistema%20de%20Diseño%20-%20Tokens%20y%20Resaltadores.md) |

Reglas mandatorias completas: [Agents.md](Agents.md) · Fuente de diseño: [Stitch/DESIGN.md](Stitch/DESIGN.md).

---

## 🚀 Características principales

- **Visor de código sincronizado** C99 ↔ Python 3, con resaltado reactivo de líneas y panel de
  variables locales en tiempo real.
- **Cinco viewports especializados:** memoria lineal, árbol jerárquico SVG, grafo SVG (con cola
  FIFO y tabla de relajación Dijkstra), matriz DP y memoria de punteros.
- **Widget de pila de recursión** (`CallStackWidget`) para algoritmos recursivos.
- **Ficha técnica funcional** por algoritmo: objetivo, mecánica, invariante, propiedades,
  complejidad y casos borde.
- **Barra de entrada personalizada** con validación y generación aleatoria de datos.
- **Atajos de teclado globales** (`Space`, `→`, `←`, `R`, `1`/`2`/`3`, `L`).
- **PWA offline** instalable (Service Worker + Workbox, aviso de actualización).

---

## 📚 Catálogo implementado

| Algoritmo | Categoría | Viewport | Complejidad temporal |
| :--- | :---: | :---: | :---: |
| **Bubble Sort** | Ordenamiento | Lineal | $\mathcal{O}(N^2)$ |
| **QuickSort (Lomuto)** | Ordenamiento | Lineal + Call Stack | $\mathcal{O}(N \log N)$ |
| **Merge Sort** | Ordenamiento | Lineal + Call Stack | $\mathcal{O}(N \log N)$ |
| **Búsqueda Binaria** | Búsqueda | Lineal | $\mathcal{O}(\log N)$ |
| **BST Insertion** | Árboles | Jerárquico SVG | $\mathcal{O}(\log N)$ |
| **Recorrido Inorder** | Árboles | Jerárquico SVG + Call Stack | $\mathcal{O}(N)$ |
| **Breadth-First Search (BFS)** | Grafos | Grafo SVG + Cola FIFO | $\mathcal{O}(V + E)$ |
| **Depth-First Search (DFS)** | Grafos | Grafo SVG + Call Stack | $\mathcal{O}(V + E)$ |
| **Dijkstra** | Grafos | Grafo SVG + Tabla | $\mathcal{O}((V+E)\log V)$ |
| **0/1 Knapsack** | Prog. Dinámica | Matriz DP | $\mathcal{O}(N \cdot W)$ |
| **Inversión de Lista Enlazada** | Punteros | Memoria de punteros | $\mathcal{O}(N)$ |
| **Detección de Ciclos (Floyd)** | Punteros | Memoria de punteros | $\mathcal{O}(N)$ |

Catálogo completo y por categorías: [MOC — Algoritmos (DSA)](MOC/MOC%20—%20Algoritmos%20%28DSA%29.md).

---

## 🛠️ Estructura del proyecto

```text
AlgoNotebook/
├── src/            # Código fuente (algorithms, core, components, renderers, …)
├── Stitch/         # PRD + maqueta de diseño (DESIGN.md)
├── public/         # Assets estáticos PWA
├── MOC/            # Maps of Content (índice del vault)
├── concepts/       # Notas atómicas de arquitectura y diseño
├── guides/         # Guías de uso y desarrollo
└── decisions/      # Registros de decisiones (ADR)
```

Detalle por módulo: ver la sección de documentación más abajo.

---

## 📚 Documentación

La documentación está organizada en **MOCs** (índices temáticos) que enrutan a notas atómicas.
Empieza por el índice raíz:

| Nivel | Nota |
| --- | --- |
| Índice raíz | [MOC — AlgoNotebook](MOC/MOC%20—%20AlgoNotebook.md) |
| Arquitectura y frontend | [MOC — Arquitectura y Frontend](MOC/MOC%20—%20Arquitectura%20y%20Frontend.md) |
| Algoritmos (DSA) | [MOC — Algoritmos (DSA)](MOC/MOC%20—%20Algoritmos%20%28DSA%29.md) |
| Diseño y tooling | [MOC — Diseño y Tooling](MOC/MOC%20—%20Diseño%20y%20Tooling.md) |

Reglas transversales obligatorias: [Agents.md](Agents.md). Contexto operativo: [_context.md](_context.md).
Por qué esta estructura: [ADR-001 - MOCs y frontmatter estandarizado](decisions/ADR-001%20-%20MOCs%20y%20frontmatter%20estandarizado.md).

---

## 💻 Instalación y desarrollo

Requisitos y comandos en [Guía - Instalación y Desarrollo](guides/Guía%20-%20Instalación%20y%20Desarrollo.md).

```bash
npm install && npm run dev      # desarrollo → http://localhost:5173
npm run lint && npm run build   # calidad y build de producción (PWA)
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
