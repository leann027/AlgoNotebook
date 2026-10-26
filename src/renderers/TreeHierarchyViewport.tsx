import React, { useMemo } from 'react';
import type { TreeAlgorithmState, ActiveAction } from '../core/types';
import { calculateTreeLayout } from './tree/calculateTreeLayout';

export interface TreeHierarchyViewportProps {
  treeState?: TreeAlgorithmState;
  activeAction?: ActiveAction;
  className?: string;
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
  const { nodes, edges, unreachedNodes, isEmpty } = useMemo(
    () => calculateTreeLayout(treeState),
    [treeState]
  );

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
