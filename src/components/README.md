---
id: module-components
title: "components/ — Interfaz estilo cuaderno de laboratorio"
type: module
status: stable
tags:
  - algonotebook/module
  - area/componentes
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[MOC — Arquitectura y Frontend]]"
  - "[[src/renderers/README]]"
  - "[[src/design-system/README]]"
---

# `src/components/` — Interfaz estilo cuaderno de laboratorio

Capa de presentación de AlgoNotebook. Consume los `TraceFrame[]` de `algorithms/` y los presenta con la estética táctil de papelería técnica (papel crema, dot-grid, resaltadores, regla graduada de cálculo).
**No contiene lógica de algoritmos (Zero UI in Logic).**

## 🗂️ Subcarpetas

| Carpeta | Responsabilidad | Ejemplos |
| --- | --- | --- |
| `layout/` | Estructura y navegación de página | `UnifiedNotebookHeader`, `SideNavBar`, `StudyCanvas` |
| `code-panel/` | Visor de código sincronizado C/Python | `CodeNotebookCard`, `CallStackWidget`, `AlgorithmTechnicalSheet` |
| `controls/` | Controles de reproducción | `RulerControlBar`, `CustomInputBar` |
| `modals/` | Ventanas modales flotantes | `ComplexityLabModal`, `CurriculumModal`, `LaboratorySettingsModal`, `AlgorithmTechnicalSheetModal` |
| `views/` | Vistas de alto nivel | `NotebooksView`, `CurriculumView`, `ComplexityLabView`, `complexityData.ts` |
| `pwa/` | Integración con `vite-plugin-pwa` | `ReloadPrompt` (toast táctil de actualización) |
| `common/` | Componentes transversales | `ErrorBoundary`, `FormattedMathText` |

## 🧱 Convenciones

- **Componentes** → `PascalCase.tsx`, con `Props` fuertemente tipadas y sin `any`.
- Las **fichas técnicas** se abren como **modales flotantes** táctiles.
- Todo se re-exporta limpiamente desde `components/index.ts`.
