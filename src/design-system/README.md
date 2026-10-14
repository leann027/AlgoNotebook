---
id: module-design-system
title: "design-system/ — Tokens y contratos de la suite"
type: module
status: stable
tags:
  - algonotebook/module
  - area/design-system
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Sistema de Diseño - Tokens y Resaltadores]]"
  - "[[Stitch/DESIGN.md]]"
  - "[[src/components/README]]"
---

# `src/design-system/` — Tokens y contratos de la suite

Fuente única de verdad para la **identidad visual** (conforme a `Stitch/DESIGN.md`, ref. `PRD-ALGO-2025`)
y para los contratos de la barra lateral / cabecera universales.

## 📄 Archivos

| Archivo | Contenido |
| --- | --- |
| `tokens.ts` | `DESIGN_TOKENS` (colores y tipografía) + clases Tailwind `TACTILE_*` (botones, tarjetas, etc.). |
| `ecosystem.ts` | `ECOSYSTEM_SUITE`: lista de cuadernos de la suite (Algo, Math, Net, Data, Circuit, Pipe) con icono, ruta, badge y color. |
| `types.ts` | Contratos de UI universal: `SideNavItem`, `SideNavCategoryGroup`, `SideNavBrand`, y re-export de tipos de `UnifiedNotebookHeader`. |
| `index.ts` | Barrel. |

## 🎨 Paleta (tokens de resaltador)

| Token | Hex | Uso |
| --- | --- | --- |
| `paperBase` | `#FDFBF7` | Fondo base (papel crema) |
| `paperSurface` | `#FFFFFF` | Superficies / tarjetas |
| `paperBorder` | `#E5E0D8` | Bordes técnicos |
| `paperGrid` | `#EAE5DC` | Rejilla dot-grid (24px) |
| `inkPrimary` | `#1E232A` | Tinta principal |
| `highlighterCompare` 🟡 | `#FEF08A` | Comparaciones / lecturas |
| `highlighterSwap` 🟠 | `#FFD7BA` | Swaps / reubicación |
| `highlighterSuccess` 🟢 | `#BBF7D0` | Ordenado / visitado / óptimo |
| `highlighterPointer` 🟣 | `#E9D5FF` | Punteros / pivotes |

Tipografía: **Plus Jakarta Sans** (`sans`/`headline`) y **JetBrains Mono** (`mono`/`code`).

> Los mismos colores están replicados en `tailwind.config.js` como clases utilitarias
> (`bg-paper-base`, `text-ink-primary`, `bg-highlighter-compare`, …). Mantén ambos sincronizados.
