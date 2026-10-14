---
id: diseno-tokens-resaltadores
title: "Sistema de Diseño — Tokens y Resaltadores"
type: concept
status: stable
tags:
  - algonotebook/concepto
  - area/design-system
  - diseno/paleta
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Stitch/DESIGN.md]]"
  - "[[src/design-system/README]]"
  - "[[MOC — Diseño y Tooling]]"
---

# Sistema de Diseño — Tokens y Resaltadores

Identidad visual "cuaderno de laboratorio": papel crema, tinta carbón y resaltadores fluorescentes.
Fuente canónica: [[Stitch/DESIGN.md]] (`PRD-ALGO-2025`). Implementación: `src/design-system/tokens.ts`.

## Paleta base

| Token | Hex | Uso |
| --- | --- | --- |
| `paperBase` | `#FDFBF7` | Fondo base (papel crema) |
| `paperSurface` | `#FFFFFF` | Superficies / tarjetas |
| `paperBorder` | `#E5E0D8` | Bordes técnicos |
| `paperGrid` | `#EAE5DC` | Rejilla dot-grid (24px) |
| `inkPrimary` | `#1E232A` | Tinta principal (carbón) |

## Resaltadores

| Token | Hex | Semántica |
| --- | --- | --- |
| `highlighterCompare` 🟡 | `#FEF08A` | Comparaciones / lecturas |
| `highlighterSwap` 🟠 | `#FFD7BA` | Swaps / reubicación de punteros |
| `highlighterSuccess` 🟢 | `#BBF7D0` | Ordenado / visitado / óptimo |
| `highlighterPointer` 🟣 | `#E9D5FF` | Punteros / pivotes / cola |

## Tipografía

- **Plus Jakarta Sans** → `sans` / `headline`.
- **JetBrains Mono** → `mono` / `code`.

> [!warning] Mantener sincronizado
> La paleta está replicada en `tailwind.config.js` (`bg-paper-base`, `text-ink-primary`, …).
> Al cambiar un token, actualiza [[Stitch/DESIGN.md]] → `tokens.ts` → `tailwind.config.js`.
