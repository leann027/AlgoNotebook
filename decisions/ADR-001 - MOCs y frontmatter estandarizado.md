---
id: adr-001-mocs-y-frontmatter
title: "ADR-001 — MOCs y frontmatter estandarizado"
type: decision
status: stable
tags:
  - algonotebook/decision
  - area/raiz
  - arquitectura/documentacion
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[MOC — AlgoNotebook]]"
  - "[[README]]"
---

# ADR-001 — MOCs y frontmatter estandarizado

## Estado

Aceptada · 2026-10-13

## Contexto

El vault había acumulado **16 `README.md`** dispersos por subcarpetas, sin un índice navegable
único y con frontmatter inconsistente (claves en español `tipo`/`area`/`estado`, sin `id`, sin
fechas, sin relaciones). Esto dificultaba tanto la lectura humana como el análisis por LLMs
(no había un esquema predecible ni un grafo de relaciones explícito).

## Decisión

1. **MOCs como capa de navegación.** Se introducen Maps of Content temáticos en `MOC/` que enrutan
   hacia las notas atómicas. Cada `README.md` de módulo **se conserva** (sigue siendo la doc de su
   carpeta y la vista de GitHub), pero deja de ser un resumen aislado: se enlaza desde un MOC y
   declara `related`.
2. **Frontmatter canónico** en toda nota:

   ```yaml
   id, title, type, status, tags, created, updated, related
   ```

   con `type ∈ {concept, module, architecture, guide, algorithm, decision}` y
   `status ∈ {draft, in-progress, stable, deprecated}`.
3. **Notas atómicas.** El README raíz (monolítico) se descompone en notas de un solo concepto
   (`concepts/`, `guides/`) y el README queda como _landing_ que delega el detalle.
4. **Limpieza.** Se eliminan duplicados: `dist/README.md` (copia obsoleta de `public/README.md`)
   y `docs/outputJson.md` (vacío y huérfano).

## Consecuencias

- ✅ Grafo de conocimiento explícito (aristas `related` + wikilinks en los MOC).
- ✅ Esquema predecible → indexación fiable por Bases y por LLMs.
- ✅ Un único punto de entrada: [[MOC — AlgoNotebook]].
- ⚠️ Nuevo hábito: al crear una nota, partir del template y rellenar el frontmatter.
- ⚠️ Renombrar `type`/`status` requiere migración; el esquema es ahora un contrato estable.

## Alternativas consideradas

- **Un solo README gigante:** descartado (monolito, mala indexación).
- **README por carpeta sin MOC:** estado previo; descartado por falta de navegación global.
