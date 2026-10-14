---
id: prd-algo-2025
title: "PRD & Design Brief — AlgoNotebook (PRD-ALGO-2025)"
type: architecture
status: stable
tags:
  - algonotebook/diseno
  - area/stitch
created: 2026-10-13
updated: 2026-10-13
related:
  - "[[Sistema de Diseño - Tokens y Resaltadores]]"
  - "[[src/design-system/README]]"
  - "[[Agents.md]]"
---

# Product Requirements Document (PRD) & Design Brief
**Project Name:** AlgoNotebook (Interactive Engineering Laboratory for DS&A)  
**Version:** 1.0.0 • **Status:** Approved for Implementation • **Document Ref:** `PRD-ALGO-2025`

---

## 1. Executive Summary & Vision

### 1.1 Problem Statement
Computer Science students and junior engineers often struggle with data structures and algorithmic mental models due to two key pain points:
1. **Abstract visualization disconnect:** Standard algorithm visualizers feel sterile, clinical, and detached from pedagogical study workflows (often looking like debugging tools or math software).
2. **Disconnected syntax & execution:** Existing tools separate line-by-line code tracing from memory state mutations, making it difficult to understand *why* an operation occurred and what registers changed.

### 1.2 Product Vision
**AlgoNotebook** reimagines algorithm exploration through the lens of a **clean, tactile engineering laboratory sketchbook**. It bridges tactile learning, code comprehension, and algorithmic intuition in a distraction-free, aesthetically inviting environment for computer science learners and educators.

---

## 2. Target Audience & Personas

| Persona | Archetype | Needs & Goals | Core Friction Addressed |
| :--- | :--- | :--- | :--- |
| **Elena V.** | *CS Undergraduate (Sophomore)* | Passing Algorithms & Data Structures exams; building visual memory for pointer movements and recursion trees. | Dense pseudocode textbooks provide no interactive step-by-step state traces. |
| **Marcus T.** | *Self-Taught / Bootcamp Grad* | Preparing for technical coding interviews (LeetCode/Blind 75); understanding time/space trade-offs visually. | Fast-paced animation tools skip nuanced edge cases and register swaps. |
| **Dr. Aris Thorne** | *Algorithms Lecturer* | Demonstrating sorting passes, tree rotations, and DP memo tables live during classroom lectures. | Complex IDE debugging tools overwhelm introductory students. |

---

## 3. Product Architecture & Core Features

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AlgoNotebook App                              │
├─────────────────┬──────────────────────────────────┬───────────────────┤
│ Top Bar Nav     │ Workspace & Visualizer Canvas    │ Margin Laboratory │
├─────────────────┼──────────────────────────────────┼───────────────────┤
│ • Module Switch │ • Dot-Grid Interactive Canvas    │ • Folder Tabs     │
│ • Study Mode    │ • Dynamic Bar/Node Renderers     │ • Synced Trace    │
│ • State Reset   │ • Sticky Annotation Post-It      │ • Variable Badges │
│ • Export Notes  │ • Millimeter Ruler Player Bar    │ • Complexity Stats│
└─────────────────┴──────────────────────────────────┴───────────────────┘
```

### 3.1 Top Navigation & Study Header
* **Global Navigation:** Tabs for *Visualizer*, *Curriculum*, *Notebooks*, and *Complexity Lab*.
* **Algorithm Selector:** Dropdown grouped by categories:
  * *Sorting:* Bubble Sort, QuickSort, Merge Sort, Insertion Sort, Heap Sort.
  * *Trees & Graphs:* BST Insertion/Deletion, AVL Rotations, Dijkstra, BFS/DFS.
  * *Dynamic Programming:* 0/1 Knapsack, Longest Common Subsequence, Fibonacci Grid.
  * *Two Pointers & Sliders:* Fast & Slow Pointers, Sliding Window maximums.
* **Study Mode Toggle:** Strips extraneous UI, enhances contrast, and enables self-quiz interactive prompts (e.g., *"Predict next swap"*).
* **Lab Utilities:** `Reset Data`, `Export Notes (PDF/Markdown)`, and `Notebook Settings`.

### 3.2 Visualizer Workspace (Center Canvas)
* **Dot-Grid Paper Metaphor:** Clean 24px radial dot matrix simulating heavyweight engineering bond paper (`#FDFBF7` background).
* **Data Structure Representation:**
  * Clean technical ink borders (`2px solid #1E232A`).
  * Relative height or node graph scaling with clear value labels.
  * Color-coded semantic illumination:
    * **Yellow Highlighter (`#FEF08A`):** Active read/comparison pointer (`j` vs `j+1`).
    * **Peach/Coral Highlighter (`#FFD7BA`):** Active write/swap operation.
    * **Mint Sage Highlighter (`#BBF7D0`):** Locked/verified sorted boundary.
    * **Lavender Highlighter (`#E9D5FF`):** Auxiliary pointers (`low`, `high`, `mid`, `pivot`).
* **Tactile Sticky Note Commentary:** Real-time post-it annotation card anchored near active pointers explaining human logic (e.g., *"Step 5 of 22: Comparing arr[j=2] (42) and arr[j+1] (18). 42 > 18, so swap is scheduled."*).

