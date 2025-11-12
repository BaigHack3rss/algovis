# AlgoVis
An interactive algorithm visualizer built with Vue 3 and TypeScript. It animates sorting algorithms and provides controls to step through and inspect each operation.

---

## 🔎 Current status

- Built with: Vue 3 + TypeScript + Vite + Vuetify
- Bundle optimization: dynamic imports for algorithm modules and the popup UI (lazy-loading)
- Implemented algorithms: Bubble Sort, Insertion Sort, Selection Sort, Merge Sort, Quick Sort
- Playback features: play/pause, scrub slider, step counter, adjustable speed (fast-forward / rewind), and operation highlighting (compare, swap, write, pivot, active ranges)
- Data controls: Randomize dataset button to generate new arrays for experimentation
- UX: responsive popup dialog, operation badges, subarray visualization, and per-operation coloring

---

## 🎯 Goals / Next (TODO) algorithms

The following are prioritized algorithm demos we'd like to ship next. Each item includes a short note on visualization complexity.

### Graph algorithms
- [ ] Breadth-First Search (BFS) — level-by-level traversal visualization
- [ ] Depth-First Search (DFS) — stack/recursion visualization and discovery/finish times
- [ ] Dijkstra’s Algorithm — weighted shortest path with priority queue animation
- [ ] A* (A-Star) Pathfinding — heuristic-driven pathfinding and open/closed set visualization

### Tree algorithms
- [ ] Binary Search Tree — insertion and traversal animations (inorder/preorder/postorder)
- [ ] AVL Tree — rotations and balancing (higher animation complexity)

### Array / Logic demos (smaller additions)
- [ ] Binary Search — index narrowing visualization on a sorted array
- [ ] Tower of Hanoi — recursive move animation and step counter
- [ ] Recursion tree visualization — show divide-and-conquer call tree (useful for Merge/Quick breakdowns)

---

## ⚙️ Local development

1. Install dependencies

```bash
npm install
```

2. Run dev server (hot reload)

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Lint

```bash
npm run lint
```

---