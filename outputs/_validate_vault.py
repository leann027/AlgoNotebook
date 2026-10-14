#!/usr/bin/env python3
"""Validador de la arquitectura de notas: frontmatter canónico + resolución de wikilinks."""
from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP_DIRS = {"node_modules", ".git", ".obsidian", ".agents", ".claudian", ".opencode",
             ".claude", ".smart-env", "dist", "outputs", "copilot", "templates"}
INDEX_SKIP = {"node_modules", ".git", ".obsidian", ".smart-env", "outputs", "dist"}
REQUIRED = ["id", "title", "type", "status", "tags", "created", "updated", "related"]
TYPES = {"concept", "module", "architecture", "guide", "algorithm", "decision"}
STATUSES = {"draft", "in-progress", "stable", "deprecated"}
FM_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
WIKI_RE = re.compile(r"\[\[([^\]|#]+)")

def notes():
    for p in ROOT.rglob("*.md"):
        if any(part in SKIP_DIRS for part in p.relative_to(ROOT).parts):
            continue
        yield p

def main() -> int:
    files = sorted(notes())
    # index de nombres resolubles (incluye tooling y perfiles, no solo las notas validadas)
    allmd = [p for p in ROOT.rglob("*.md")
             if not any(part in INDEX_SKIP for part in p.relative_to(ROOT).parts)]
    by_path = {str(p.relative_to(ROOT)).removesuffix(".md") for p in allmd}
    by_name = {p.stem for p in allmd}
    errors: list[str] = []
    for p in files:
        rel = str(p.relative_to(ROOT))
        text = p.read_text(encoding="utf-8")
        m = FM_RE.match(text)
        if not m:
            errors.append(f"[FM ausente] {rel}")
            continue
        fm = m.group(1)
        keys = set(re.findall(r"^([a-z_]+):", fm, re.M))
        for k in REQUIRED:
            if k not in keys:
                errors.append(f"[falta '{k}'] {rel}")
        for key, allowed in (("type", TYPES), ("status", STATUSES)):
            mm = re.search(rf"^{key}:\s*(\S+)", fm, re.M)
            if mm and mm.group(1).strip('"') not in allowed:
                errors.append(f"[{key} inválido '{mm.group(1)}'] {rel}")
        # wikilinks (solo objetivos en el vault: sin ruta web)
        for target in WIKI_RE.findall(text):
            t = target.strip()
            if t.endswith(".base") or t.endswith(".canvas") or "://" in t:
                continue
            t_nomd = t.removesuffix(".md")
            if t_nomd in by_path or t in by_path or t_nomd in by_name or t in by_name:
                continue
            errors.append(f"[enlace roto] {rel} -> [[{t}]]")

        # enlaces relativos estándar markdown [text](target)
        for _, link in re.findall(r"\[([^\]]+)\]\(([^)]+)\)", text):
            l = link.strip().split("#")[0]  # descartar ancla
            if not l or "://" in l or l.startswith("mailto:") or l.endswith(".base"):
                continue
            import urllib.parse
            l_unquoted = urllib.parse.unquote(l)
            target_path = (p.parent / l_unquoted).resolve()
            if not target_path.exists():
                errors.append(f"[enlace md roto] {rel} -> [{link}]")
    print(f"Notas analizadas: {len(files)}")
    if errors:
        print(f"\n{len(errors)} problema(s):")
        for e in errors:
            print("  -", e)
        return 1
    print("✅ Frontmatter y enlaces OK en todas las notas.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
