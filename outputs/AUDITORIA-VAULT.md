---
id: auditoria-vault-2026-10-13
title: "Auditoría del vault — consolidación de READMEs y frontmatter"
type: decision
status: stable
created: 2026-10-13
updated: 2026-10-13
---

# Auditoría del vault AlgoNotebook — 2026-10-13

Artefacto de trabajo (fuera del índice de Obsidian: `outputs/` está en `userIgnoreFilters`).

## 1. Diagnóstico

| Hallazgo | Detalle |
| --- | --- |
| **16 `README.md` dispersos** | Uno por carpeta de `src/` + raíz + `Stitch`, `public`, `archive`, `copilot`, `.agents`, `.github/agents`. |
| **Hub único y monolítico** | `README.md` (264 líneas) repetía reglas de `Agents.md`, tokens de `Stitch/DESIGN.md` y el catálogo de los MOC. |
| **Duplicado obsoleto** | `dist/README.md` era copia desactualizada de `public/README.md` (título erróneo) en carpeta de build **gitignored**. |
| **Nota huérfana** | `docs/outputJson.md` (0 bytes de cuerpo, sin enlaces entrantes). |
| **Frontmatter inconsistente** | Claves en español (`tipo`/`area`/`estado`), sin `id`, sin `created`/`updated`, sin `related`. `README.md` raíz incluso carecía de `title`. |
| **Sin grafo relacional** | Los READMEs no se enlazaban entre sí salvo en el `Mapa del Proyecto.md`. |

## 2. Acciones aplicadas

### 2.1 Consolidación en capa de MOCs
- Nuevo hub raíz `MOC/MOC — AlgoNotebook.md` (sustituye a `Mapa del Proyecto.md`, eliminado).
- 4 MOCs de dominio: Arquitectura y Frontend, Algoritmos (DSA), Matemáticas, Diseño y Tooling.
- Los `README.md` de carpeta **se conservan** como doc de módulo (vista GitHub) pero ahora enlazan a su MOC y declaran `related` → dejan de ser resúmenes aislados.

### 2.2 Notas atómicas (descomposición del README monolítico)
- `concepts/Arquitectura - Zero UI in Logic.md`
- `concepts/Arquitectura - Enrutado Multi-cuaderno.md`
- `concepts/Diseño - Contrato TraceFrame.md`
- `concepts/Sistema de Diseño - Tokens y Resaltadores.md`
- `guides/Guía - Instalación y Desarrollo.md`
- `decisions/ADR-001 - MOCs y frontmatter estandarizado.md`
- `README.md` pasa a ser *landing* que delega en los MOC.

### 2.3 Frontmatter estandarizado
Esquema canónico aplicado a **todas las notas** del vault: 22 notas existentes migradas
(19 + 3 perfiles de agente) y 12 notas nuevas creadas ya con el esquema:
`id · title · type · status · tags · created · updated · related`
con `type ∈ {concept, module, architecture, guide, algorithm, decision}` y
`status ∈ {draft, in-progress, stable, deprecated}`.

### 2.4 Limpieza
- Eliminados: `Mapa del Proyecto.md`, `dist/README.md`, `docs/outputJson.md`.
- Base `Notas del Proyecto.base` migrado a `type`/`status`/`tags` (8 vistas).
- Template `templates/Nota Técnica.md` + `.obsidian/templates.json`.
- `outputs/` añadido a `userIgnoreFilters` (`.obsidian/app.json`).

## 3. Verificación
`outputs/_validate_vault.py` → **31 notas analizadas, 0 problemas** (frontmatter completo, enums válidos, 0 wikilinks rotos).

## 4. Scripts
- `outputs/_migrate_frontmatter.py` — migración reproducible (idempotente).
- `outputs/_validate_vault.py` — validador de esquema y enlaces.
