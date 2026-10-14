---
id: public-assets
title: "public/ — Assets estáticos de la PWA"
type: module
status: stable
tags:
  - algonotebook/module
  - area/public
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[src/README]]"
  - "[[Guía - Instalación y Desarrollo]]"
---

# `public/` — Recursos estáticos servidos tal cual

Archivos que Vite copia sin procesar a la raíz del build. Referenciados por `index.html` y por el
manifest de la PWA (`vite-plugin-pwa` en `vite.config.ts`).

| Archivo | Uso |
| --- | --- |
| `favicon.svg` | Icono del sitio (`<link rel="icon">` en `index.html`). |
| `icons.svg` | Conjunto de iconos usados por la PWA / interfaz. |

> Los recursos **importados por componentes** (imágenes, SVGs de React) no van aquí, sino en
> `src/assets/`. `public/` es solo para ficheros accesibles por URL absoluta (`/favicon.svg`).
