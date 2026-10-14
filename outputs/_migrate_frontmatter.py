#!/usr/bin/env python3
"""Consolidación de frontmatter: esquema canónico id/title/type/status/tags/created/updated/related.

Fase 2 del plan de arquitectura de conocimiento. Reescribe SOLO el bloque YAML inicial
(between the first two '---') de cada nota listada; el cuerpo Markdown no se toca.
Idempotente: puede ejecutarse varias veces.
"""
from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TODAY = "2026-10-13"

FM_RE = re.compile(r"\A---\r?\n.*?\r?\n---\r?\n", re.DOTALL)


def fm(id_, title, type_, status, tags, related):
    def esc(s: str) -> str:
        return '"' + s.replace('"', '\\"') + '"'

    lines = [
        "---",
        f"id: {id_}",
        f"title: {esc(title)}",
        f"type: {type_}",
        f"status: {status}",
        "tags:",
    ]
    lines += [f"  - {t}" for t in tags]
    lines += [f"created: {TODAY}", f"updated: {TODAY}", "related:"]
    lines += [f"  - {esc(r)}" for r in related]
    lines.append("---")
    return "\n".join(lines) + "\n"


NOTES = {
    "README.md": fm(
        "algonotebook-readme",
        "AlgoNotebook — Engineering Lab",
        "architecture",
        "stable",
        ["algonotebook/readme", "area/raiz"],
        ["[[MOC — AlgoNotebook]]", "[[Agents.md]]", "[[Guía - Instalación y Desarrollo]]"],
    ),
    "_context.md": fm(
        "contexto-operativo",
        "Contexto operativo del proyecto",
        "guide",
        "stable",
        ["algonotebook/contexto", "area/raiz"],
        ["[[Agents.md]]", "[[src/README]]", "[[MOC — AlgoNotebook]]"],
    ),
    "Agents.md": fm(
        "agents-directivas",
        "AGENTS.md — Directivas de arquitectura y estilo",
        "guide",
        "stable",
        ["algonotebook/guia", "area/raiz"],
        ["[[Stitch/DESIGN.md]]", "[[Arquitectura - Zero UI in Logic]]", "[[src/README]]"],
    ),
    "Stitch/DESIGN.md": fm(
        "prd-algo-2025",
        "PRD & Design Brief — AlgoNotebook (PRD-ALGO-2025)",
        "architecture",
        "stable",
        ["algonotebook/diseno", "area/stitch"],
        [
            "[[Sistema de Diseño - Tokens y Resaltadores]]",
            "[[src/design-system/README]]",
            "[[Agents.md]]",
        ],
    ),
    "Stitch/README.md": fm(
        "stitch-index",
        "Stitch — Especificaciones de diseño",
        "module",
        "stable",
        ["algonotebook/module", "area/stitch"],
        ["[[Stitch/DESIGN.md]]", "[[src/design-system/README]]", "[[MOC — Diseño y Tooling]]"],
    ),
    "archive/README.md": fm(
        "archive-index",
        "Archivo — Material retirado del build",
        "module",
        "deprecated",
        ["algonotebook/module", "area/archivo", "ciclo/archivado"],
        ["[[src/math/README]]", "[[MOC — Matemáticas]]"],
    ),
    "public/README.md": fm(
        "public-assets",
        "public/ — Assets estáticos de la PWA",
        "module",
        "stable",
        ["algonotebook/module", "area/public"],
        ["[[src/README]]", "[[Guía - Instalación y Desarrollo]]"],
    ),
    "copilot/README.md": fm(
        "copilot-plugin",
        "copilot/ — Datos del plugin Obsidian Copilot",
        "module",
        "stable",
        ["algonotebook/tooling", "area/tooling"],
        ["[[MOC — Diseño y Tooling]]", "[[.agents/README]]"],
    ),
    ".agents/README.md": fm(
        "agents-teamwork",
        ".agents — Artefactos de trabajo multi-agente",
        "module",
        "draft",
        ["algonotebook/tooling", "area/tooling", "ciclo/efimero"],
        ["[[Agents.md]]", "[[MOC — Diseño y Tooling]]"],
    ),
    ".github/agents/README.md": fm(
        "github-agents",
        ".github/agents — Perfiles de agente",
        "module",
        "stable",
        ["algonotebook/tooling", "area/tooling"],
        ["[[Agents.md]]", "[[MOC — Diseño y Tooling]]"],
    ),
    "src/README.md": fm(
        "src-overview",
        "src/ — Arquitectura del código fuente",
        "architecture",
        "stable",
        ["algonotebook/module", "area/raiz", "src"],
        [
            "[[Arquitectura - Enrutado Multi-cuaderno]]",
            "[[src/algorithms/README]]",
            "[[src/math/README]]",
            "[[MOC — Arquitectura y Frontend]]",
        ],
    ),
    "src/algorithms/README.md": fm(
        "module-algorithms",
        "algorithms/ — Catálogo de algoritmos (cero UI)",
        "module",
        "stable",
        ["algonotebook/module", "area/algoritmos", "dsa"],
        [
            "[[MOC — Algoritmos (DSA)]]",
            "[[src/core/README]]",
            "[[src/renderers/README]]",
            "[[src/math/README]]",
        ],
    ),
    "src/math/README.md": fm(
        "module-math",
        "math/ — Catálogo matemático (cero UI)",
        "module",
        "stable",
        ["algonotebook/module", "area/matematicas"],
        ["[[MOC — Matemáticas]]", "[[src/core/README]]", "[[src/algorithms/README]]"],
    ),
    "src/core/README.md": fm(
        "module-core",
        "core/ — Contratos y motor de reproducción",
        "module",
        "stable",
        ["algonotebook/module", "area/core"],
        [
            "[[Diseño - Contrato TraceFrame]]",
            "[[src/algorithms/README]]",
            "[[src/math/README]]",
        ],
    ),
    "src/components/README.md": fm(
        "module-components",
        "components/ — Interfaz estilo cuaderno de laboratorio",
        "module",
        "stable",
        ["algonotebook/module", "area/componentes"],
        [
            "[[MOC — Arquitectura y Frontend]]",
            "[[src/renderers/README]]",
            "[[src/design-system/README]]",
        ],
    ),
    "src/renderers/README.md": fm(
        "module-renderers",
        "renderers/ — Viewports de renderizado",
        "module",
        "stable",
        ["algonotebook/module", "area/renderers"],
        [
            "[[src/components/README]]",
            "[[Sistema de Diseño - Tokens y Resaltadores]]",
            "[[Diseño - Contrato TraceFrame]]",
        ],
    ),
    "src/design-system/README.md": fm(
        "module-design-system",
        "design-system/ — Tokens y contratos de la suite",
        "module",
        "stable",
        ["algonotebook/module", "area/design-system"],
        [
            "[[Sistema de Diseño - Tokens y Resaltadores]]",
            "[[Stitch/DESIGN.md]]",
            "[[src/components/README]]",
        ],
    ),
    "src/ecosystem/README.md": fm(
        "module-ecosystem",
        "ecosystem/ — Cuadernos del ecosistema ampliado",
        "module",
        "stable",
        ["algonotebook/module", "area/ecosystem"],
        [
            "[[MOC — Arquitectura y Frontend]]",
            "[[src/design-system/README]]",
            "[[src/components/README]]",
        ],
    ),
    "src/hooks/README.md": fm(
        "module-hooks",
        "hooks/ — Hooks de React reutilizables",
        "module",
        "stable",
        ["algonotebook/module", "area/hooks"],
        ["[[src/core/README]]", "[[src/components/README]]"],
    ),
}


def main() -> int:
    changed = 0
    for rel, block in NOTES.items():
        path = ROOT / rel
        if not path.exists():
            print(f"SKIP (no existe): {rel}", file=sys.stderr)
            continue
        text = path.read_text(encoding="utf-8")
        m = FM_RE.match(text)
        body = text[m.end():] if m else text
        new = block + body.lstrip("\n")
        if new != text:
            path.write_text(new, encoding="utf-8")
            changed += 1
            print(f"OK  {rel}")
        else:
            print(f"—   {rel} (sin cambios)")
    print(f"\n{changed} notas migradas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
