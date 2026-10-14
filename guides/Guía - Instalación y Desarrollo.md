---
id: guia-instalacion-desarrollo
title: "Guía — Instalación y Desarrollo"
type: guide
status: stable
tags:
  - algonotebook/guia
  - area/raiz
  - workflow/dev
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[README]]"
  - "[[src/README]]"
  - "[[Agents.md]]"
---

# Guía — Instalación y Desarrollo

## Prerrequisitos

- Node.js $\ge$ 20.12 (el `.nvmrc` fija **22**).
- npm $\ge$ 9.

## Puesta en marcha

```bash
npm install        # dependencias
npm run dev        # servidor de desarrollo con HMR → http://localhost:5173
```

## Verificación de calidad

| Comando | Qué valida |
| --- | --- |
| `npm run lint` | Oxlint + TypeScript (`strict`, cero `any`) |
| `npx tsc -b` | 0 errores / 0 advertencias |
| `npm run build` | Bundle de producción + Service Worker PWA en `dist/` |
| `npm run preview` | Sirve el build de producción |

## Notas

- El proyecto es una **PWA offline** (`vite-plugin-pwa` + Workbox); el build genera el Service Worker.
- No cometas `dist/`: es salida generada (ver `.gitignore`) y Vite la recrea.
- Reglas de código obligatorias en [[Agents.md]].
