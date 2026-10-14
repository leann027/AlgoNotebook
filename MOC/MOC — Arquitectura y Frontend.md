---
id: moc-arquitectura-frontend
title: "MOC — Arquitectura y Frontend"
type: concept
status: stable
tags:
  - algonotebook/moc
  - area/raiz
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[MOC — AlgoNotebook]]"
  - "[[src/README]]"
  - "[[Arquitectura - Zero UI in Logic]]"
---

# MOC — Arquitectura y Frontend

Índice del código fuente (`src/`): contratos de dominio, lógica pura desacoplada y capa de
renderizado. Cada nota enlazada documenta **un** módulo o concepto.

## 🧭 Entrada y Flujo

- [[Arquitectura.canvas]] — mapa visual interactivo del flujo arquitectónico y de datos.
- [[src/README]] — arquitectura general de `src/`, convenciones y mapa de carpetas.
- [[Guía - Instalación y Desarrollo]] — cómo levantar, compilar y verificar el proyecto.

## 🧩 Módulos de código

| Módulo | Área | Nota |
| --- | --- | --- |
| `src/core/` | Contratos + playback | [[src/core/README]] |
| `src/algorithms/` | Catálogo DSA | [[src/algorithms/README]] · ver [[MOC — Algoritmos (DSA)]] |
| `src/components/` | UI estilo cuaderno | [[src/components/README]] |
| `src/renderers/` | Viewports visuales | [[src/renderers/README]] |
| `src/design-system/` | Tokens y contratos | [[src/design-system/README]] |
| `src/hooks/` | Hooks transversal de UI | [[src/hooks/README]] |

## 🧱 Conceptos transversales

- [[Arquitectura - Zero UI in Logic]] — regla de oro de separación lógica/render.
- [[Diseño - Contrato TraceFrame]] — contrato de sincronización C99 ↔ Python 3.
- [[Sistema de Diseño - Tokens y Resaltadores]] — identidad visual de la UI.

> [!info] Flujo de datos
> `algorithms/` (puro) → `TraceFrame[]` → `components/` + `renderers/` (presentación).
