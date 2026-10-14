---
id: github-agents
title: ".github/agents — Perfiles de agente"
type: module
status: stable
tags:
  - algonotebook/tooling
  - area/tooling
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Agents.md]]"
  - "[[MOC — Diseño y Tooling]]"
---

# `.github/agents/` — Definiciones de agentes de GitHub

Perfiles de agente en formato Markdown que describen rol, alcance y reglas para asistentes de código
especializados en este proyecto.

| Archivo | Rol |
| --- | --- |
| `algo-engineer.agent.md` | Ingeniería de algoritmos (módulos puros, trazas, código C/Python). |
| `code-reviewer.agent.md` | Revisión de código (estilo, tipado estricto, desacoplamiento). |
| `Frontend-engineer.agent.md` | Ingeniería de front-end (componentes, viewports, design system). |

> Las reglas transversales que estos perfiles deben respetar están en `Agents.md` (raíz).
