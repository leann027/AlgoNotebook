---
id: moc-algonotebook
title: "MOC — AlgoNotebook"
type: concept
status: stable
tags:
  - algonotebook/moc
  - area/raiz
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[README]]"
  - "[[Agents.md]]"
  - "[[MOC — Arquitectura y Frontend]]"
  - "[[MOC — Algoritmos (DSA)]]"
  - "[[MOC — Diseño y Tooling]]"
---

# MOC — AlgoNotebook

> [!abstract] Punto de entrada del vault
> Este es el **Map of Content** raíz. No contiene documentación extensa: es el índice que
> enruta hacia los dominios principales del proyecto y sus notas atómicas. La documentación de detalle
> vive en las notas enlazadas, cada una con un propósito único.

**AlgoNotebook** es una PWA que visualiza **Estructuras de Datos y Algoritmos (DSA)** con
estética táctil de cuaderno de laboratorio de ingeniería. Sincroniza la ejecución paso a paso entre
**C99** y **Python 3**.

---

## 🧭 Dominios (MOCs temáticos)

| MOC | Cubre |
| --- | --- |
| [[MOC — Arquitectura y Frontend]] | `src/` — contratos, UI, viewports y motor de reproducción |
| [[MOC — Algoritmos (DSA)]] | Catálogo DSA: sorting, trees, graphs, dp, lists, search |
| [[MOC — Diseño y Tooling]] | Sistema de diseño, tokens, assets y tooling del vault |

## 🚀 Notas de entrada

| Nota | Tipo | Contenido |
| --- | --- | --- |
| [[README]] | architecture | Visión general, stack, features y estructura |
| [[Agents.md]] | guide | Reglas mandatorias de arquitectura y estilo |
| [[_context.md]] | guide | Contexto operativo resumido para asistentes |
| [[Guía - Instalación y Desarrollo]] | guide | Instalación, scripts y QA |

## 🧱 Conceptos arquitectónicos

| Nota | Contenido |
| --- | --- |
| [[Arquitectura - Zero UI in Logic]] | El principio rector: lógica pura, render desacoplado |
| [[Diseño - Contrato TraceFrame]] | El contrato de datos que sincroniza C ↔ Python |
| [[Arquitectura.canvas]] | Mapa visual interactivo de flujo de datos y capas |

## 🗂️ Decisiones

| Nota | Contenido |
| --- | --- |
| [[ADR-001 - MOCs y frontmatter estandarizado]] | Por qué se consolidan los READMEs y se unifica el YAML |

---

## 🏷️ Taxonomía de tags

| Eje | Valores |
| --- | --- |
| **Raíz** | `#algonotebook` (prefijo común de todas las notas del proyecto) |
| **Rol** | `#algonotebook/moc` · `#algonotebook/module` · `#algonotebook/concepto` · `#algonotebook/guia` · `#algonotebook/readme` · `#algonotebook/contexto` · `#algonotebook/diseno` · `#algonotebook/tooling` |
| **Área** | `#area/raiz` · `#area/algoritmos` · `#area/matematicas` · `#area/core` · `#area/componentes` · `#area/renderers` · `#area/design-system` · `#area/ecosystem` · `#area/hooks` · `#area/stitch` · `#area/public` · `#area/archivo` · `#area/tooling` |
| **Ciclo** | `#ciclo/efimero` · `#ciclo/archivado` |

> [!tip] Navegación dinámica
> Abre el Base [[Notas del Proyecto.base]] para filtrar por `type`, `status` o `tags`.

---

## 🔒 Rutas fuera del índice de Obsidian

Obsidian no indexa carpetas que empiezan por `.`, así que estas notas no aparecen en Tags ni
Búsqueda. Se mantienen para trazabilidad:

| Ruta | Contenido |
| --- | --- |
| `.agents/teamwork/**` | Artefactos de la ejecución multi-agente (`#ciclo/efimero`) |
| `.github/agents/*.agent.md` | Perfiles de agente — ver [.github/agents/README.md](../.github/agents/README.md) |
| `.claudian/opencode/prompts/*.md` | Prompts de sistema — **sin frontmatter a propósito** |

## 🔗 Enlaces externos

- Repositorio: se abre directamente como vault de Obsidian (`.obsidian/`).
- Reglas transversales: [[Agents.md]].
