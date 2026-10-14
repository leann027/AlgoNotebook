---
id: contexto-operativo
title: "Contexto operativo del proyecto"
type: guide
status: stable
tags:
  - algonotebook/contexto
  - area/raiz
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Agents.md]]"
  - "[[src/README]]"
  - "[[MOC — AlgoNotebook]]"
---

# Arquitectura y Propósito

PWA interactiva para la visualización de **algoritmos (DSA)** y **matemáticas**, con estética de
cuaderno de laboratorio de ingeniería. Es una app **multi-cuaderno** enrutada por `main.tsx`:
`/` (DSA), `/math`, `/net`, `/data`, `/circuit`, `/pipe` (`/cicd`).

## Estructura principal

- `src/algorithms/`: Módulos puros de DSA (traza + código C/Python). Registro en `index.ts`.
- `src/math/`: Módulos matemáticos puros + `curriculum.ts` (grafo DAG) + `parser/`.
- `src/core/`: Contratos (`types.ts`, `mathTypes.ts`) y `usePlayback.ts`.
- `src/renderers/`: Viewports visuales (incluye `math/`).
- `src/components/`: UI estilo cuaderno (`layout`, `code-panel`, `controls`, `math`, `modals`, `views`, `pwa`, `common`).
- `src/design-system/` y `src/ecosystem/`: tokens/contratos y cuadernos ampliados.
- `archive/`: material retirado del build (p. ej. `math-topics/`).

## Reglas para el Asistente

- **Zero UI in Logic:** los algoritmos y las matemáticas son funciones puras que devuelven
  `TraceFrame[]` (sin DOM, sin `setTimeout`/`async`, sin estado de React).
- **TypeScript estricto:** prohibido `any`; usar uniones discriminadas.
- Mantener la lógica matemática/algorítmica separada de la capa de renderizado.
- Respetar los tokens de `Stitch/DESIGN.md` y `src/design-system/tokens.ts`.
- Documentación: capa de **MOCs** en `MOC/`; cada carpeta de código conserva su `README.md`.
  Índice raíz en [[MOC — AlgoNotebook]]. Esquema de frontmatter en
  [[ADR-001 - MOCs y frontmatter estandarizado]].