### 3.3 Folder-Indexed Code & Margin Notes (Right Lab Panel)
* **File Folder Tabs:** Tabbed navigation between multi-language implementations: `Python`, `C`, `TypeScript`, and formal `Pseudocode`.
* **Synchronized Line Highlighter:** Real-time highlight bar locking to the exact executed line of code corresponding to the visual canvas step.
* **Margin Notes (Live State):**
  * Variable badges indicating outer loop index (`i`), inner loop/pointer index (`j`).
  * Register inspect boxes showing current comparison values (`arr[j]`, `arr[j+1]`).
  * Cumulative counters: Comparison tally, swap count, and progress toward $O(N^2)$ or $O(N \log N)$ bounds.

### 3.4 Millimeter-Ruler Playback & Control Bar (Bottom Strip)
* **Ruler Graduation Aesthetic:** Tactile tick marks graduated at millimeter intervals along the top edge of the control bar.
* **Scrubber Controls:**
  * Step Back (`|<`), Play/Pause (`Run`), Step Forward (`>|`).
  * Granular step scrubber slider (e.g., `Step 5 / 22`).
  * Speed selector presets: `0.5x`, `1.0x`, `2.0x`, `Max Speed`.
* **Input Actions:** `Shuffle Array`, `Custom Input` (modal for entering user arrays or edge cases).

---

## 4. Design System & Brand Identity Tokens

### 4.1 Typography
* **Primary UI & Headings:** `Plus Jakarta Sans` (weights: 500, 600, 700) — friendly, geometric, crisp.
* **Code, Pointers & Numeric Values:** `JetBrains Mono` or `Fira Code` — high legibility, tabular figures for indices and memory counters.

### 4.2 Color Specification
* `--paper-base`: `#FDFBF7` (Main paper canvas background)
* `--paper-surface`: `#FFFFFF` (Elevated cards and code containers)
* `--paper-border`: `#E5E0D8` (Subtle technical borders & dividers)
* `--paper-grid`: `#EAE5DC` (Canvas dot matrix)
* `--ink-primary`: `#1E232A` (Midnight ink for titles, code, and values)
* `--ink-secondary`: `#5C6470` (Graphite for metadata and comments)
* `--ink-muted`: `#9DA4B0` (Faint pencil 2H for line numbers & rules)
* `--highlighter-compare`: `#FEF08A` (Yellow highlighter)
* `--highlighter-swap`: `#FFD7BA` (Peach highlighter)
* `--highlighter-success`: `#BBF7D0` (Mint green highlighter)
* `--highlighter-pointer`: `#E9D5FF` (Lavender highlighter)

---

## 5. Technical Requirements & Implementation Architecture

### 5.1 Frontend Tech Stack
* **Framework:** React 19 / Next.js 15 (App Router) or Vite + Vanilla TS
* **Styling:** Tailwind CSS with custom theme token extensions
* **Animation & Motion:** Framer Motion or lightweight CSS transitions with FLIP (First, Last, Invert, Play) technique for in-place bar swapping
* **State Management:** Zustand / Nanostores for tracking step arrays and playback frames

### 5.2 Algorithm Engine Contract
Every algorithm module conforms to a unified generator engine pattern:

```typescript
export interface StepEvent {
  stepIndex: number;
  totalSteps: number;
  highlightedLine: number;
  language: 'python' | 'c' | 'pseudocode';
  arrayState: number[];
  pointers: { [key: string]: number };
  activeAction: 'compare' | 'swap' | 'locked' | 'pivot';
  explanationText: string;
  metrics: {
    comparisons: number;
    swaps: number;
    passNumber: number;
  };
}
```

---

## 6. Milestones & Delivery Roadmap

| Phase | Milestone | Deliverables | Target Timeline |
| :--- | :--- | :--- | :--- |
| **Phase 1: Foundation** | **Design Tokens & Shell** | Complete UI design system, desktop visualizer shell, Bubble Sort interactive trace. | **Completed (Current)** |
| **Phase 2: Core Sorting** | **Sorting Suite Expansion** | QuickSort (pivot partitioning), Merge Sort (auxiliary array view), Custom Input validation. | Sprint 2 (2 weeks) |
| **Phase 3: Data Structures** | **Trees & Dynamic Prog** | Binary Search Tree canvas, AVL auto-balancing animations, Grid-based DP visualizer. | Sprint 3 (3 weeks) |
| **Phase 4: Study Lab** | **Pedagogical Tools** | Study Mode active recall quizzes, Export notes to PDF/Anki, Keyboard shortcuts (`Space`, `←`, `→`). | Sprint 4 (2 weeks) |

---

## 7. Success Metrics & KPIs
1. **Time-to-Mental-Model:** Reduction in time required for a student to trace a partition/swap cycle (target: < 90 seconds).
2. **Engagement & Session Duration:** Average study session > 18 minutes per user.
3. **Step Scrubber Interaction Rate:** > 80% of active sessions utilizing manual single-step frame stepping over auto-play.
4. **Note Export Rate:** > 25% of users exporting study summaries post-session.
