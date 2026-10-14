---
id: stitch-index
title: "Stitch — Especificaciones de diseño"
type: module
status: stable
tags:
  - algonotebook/module
  - area/stitch
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Stitch/DESIGN.md]]"
  - "[[src/design-system/README]]"
  - "[[MOC — Diseño y Tooling]]"
---

# `Stitch/` — Especificaciones de diseño originales

Material fuente de la identidad visual y los requisitos de producto. **No se compila**; es referencia.

## 📄 Archivos

| Archivo | Contenido |
| --- | --- |
| `DESIGN.md` | PRD + Design Brief (ref. `PRD-ALGO-2025`): visión, personas, arquitectura de producto, paleta y reglas de UI. Fuente canónica citada por `AGENTS.md` y `src/design-system/tokens.ts`. |
| `design-mockup.html` | Maqueta HTML de referencia (antes `Stich_desing.html`, renombrada en la limpieza por typos). |

## 🔗 Cómo se usa

- `Agents.md` y `README.md` lo referencian para reglas de estilo y color.
- `src/core/types.ts` y `src/design-system/tokens.ts` citan `Stitch/DESIGN.md` en sus cabeceras.
- Los tokens de `src/design-system/tokens.ts` y `tailwind.config.js` derivan de la paleta aquí definida.

> Al cambiar la paleta o tipografía, actualiza **DESIGN.md → tokens.ts → tailwind.config.js** para
> mantener la sincronización.
