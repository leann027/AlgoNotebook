---
id: agents-directivas
title: "AGENTS.md — Directivas de arquitectura y estilo"
type: guide
status: stable
tags:
  - algonotebook/guia
  - area/raiz
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Stitch/DESIGN.md]]"
  - "[[Arquitectura - Zero UI in Logic]]"
  - "[[src/README]]"
---

# AGENTS.md — Directivas de Arquitectura y Estilo para AlgoNotebook

Este archivo contiene las reglas mandatorias del proyecto. Todo agente de desarrollo (Cursor, Claude Code, Windsurf, Copilot) DEBE leer y respetar estas restricciones antes de generar código.

---

## 1. Visión del Proyecto
AlgoNotebook es un visualizador web interactivo (PWA) de Estructuras de Datos y Algoritmos (DSA) con estética de cuaderno de laboratorio de ingeniería (definida en `DESIGN.md`). Permite inspeccionar la ejecución paso a paso con código sincronizado en **C (C99)** y **Python 3**.

---

## 2. Reglas Inviolables de Arquitectura

1. **Desacoplamiento Absoluto (Zero UI in Logic):**
   - Los algoritmos NUNCA interactúan con el DOM, ni manipulan estados de React, ni usan `setTimeout` o `async/await sleep()`.
   - Cada algoritmo es una función pura que toma un estado inicial y retorna un array inmutable de fotogramas (`TraceFrame[]`).
2. **Sincronización Multilenguaje Estricta:**
   - Todo fotograma (`TraceFrame`) DEBE definir qué líneas se resaltan en C y cuáles en Python mediante:
     `highlightLines: { c: number[], python: number[] }` (índices base 1).
   - El código en C y Python debe ser idiomático y real, no pseudocódigo simplificado.
3. **Fidelidad al Sistema de Diseño (`DESIGN.md`):**
   - Respeta estrictamente los tokens de color:
     - Fondo base: `#FDFBF7` (papel crema)
     - Superficies/tarjetas: `#FFFFFF`
     - Tinta primaria: `#1E232A` (carbón)
     - Resaltadores: Amarillo (`#FEF08A` para comparaciones), Coral (`#FFD7BA` para swaps), Menta (`#BBF7D0` para completado), Lavanda (`#E9D5FF` para punteros).
   - El lienzo de animación debe tener la textura dot-grid con patrón de puntos de 24px.
4. **TypeScript Estricto:**
   - Prohibido el uso de `any`. Toda estructura de datos, evento y snapshot debe estar tipada con uniones discriminadas (`discriminated unions`).

---

## 3. Estructura de Directorios

El código DEBE respetar esta organización modular:

```text
src/
├── core/                     # Contratos + motor de reproducción (sin UI)
│   ├── types.ts              # Contratos DSA: TraceFrame, AlgorithmDefinition, etc.
│   ├── mathTypes.ts          # Contratos matemáticos: MathTopic, ProofStep, snapshots
│   ├── usePlayback.ts        # Hook de línea de tiempo (con limpieza de timers)
│   └── index.ts              # Barrel
├── algorithms/               # Catálogo DSA (un directorio kebab-case por algoritmo)
│   ├── sorting/ trees/ graphs/ dp/ lists/ search/
│   ├── bubble-sort/
│   │   ├── index.ts          # <name>Module: AlgorithmDefinition
│   │   ├── trace.ts          # Generador PURO de TraceFrame[] (sin DOM, sin timers)
│   │   ├── code.c            # Fuente C99 real (cargada con ?raw)
│   │   └── code.py           # Fuente Python 3 real
│   └── index.ts              # ALGORITHM_REGISTRY + getAlgorithmById()
├── math/                     # Catálogo matemático puro (misma estructura + proof.ts/steps.ts)
│   ├── analysis/ calculus/ discrete/ geometry/ linear-algebra/ optimization/ probability/
│   ├── curriculum.ts         # MATH_TOPICS + grafo DAG de crossConnections
│   ├── parser/               # safeMathParser.ts (sin eval)
│   └── index.ts
├── renderers/                # Viewports de renderizado visual
│   ├── GraphViewport.tsx
│   ├── TreeHierarchyViewport.tsx
│   ├── MatrixGridViewport.tsx
│   ├── LinkedListViewport.tsx
│   ├── math/                 # Viewports matemáticos (SVD, Gram-Schmidt, ...)
│   └── index.ts
├── components/               # Interfaz de usuario estilo cuaderno
│   ├── layout/               # UnifiedNotebookHeader, SideNavBar, StudyCanvas, UniversalNotebookPage
│   ├── code-panel/           # CodeNotebookCard, CallStackWidget, AlgorithmTechnicalSheet
│   ├── controls/             # RulerControlBar, CustomInputBar
│   ├── math/                 # Widgets y vistas del cuaderno de matemáticas
│   ├── modals/               # Fichas técnicas y ajustes (modales flotantes)
│   ├── views/                # NotebooksView, CurriculumView, ComplexityLabView, EcosystemHubView
│   ├── pwa/                  # ReloadPrompt
│   └── common/               # ErrorBoundary
├── design-system/            # tokens.ts, ecosystem.ts, types.ts
├── ecosystem/                # Cuadernos ampliados: data/ (configs) + visualizers/
├── hooks/                    # useKeyboardShortcuts
├── assets/                   # Recursos importados por Vite
├── App.tsx                   # App DSA (/)
├── MathNotebookApp.tsx       # Cuaderno de matemáticas (/math)
├── NetNotebookApp.tsx        # Redes (/net)
├── DataNotebookApp.tsx       # Bases de datos (/data)
├── CircuitNotebookApp.tsx    # Lógica digital (/circuit)
├── PipeNotebookApp.tsx       # CI/CD (/pipe, /cicd)
├── main.tsx                  # Enrutado por pathname
└── index.css                 # Variables de papelería y estilos base
```

> Documentación detallada: capa de **MOCs** en `MOC/` (índice raíz en [[MOC — AlgoNotebook]]);
> cada carpeta de código conserva además su propio `README.md`. Esquema de frontmatter y
> rationale en [[ADR-001 - MOCs y frontmatter estandarizado]].