---
id: agents-teamwork
title: ".agents — Artefactos de trabajo multi-agente"
type: module
status: draft
tags:
  - algonotebook/tooling
  - area/tooling
  - ciclo/efimero
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Agents.md]]"
  - "[[MOC — Diseño y Tooling]]"
---

# `.agents/` — Artefactos de trabajo multi-agente

Espacio de trabajo de las ejecuciones multi-agente (orquestadores, exploradores, workers, revisores).
Es **efímero / de proceso**: registra cómo se generó contenido, no forma parte del runtime de la app.

```text
.agents/teamwork/
├── ORIGINAL_REQUEST.md     # Prompt original de la ejecución (léelo primero para contexto)
├── orchestrator_*/         # Coordinación de la tarea
├── explorer_*/             # Reconocimiento (survey) del repo
├── worker_*/               # Ejecución por área temática (DSA, math, integración)
├── reviewer_*/, auditor_*/ # Verificación y auditoría
├── challenger_*/           # Revisión crítica / adversarial
└── sentinel/               # Guardia de integridad
```

## 🔗 Enlaces útiles

- `.agents/teamwork/ORIGINAL_REQUEST.md` → objetivo y requisitos (R1–R3) de la expansión enciclopédica
  que produjo los módulos DSA y matemáticos actuales.
- Reglas que todo agente debe respetar → `Agents.md` (raíz).

> Estos directorios pueden regenerarse en cada ejecución; no contienen código de producción.
> Si crecen demasiado, son candidatos a archivarse/purgarse (ya están fuera de `src/`).
