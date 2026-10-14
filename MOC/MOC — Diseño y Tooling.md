---
id: moc-diseno-tooling
title: "MOC — Diseño y Tooling"
type: concept
status: stable
tags:
  - algonotebook/moc
  - area/design-system
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[MOC — AlgoNotebook]]"
  - "[[Stitch/DESIGN.md]]"
  - "[[Sistema de Diseño - Tokens y Resaltadores]]"
---

# MOC — Diseño y Tooling

Índice del sistema de diseño, los assets estáticos, el material archivado y las herramientas del
vault (plugins, agentes, archivo).

## 🎨 Diseño

| Nota | Contenido |
| --- | --- |
| [[Stitch/DESIGN.md]] | PRD / Design Brief (`PRD-ALGO-2025`), fuente canónica |
| [[Sistema de Diseño - Tokens y Resaltadores]] | Paleta, resaltadores y tipografía |
| [[src/design-system/README]] | Tokens y contratos en código |
| [[Stitch/README]] | Índice de la carpeta de diseño |

## 📦 Assets, archivo y tooling

| Nota | Contenido |
| --- | --- |
| [[public/README]] | Assets estáticos de la PWA |
| [[archive/README]] | Material retirado del build (`#ciclo/archivado`) |
| [[copilot/README]] | Datos del plugin Copilot + skills (symlinks) |
| [.agents/README.md](../.agents/README.md) | Artefactos de la ejecución multi-agente (`#ciclo/efimero`) |
| [.github/agents/README.md](../.github/agents/README.md) | Perfiles de agente |

## 📋 Índice dinámico de tooling y diseño (Dataview)

```dataview
TABLE title as "Título", type as "Tipo", status as "Estado"
FROM #area/design-system OR #area/tooling OR #area/stitch
WHERE file.name != this.file.name
SORT file.name ASC
```
