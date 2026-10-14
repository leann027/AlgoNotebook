---
id: copilot-plugin
title: "copilot/ — Datos del plugin Obsidian Copilot"
type: module
status: stable
tags:
  - algonotebook/tooling
  - area/tooling
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[MOC — Diseño y Tooling]]"
---

# `copilot/` — Datos del plugin Obsidian Copilot

Carpeta **gestionada por el plugin Copilot**, no por el código de la app. El proyecto se abre como
vault de Obsidian (`.obsidian/`), y este directorio es su espacio de trabajo dentro del vault.

| Ruta | Contenido |
| --- | --- |
| `copilot-conversations/` | Conversaciones exportadas como notas Markdown (autogeneradas). |
| `skills/` | Definiciones de skills del plugin (`.md` con frontmatter). |

## 🔗 Skills unificadas

`copilot/skills/` es la **fuente canónica** de las skills. Las carpetas de otros agentes apuntan a
ellas mediante **symlinks**:

```text
.claude/skills/<skill>   → copilot/skills/<skill>
.opencode/skills/<skill> → copilot/skills/<skill>
```

Por eso no hay duplicación real de skills: editar una skill en `copilot/skills/` la actualiza para
todos los agentes.

> ⚠️ No renombres manualmente las notas de `copilot-conversations/`: el plugin las indexa por nombre
> (incluidas fechas y caracteres especiales).
