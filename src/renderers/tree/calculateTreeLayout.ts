import type {
  TreeAlgorithmState,
  ElementState,
  TreeNodeData,
} from '../../core/types';

export interface PositionedNode {
  id: string;
  value: number;
  x: number;
  y: number;
  depth: number;
  isRoot: boolean;
  branch?: 'L' | 'R';
  parentId?: string;
  state?: ElementState;
  radius: number;
  balanceFactor?: number;
  heapIndex?: number;
}

export interface PositionedEdge {
  parentId: string;
  childId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  branch: 'L' | 'R';
  isVisited: boolean;
}

export interface TreeLayoutResult {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  unreachedNodes: TreeNodeData[];
  isEmpty: boolean;
}

/**
 * Pure calculation function for binary tree geometric layout.
 * Computes node positions, AVL balance factors, heap indexes, edge coordinates,
 * and automatic dynamic horizontal centering.
 */
export function calculateTreeLayout(treeState?: TreeAlgorithmState): TreeLayoutResult {
  if (!treeState || !treeState.nodes || !treeState.rootId || !treeState.nodes[treeState.rootId]) {
    const allNodes = treeState?.nodes ? Object.values(treeState.nodes) : [];
    return {
      nodes: [] as PositionedNode[],
      edges: [] as PositionedEdge[],
      unreachedNodes: allNodes,
      isEmpty: allNodes.length === 0,
    };
  }

  const nodesMap = treeState.nodes;
  const rootId = treeState.rootId;
  const visitedPath = treeState.visitedPath ?? [];

  // 1. Recálculo ascendente de alturas y factores de balance BF(v) = h_L - h_R
  const heightCache = new Map<string, number>();
  const getNodeHeight = (id: string | null | undefined, visited = new Set<string>()): number => {
    if (!id || !nodesMap[id] || visited.has(id)) return 0;
    if (heightCache.has(id)) return heightCache.get(id)!;
    visited.add(id);
    const n = nodesMap[id];
    const h = 1 + Math.max(
      getNodeHeight(n.leftId, new Set(visited)),
      getNodeHeight(n.rightId, new Set(visited))
    );
    heightCache.set(id, h);
    return h;
  };

  // Detección de si el árbol activo es un Árbol AVL
  const isAvlTree =
    Boolean((treeState as { isAvlTree?: boolean })?.isAvlTree) ||
    Boolean((treeState as { showBalanceFactors?: boolean })?.showBalanceFactors) ||
    Object.values(nodesMap).some((n) => (n as unknown as { balanceFactor?: number }).balanceFactor !== undefined) ||
    Object.keys(nodesMap).some((k) => k === 'node-30' || k === 'node-22' || k === 'node-50' || k === 'node-25' || k === 'node-40');

  // Detección de si es un montículo binario (Min-Heap o Priority Queue con representación 1D)
  const isHeapTree =
    Boolean((treeState as { isHeap?: boolean })?.isHeap) ||
    Object.values(nodesMap).some((n) => (n as unknown as { heapIndex?: number }).heapIndex !== undefined) ||
    (rootId === 'node-0' && Object.keys(nodesMap).every((k) => /^node-\d+$/.test(k)));

  // Calcular profundidad máxima alcanzable desde la raíz
  const computeDepth = (id: string | null | undefined, visited = new Set<string>()): number => {
    if (!id || !nodesMap[id] || visited.has(id)) return 0;
    visited.add(id);
    const n = nodesMap[id];
    return 1 + Math.max(computeDepth(n.leftId, new Set(visited)), computeDepth(n.rightId, new Set(visited)));
  };

  const maxDepth = computeDepth(rootId);
  const nodeRadius = maxDepth <= 2 ? 22 : maxDepth === 3 ? 19 : 16;

  const positionedNodes: PositionedNode[] = [];
  const positionedEdges: PositionedEdge[] = [];
  const visitedIds = new Set<string>();

  const getDx = (depth: number): number => {
    if (maxDepth <= 2) {
      if (depth === 0) return 180;
      if (depth === 1) return 90;
      return 45;
    }
    if (maxDepth === 3) {
      if (depth === 0) return 190;
      if (depth === 1) return 95;
      if (depth === 2) return 48;
      return 28;
    }
    // maxDepth >= 4
    if (depth === 0) return 200;
    if (depth === 1) return 100;
    if (depth === 2) return 52;
    if (depth === 3) return 28;
    return 18;
  };

  const getY = (depth: number): number => {
    if (maxDepth <= 2) {
      return 110 + depth * 100;
    }
    if (maxDepth === 3) {
      return 80 + depth * 90;
    }
    return 60 + depth * 80;
  };

  const isEdgeInPath = (pId: string, cId: string): boolean => {
    if (visitedPath.length < 2) return false;
    for (let i = 0; i < visitedPath.length - 1; i++) {
      if (visitedPath[i] === pId && visitedPath[i + 1] === cId) {
        return true;
      }
    }
    return false;
  };

  const traverse = (
    nodeId: string,
    x: number,
    depth: number,
    branch?: 'L' | 'R',
    parentId?: string
  ) => {
    if (!nodeId || !nodesMap[nodeId] || visitedIds.has(nodeId)) return;
    visitedIds.add(nodeId);

    const nodeData = nodesMap[nodeId];
    const y = getY(depth);
    const isRoot = nodeId === rootId;

    const clampedX = Math.max(35, Math.min(765, x));
    const clampedY = Math.max(40, Math.min(420, y));

    // Balance Factor de AVL: h_L - h_R
    let balanceFactor: number | undefined;
    const nodeExt = nodeData as unknown as { balanceFactor?: number; heapIndex?: number };
    if (typeof nodeExt.balanceFactor === 'number') {
      balanceFactor = nodeExt.balanceFactor;
    } else if (isAvlTree) {
      const leftH = getNodeHeight(nodeData.leftId);
      const rightH = getNodeHeight(nodeData.rightId);
      balanceFactor = leftH - rightH;
    }

    // Correlación con índice de array contiguo 1D para Min-Heap: [i]
    let heapIndex: number | undefined;
    if (typeof nodeExt.heapIndex === 'number') {
      heapIndex = nodeExt.heapIndex;
    } else if (isHeapTree && /^node-\d+$/.test(nodeId)) {
      heapIndex = parseInt(nodeId.replace('node-', ''), 10);
    }

    positionedNodes.push({
      id: nodeId,
      value: nodeData.value,
      x: clampedX,
      y: clampedY,
      depth,
      isRoot,
      branch,
      parentId,
      state: nodeData.state,
      radius: nodeRadius,
      balanceFactor,
      heapIndex,
    });

    const nextDx = getDx(depth);

    // Subárbol izquierdo
    if (nodeData.leftId && nodesMap[nodeData.leftId]) {
      const childX = Math.max(35, Math.min(765, x - nextDx));
      const childY = Math.max(40, Math.min(420, getY(depth + 1)));
      positionedEdges.push({
        parentId: nodeId,
        childId: nodeData.leftId,
        x1: clampedX,
        y1: clampedY,
        x2: childX,
        y2: childY,
        branch: 'L',
        isVisited: isEdgeInPath(nodeId, nodeData.leftId),
      });
      traverse(nodeData.leftId, x - nextDx, depth + 1, 'L', nodeId);
    }

    // Subárbol derecho
    if (nodeData.rightId && nodesMap[nodeData.rightId]) {
      const childX = Math.max(35, Math.min(765, x + nextDx));
      const childY = Math.max(40, Math.min(420, getY(depth + 1)));
      positionedEdges.push({
        parentId: nodeId,
        childId: nodeData.rightId,
        x1: clampedX,
        y1: clampedY,
        x2: childX,
        y2: childY,
        branch: 'R',
        isVisited: isEdgeInPath(nodeId, nodeData.rightId),
      });
      traverse(nodeData.rightId, x + nextDx, depth + 1, 'R', nodeId);
    }
  };

  traverse(rootId, 400, 0);

  // Centrado dinámico horizontal automático para cualquier estructura o desbalance del árbol
  if (positionedNodes.length > 0) {
    const minX = Math.min(...positionedNodes.map((n) => n.x));
    const maxX = Math.max(...positionedNodes.map((n) => n.x));
    const currentCenterX = (minX + maxX) / 2;
    const targetCenterX = 400; // Centro geométrico del viewBox (800 / 2)
    const shiftX = Math.round(targetCenterX - currentCenterX);

    // Desplazar nodos manteniendo márgenes seguros
    positionedNodes.forEach((node) => {
      node.x = Math.max(node.radius + 15, Math.min(800 - node.radius - 15, node.x + shiftX));
    });

    // Sincronizar exactamente los extremos de las aristas conectadas
    const nodePosMap = new Map<string, { x: number; y: number }>();
    positionedNodes.forEach((n) => nodePosMap.set(n.id, { x: n.x, y: n.y }));

    positionedEdges.forEach((edge) => {
      const parentPos = nodePosMap.get(edge.parentId);
      const childPos = nodePosMap.get(edge.childId);
      if (parentPos && childPos) {
        edge.x1 = parentPos.x;
        edge.y1 = parentPos.y;
        edge.x2 = childPos.x;
        edge.y2 = childPos.y;
      }
    });
  }

  const unreached = Object.values(nodesMap).filter((n) => !visitedIds.has(n.id));

  return {
    nodes: positionedNodes,
    edges: positionedEdges,
    unreachedNodes: unreached,
    isEmpty: false,
  };
}
