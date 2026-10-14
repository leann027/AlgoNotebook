---
id: arq-zero-ui-in-logic
title: "Arquitectura — Zero UI in Logic"
type: architecture
status: stable
tags:
  - algonotebook/concepto
  - area/raiz
  - arquitectura/principio
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Agents.md]]"
  - "[[Diseño - Contrato TraceFrame]]"
  - "[[src/core/README]]"
  - "[[MOC — Arquitectura y Frontend]]"
---

# Arquitectura — Zero UI in Logic

## Definición

**Zero UI in Logic** es el principio rector de AlgoNotebook: toda la lógica de algoritmos y
matemáticas es **código puro y síncrono**, totalmente desacoplado de la capa de presentación.

## Reglas

1. Un módulo de `algorithms/` o `math/` **recibe** un estado inicial y **devuelve** un array
   inmutable de fotogramas (`TraceFrame[]` / `MathTraceFrame[]`).
2. **Nunca** interactúa con el DOM.
3. **Nunca** muta estado de React.
4. **Nunca** usa temporizadores (`setTimeout`, `async/await sleep()`).
5. El tiempo y la animación son responsabilidad **exclusiva** de `src/core/usePlayback.ts`.

## Por qué

- **Testeabilidad:** una función pura se valida sin montar UI ni temporizadores.
- **Determinismo:** la misma entrada produce exactamente la misma traza.
- **Portabilidad:** la misma traza alimenta cualquier viewport sin acoplarse a él.

## Flujo canónico

```text
entrada → [algorithms/ | math/] → TraceFrame[] → [components/ | renderers/] → SVG/canvas
                                         ▲
                                usePlayback (único gestor de tiempo)
```

## Consecuencias

- La capa de renderizado es la **única** que traduce fotogramas a píxeles.
- `usePlayback` es el único punto donde se permite gestionar tiempo.

> [!quote] Fuente
> Estipulado en [[Agents.md]] §2 y detallado en [[src/core/README]].
