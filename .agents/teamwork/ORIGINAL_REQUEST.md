---
tipo: artefacto
area: tooling
estado: activo
tags:
  - proyecto/algonotebook
  - tipo/artefacto
  - area/tooling
  - estado/activo
---

# Original User Request

## 2026-10-13T04:30:23Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Multi-agent execution of encyclopedic content expansion
> Requested team: Equipo multiespecialista de bots organizados por área temática (DSA Básico/Intermedio, DSA Avanzado, Matemáticas Continuas y Matemáticas Discretas/Probabilidad)

Expansión enciclopédica intensiva de contenidos desde nivel básico hasta avanzado en AlgoNotebook y MathNotebook mediante un equipo de bots especializados por área, cubriendo un catálogo amplio de más de 8 nuevos temas y algoritmos por cuaderno con rigor académico, visualizadores interactivos en tiempo real y fichas técnicas formales.

Working directory: `/home/leann027/Documentos/github/AlgoNotebook`
Integrity mode: development

## Requirements

### R1. Expansión Curricular Progresiva en AlgoNotebook (DSA)
- Incorporar al menos 8 nuevos algoritmos y estructuras cubriendo el espectro formativo de Ciencias de la Computación:
  - **Nivel Introductorio:** Búsqueda Lineal vs Binaria con comparador interactivo, y Cola de Prioridad / Min-Max Heap.
  - **Nivel Intermedio:** Algoritmo de Kadane (máxima subsuma contigua en $O(N)$), Ordenamiento Topológico (Kahn / DFS en grafos acíclicos dirigidos), y Árboles AVL con rotaciones balanceadas automáticas.
  - **Nivel Avanzado:** Algoritmo de Bellman-Ford (detección de ciclos negativos de coste), Distancia de Levenshtein (programación dinámica matricial), y Componentes Fuertemente Conexas (Tarjan / Kosaraju).
- Cada nuevo módulo algorítmico debe contar con su generador de trazas (`trace.ts`), código dual en C y Python (`code.c`, `code.py`), estados de visualización, y ficha técnica en modal flotante con relaciones de recurrencia y Teorema Maestro en KaTeX.
- Integrar cada nuevo algoritmo en el catálogo por categorías de `UnifiedNotebookHeader`, en la barra lateral con sus respectivos dots de nivel y badges asintóticos Big-O, y en el `CurriculumView` con persistencia en `localStorage`.

### R2. Expansión Curricular Progresiva en MathNotebook
- Desarrollar al menos 8 nuevos módulos pedagógicos distribuidos en las ramas matemáticas:
  - **Análisis y Cálculo:** Series de Fourier (descomposición y síntesis armónica) y Ecuaciones Diferenciales Ordinarias (EDO de primer orden por método de Euler y separación de variables).
  - **Álgebra Lineal:** Descomposición en Valores Singulares (SVD) y Proyecciones Ortogonales con proceso de Gram-Schmidt.
  - **Geometría y Espacios:** Coordenadas Polares y Transformaciones Afines en $\mathbb{R}^2$.
  - **Optimización Numérica:** Método de Newton-Raphson Multivariable en 2D.
  - **Probabilidad y Estadística:** Teorema del Límite Central (convergencia empírica) y Distribución Binomial / Poisson.
  - **Matemática Discreta:** Aritmética Modular, Algoritmo Extendido de Euclides e Identidad de Bézout.
- Cada módulo matemático debe incluir: ficha técnica formal con definición en KaTeX, hipótesis rigurosas, invariante, tasa de convergencia o condiciones de borde, pestaña de fundamentos algebraicos (`algebraicFoundations`), traza evaluable y visualizador interactivo 2D sin clipping.

### R3. Paridad, Normalización y Sistema de Diseño
- Sincronizar todos los nuevos módulos con el sistema de tokens del proyecto (`Stitch/DESIGN.md`, base crema `#FDFBF7`, borde papel `#E5E0D8`, paleta pastel de resaltadores).
- Garantizar que las fichas técnicas en ambos cuadernos se abran exclusivamente como ventanas modales flotantes centradas y no como acordeones colapsables en la barra lateral.
- Registrar las conexiones cruzadas (`crossConnections`) en el grafo DAG (`curriculum.ts`) para mantener la navegación interactiva contextual.

## Acceptance Criteria

### Integridad del Código y Tipado Estricto
- [ ] Ejecución de `npm run lint` (`oxlint`) con 0 advertencias y 0 errores en todos los archivos modificados y creados.
- [ ] Compilación TypeScript estricta con `tsc -b` sin errores y con cero tipos `any`.
- [ ] Compilación de producción exitosa con `npm run build` (`vite build`) y regeneración limpia del Service Worker PWA (`dist/sw.js`).

### Calidad Visual e Interactividad
- [ ] Todos los visualizadores interactivos renderizan fluidamente sin caídas de rendimiento ni fugas de memoria al ejecutar los pasos de la traza.
- [ ] Todas las fórmulas matemáticas renderizan con KaTeX formal y cuentan con envoltura `overflow-x-auto py-1.5` que previene cualquier desborde o recorte horizontal.
- [ ] Los filtros, marcadores (`localStorage`) y contadores de unidades reflejan la totalidad de los nuevos temas agregados.


## 2026-10-13T12:56:32Z

# Teamwork Project Prompt — Resumed Execution

