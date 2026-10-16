import React, { useMemo } from 'react';
import type { TreeAlgorithmState, ActiveAction, ElementState } from '../core/types';

export interface TreeHierarchyViewportProps {
  treeState?: TreeAlgorithmState;
  activeAction?: ActiveAction;
  className?: string;
}

interface PositionedNode {
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

interface PositionedEdge {
  parentId: string;
  childId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  branch: 'L' | 'R';
  isVisited: boolean;
}

/**
 * TreeHierarchyViewport
 *
 * Visualizador SVG de árboles binarios con estética de cuaderno de laboratorio técnico.
 * Soporta posicionamiento jerárquico no solapante, trazado de aristas carbón,
 * resaltado de caminos visitados (highlighter) y estados semánticos de nodos.
 */
export const TreeHierarchyViewport: React.FC<TreeHierarchyViewportProps> = ({
  treeState,
  activeAction,
  className = '',
}) => {
  const { nodes, edges, unreachedNodes, isEmpty } = useMemo(() => {
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
  }, [treeState]);

  return (
    <svg
      viewBox="0 0 800 460"
      preserveAspectRatio="xMidYMid meet"
      className={`w-full h-full min-h-[440px] select-none ${className}`}
      aria-label="Visualizador de Jerarquía de Árbol Binario"
    >
      <defs>
        {/* Patrón de cuadrícula de papel técnico sutil */}
        <pattern
          id="tree-dot-grid"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="1.5" fill="#EAE5DC" />
        </pattern>

        {/* Filtro de sombra táctil de tinta */}
        <filter id="tactile-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#1E232A" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Fondo con rejilla técnica sutil de ingeniería */}
      <rect width="100%" height="100%" fill="url(#tree-dot-grid)" />

      {/* Clave activa / En búsqueda o inserción */}
      {treeState?.currentKey !== undefined && treeState?.currentKey !== null && (
        <g transform="translate(24, 20)" filter="url(#tactile-shadow)">
          <rect
            x="0"
            y="0"
            width="134"
            height="30"
            rx="4"
            fill="#FFFFFF"
            stroke="#1E232A"
            strokeWidth="1.5"
          />
          <text
            x="12"
            y="16"
            dominantBaseline="central"
            className="font-mono text-[10px] font-bold fill-[#5C6470]"
          >
            TARGET KEY:
          </text>
          <rect
            x="88"
            y="4"
            width="38"
            height="22"
            rx="3"
            fill="#FEF08A"
            stroke="#1E232A"
            strokeWidth="1.2"
          />
          <text
            x="107"
            y="15.5"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono text-xs font-bold fill-[#1E232A]"
          >
            {treeState.currentKey}
          </text>
        </g>
      )}

      {/* ESTADO VACÍO */}
      {isEmpty && (
        <g transform="translate(400, 220)">
          <circle
            cx="0"
            cy="0"
            r="36"
            fill="#FFFFFF"
            stroke="#9DA4B0"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <text
            x="0"
            y="-6"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono text-xs font-bold fill-[#5C6470]"
          >
            ÁRBOL VACÍO
          </text>
          <text
            x="0"
            y="12"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono text-[10px] fill-[#9DA4B0]"
          >
            Esperando inserción de datos
          </text>
        </g>
      )}

      {/* CAPA 1: ARISTAS DE UNIÓN (EDGES) */}
      <g className="edges-layer">
        {edges.map((edge) => {
          const edgeKey = `edge-${edge.parentId}-${edge.childId}`;
          const midX = (edge.x1 + edge.x2) / 2;
          const midY = (edge.y1 + edge.y2) / 2;

          return (
            <g key={edgeKey}>
              {/* Trazo grueso de resaltador si la arista fue recorrida en el camino actual */}
              {edge.isVisited && (
                <line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#FEF08A"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity={0.8}
                />
              )}

              {/* Trazo principal de tinta carbón */}
              <line
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="#1E232A"
                strokeWidth={edge.isVisited ? 3.5 : 2}
                strokeLinecap="round"
              />

              {/* Indicador de bifurcación (L / R) en el punto medio de la arista */}
              <g transform={`translate(${midX}, ${midY})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="7.5"
                  fill="#FFFFFF"
                  stroke="#1E232A"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-mono text-[8px] font-bold fill-[#5C6470]"
                >
                  {edge.branch}
                </text>
              </g>
            </g>
          );
        })}
      </g>

      {/* CAPA 2: NODOS CIRCULARES */}
      <g className="nodes-layer">
        {nodes.map((node) => {
          const isInserted =
            node.id === treeState?.insertedNodeId || node.state === 'sorted';
          const isActive =
            node.id === treeState?.activeNodeId ||
            node.state === 'comparing' ||
            (activeAction === 'compare' && node.id === treeState?.activeNodeId);
          const isVisitedInPath =
            treeState?.visitedPath?.includes(node.id) ?? false;

          let fill = '#FFFFFF';
          if (isInserted) {
            fill = '#BBF7D0'; // Menta (highlighter-success)
          } else if (isActive) {
            fill = '#FEF08A'; // Amarillo (highlighter-compare)
          } else if (isVisitedInPath) {
            fill = '#FEF9C3'; // Amarillo suave de camino transitado
          }

          const r = node.radius ?? 22;
          const outerR = r + 6;

          return (
            <g key={node.id} className="transition-transform duration-200">
              {/* Aro exterior suave para nodo activo */}
              {isActive && (
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={outerR}
                    fill="none"
                    stroke="#FEF08A"
                    strokeWidth={3.5}
                    opacity={0.85}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={outerR}
                    fill="none"
                    stroke="#CA8A04"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={0.7}
                  />
                </>
              )}

              {/* Aro exterior para nodo recién insertado */}
              {isInserted && (
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={outerR}
                    fill="none"
                    stroke="#BBF7D0"
                    strokeWidth={3}
                    opacity={0.8}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={outerR - 1}
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={0.6}
                  />
                </>
              )}

              {/* Cuerpo del nodo circular */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={fill}
                stroke="#1E232A"
                strokeWidth={2}
                filter="url(#tactile-shadow)"
              />

              {/* Valor numérico en tipografía JetBrains Mono centrado */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`font-mono ${r <= 16 ? 'text-[11px]' : r <= 19 ? 'text-xs' : 'text-sm'} font-bold fill-[#1E232A] pointer-events-none`}
              >
                {node.value}
              </text>

              {/* Badge "NEW" si el nodo acaba de ser insertado */}
              {isInserted && (
                <g transform={`translate(${node.x + 8}, ${node.y - 25})`}>
                  <rect
                    x="0"
                    y="0"
                    width="28"
                    height="14"
                    rx="3"
                    fill="#BBF7D0"
                    stroke="#1E232A"
                    strokeWidth="1.5"
                    filter="url(#tactile-shadow)"
                  />
                  <text
                    x="14"
                    y="7.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono text-[8px] font-bold fill-[#1E232A]"
                  >
                    NEW
                  </text>
                </g>
              )}

              {/* Factor de Balance (AVL): bf in {-1, 0, +1, ±2} */}
              {node.balanceFactor !== undefined && (
                <g transform={`translate(${node.x + r - 3}, ${node.y - r + 3})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="8"
                    fill={Math.abs(node.balanceFactor) >= 2 ? '#FEE2E2' : '#F5F3EF'}
                    stroke={Math.abs(node.balanceFactor) >= 2 ? '#DC2626' : '#1E232A'}
                    strokeWidth="1.2"
                    filter="url(#tactile-shadow)"
                  />
                  <text
                    x="0"
                    y="2.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`font-mono text-[8px] font-bold ${
                      Math.abs(node.balanceFactor) >= 2 ? 'fill-[#DC2626]' : 'fill-[#1E232A]'
                    }`}
                  >
                    {node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
                  </text>
                </g>
              )}

              {/* Chip semántico debajo del nodo: Correlación de índice de array 1D [i] (Heap) o ROOT / L / R */}
              {node.heapIndex !== undefined ? (
                <g transform={`translate(${node.x - 16}, ${node.y + r + 5})`}>
                  <rect
                    x="0"
                    y="0"
                    width="32"
                    height="16"
                    rx="3"
                    fill={node.isRoot ? '#FEF08A' : '#E9D5FF'}
                    stroke="#1E232A"
                    strokeWidth="1.2"
                  />
                  <text
                    x="16"
                    y="8.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono text-[9px] font-bold fill-[#1E232A]"
                  >
                    [{node.heapIndex}]
                  </text>
                </g>
              ) : node.isRoot ? (
                <g transform={`translate(${node.x - 18}, ${node.y + 26})`}>
                  <rect
                    x="0"
                    y="0"
                    width="36"
                    height="15"
                    rx="3"
                    fill="#F5F3EF"
                    stroke="#1E232A"
                    strokeWidth="1.2"
                  />
                  <text
                    x="18"
                    y="8"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono text-[9px] font-bold fill-[#1E232A]"
                  >
                    ROOT
                  </text>
                </g>
              ) : node.branch === 'L' ? (
                <g transform={`translate(${node.x - 12}, ${node.y + 26})`}>
                  <rect
                    x="0"
                    y="0"
                    width="24"
                    height="15"
                    rx="3"
                    fill="#F5F3EF"
                    stroke="#1E232A"
                    strokeWidth="1.2"
                  />
                  <text
                    x="12"
                    y="8"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono text-[9px] font-bold fill-[#5C6470]"
                  >
                    L
                  </text>
                </g>
              ) : node.branch === 'R' ? (
                <g transform={`translate(${node.x - 12}, ${node.y + 26})`}>
                  <rect
                    x="0"
                    y="0"
                    width="24"
                    height="15"
                    rx="3"
                    fill="#F5F3EF"
                    stroke="#1E232A"
                    strokeWidth="1.2"
                  />
                  <text
                    x="12"
                    y="8"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono text-[9px] font-bold fill-[#5C6470]"
                  >
                    R
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </g>

      {/* CAPA 3: NODOS EN STAGING / CANDIDATOS (NODOS NO CONECTADOS AÚN) */}
      {unreachedNodes.length > 0 && (
        <g transform="translate(640, 20)" filter="url(#tactile-shadow)">
          <rect
            x="0"
            y="0"
            width="136"
            height={44 + unreachedNodes.length * 48}
            rx="6"
            fill="#FFFFFF"
            stroke="#9DA4B0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x="68"
            y="14"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono text-[9px] font-bold fill-[#5C6470]"
          >
            NODO CANDIDATO
          </text>
          {unreachedNodes.map((n, idx) => {
            const ny = 42 + idx * 46;
            const isInserted = n.id === treeState?.insertedNodeId;
            return (
              <g key={n.id} transform={`translate(68, ${ny})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="18"
                  fill={isInserted ? '#BBF7D0' : '#FFFFFF'}
                  stroke="#1E232A"
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-mono text-xs font-bold fill-[#1E232A]"
                >
                  {n.value}
                </text>
                {isInserted && (
                  <text
                    x="0"
                    y="24"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono text-[8px] font-bold fill-[#16A34A]"
                  >
                    INSERTANDO...
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};