> Status: Resumed from previous session
> Goal: Multi-agent execution of encyclopedic content expansion across AlgoNotebook and MathNotebook
> Requested team: Equipo multiespecialista de bots organizados por área temática (DSA Básico/Intermedio, DSA Avanzado, Matemáticas Continuas y Matemáticas Discretas/Probabilidad)

NOTA DE REANUDACIÓN: La fase preliminar de relevamiento ya completó el informe arquitectónico exhaustivo en `.agents/teamwork/explorer_survey_math/handoff.md`. El espacio de trabajo `/home/leann027/Documentos/github/AlgoNotebook` cuenta con 0 errores y 0 advertencias en `oxlint`, y compilación limpia con `tsc -b`. Proceder de inmediato a la síntesis y a la ejecución paralela de las pistas de implementación DSA y Matemáticas.

Expansión enciclopédica intensiva de contenidos desde nivel básico hasta avanzado en AlgoNotebook y MathNotebook mediante un equipo de bots especializados por área, cubriendo un catálogo amplio de más de 8 nuevos temas y algoritmos por cuaderno con rigor académico, visualizadores interactivos en tiempo real y fichas técnicas formales.

Working directory: `/home/leann027/Documentos/github/AlgoNotebook`
Integrity mode: development

## Requirements

### R1. Expansión Curricular Progresiva en AlgoNotebook (DSA)
- Incorporar al menos 8 nuevos algoritmos y estructuras cubriendo el espectro formativo de Ciencias de la Computación:
  - **Nivel Introductorio:** Búsqueda Lineal vs Binaria con comparador interactivo, y Cola de Prioridad / Min-Max Heap.
  - **Nivel Intermedio:** Algoritmo de Kadane (máxima subsuma contigua en $O(N)$), Ordenamiento Topológico (Kahn / DFS en grafos acíclicos dirigidos), y Árboles AVL con rotaciones balanceadas automáticas.
  - **Nivel Avanzado:** Algoritmo de Bellman-Ford (detección de ciclos negativos de coste), Distancia de Levenshtein (programación dinámica matricial), y Componentes Fuertemente Conexas (Tarjan / Kosaraju).
- Cada nuevo módulo algorítmico debe contar con su generador de trazas (`trace.ts`), código dual en C y Python (`code.c`, `code.py`), estados de visualización, y ficha técnica en modal flotante con relaciones de recurrencia y Teorema Maestro en KaTeX.
- Integrar cada nuevo algoritmo en el catálogo por categorías de `UnifiedNotebookHeader`, en la barra lateral con sus respectivos dots de nivel y badges asintóticos Big-O, y en el `CurriculumView` con persistencia en `localStorage`.

### R2. Expansión Curricular Progresiva en MathNotebook
- Desarrollar al menos 8 nuevos módulos pedagógicos distribuidos en las ramas matemáticas (ver blueprint en `.agents/teamwork/explorer_survey_math/handoff.md`):
  - **Análisis y Cálculo:** Series de Fourier (descomposición y síntesis armónica) y Ecuaciones Diferenciales Ordinarias (EDO de primer orden por método de Euler y separación de variables).
  - **Álgebra Lineal:** Descomposición en Valores Singulares (SVD) y Proyecciones Ortogonales con proceso de Gram-Schmidt.
  - **Geometría y Espacios:** Coordenadas Polares y Transformaciones Afines en $\mathbb{R}^2$.
  - **Optimización Numérica:** Método de Newton-Raphson Multivariable en 2D.
  - **Probabilidad y Estadística:** Teorema del Límite Central (convergencia empírica) y Distribución Binomial / Poisson.
  - **Matemática Discreta:** Aritmética Modular, Algoritmo Extendido de Euclides e Identidad de Bézout.
- Cada módulo matemático debe incluir: ficha técnica formal con definición en KaTeX, hipótesis rigurosas, invariante, tasa de convergencia o condiciones de borde, pestaña de fundamentos algebraicos (`algebraicFoundations`), traza evaluable y visualizador interactivo 2D sin clipping.

### R3. Paridad, Normalización y Sistema de Diseño
- Sincronizar todos los nuevos módulos con el sistema de tokens del proyecto (`Stitch/DESIGN.md`, base crema `#FDFBF7`, borde papel `#E5E0D8`, paleta pastel de resaltadores).
- Garantizar que las fichas técnicas en ambos cuadernos se abran exclusivamente como ventanas modales flotantes centradas y no como acordeones colapsables en la barra lateral.
- Registrar las conexiones cruzadas (`crossConnections`) en el grafo DAG (`curriculum.ts`) para mantener la navegación interactiva contextual.

## Acceptance Criteria

### Integridad del Código y Tipado Estricto
- [ ] Ejecución de `npm run lint` (`oxlint`) con 0 advertencias y 0 errores en todos los archivos modificados y creados.
- [ ] Compilación TypeScript estricta con `tsc -b` sin errores y con cero tipos `any`.
- [ ] Compilación de producción exitosa con `npm run build` (`vite build`) y regeneración limpia del Service Worker PWA (`dist/sw.js`).

### Calidad Visual e Interactividad
- [ ] Todos los visualizadores interactivos renderizan fluidamente sin caídas de rendimiento ni fugas de memoria al ejecutar los pasos de la traza.
- [ ] Todas las fórmulas matemáticas renderizan con KaTeX formal y cuentan con envoltura `overflow-x-auto py-1.5` que previene cualquier desborde o recorte horizontal.
- [ ] Los filtros, marcadores (`localStorage`) y contadores de unidades reflejan la totalidad de los nuevos temas agregados.
