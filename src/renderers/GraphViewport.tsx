import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Table2 } from 'lucide-react';
import type { GraphAlgorithmState, ActiveAction, GraphNodeData, GraphEdgeData } from '../core/types';

export interface GraphViewportProps {
  graphState?: GraphAlgorithmState;
  activeAction?: ActiveAction;
  className?: string;
}

/**
 * GraphViewport
 *
 * Visualizador interactivo SVG de grafos con estética de libreta técnica de laboratorio.
 * Soporta nodos coloreados según estados semánticos (frontera, evaluando, procesado),
 * aristas ponderadas con placas de peso, anillo pulsante en el nodo bajo inspección,
 * y paneles auxiliares superpuestos (cinta de cola FIFO para BFS y tabla técnica colapsable para Dijkstra).
 */
export const GraphViewport: React.FC<GraphViewportProps> = ({
  graphState,
  activeAction,
  className = '',
}) => {
  const [isDijkstraTableOpen, setIsDijkstraTableOpen] = useState(false);
  const nodesMap = graphState?.nodes ?? {};
  const nodesList: GraphNodeData[] = useMemo(
    () => Object.values(graphState?.nodes ?? {}),
    [graphState?.nodes]
  );
  const edgesList: GraphEdgeData[] = graphState?.edges ?? [];
  const isEmpty = nodesList.length === 0;

  return (
    <div
      className={`relative w-full h-full min-h-[440px] flex items-center justify-center select-none ${className}`}
    >
      {/* Lienzo SVG Responsivo */}
      <svg
        viewBox="0 0 800 460"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full min-h-[440px] relative"
        aria-label="Visualizador de Grafos"
      >
        <defs>
          {/* Rejilla milimétrica sutil estilo papel de laboratorio */}
          <pattern
            id="graph-dot-grid"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="#EAE5DC" />
          </pattern>

          {/* Sombra táctil suave para elementos en papel */}
          <filter id="graph-tactile-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#1E232A" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Fondo con rejilla técnica sutil de ingeniería */}
        <rect width="100%" height="100%" fill="url(#graph-dot-grid)" />

        {/* ESTADO VACÍO */}
        {isEmpty && (
          <g transform="translate(400, 230)">
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
              GRAFO VACÍO
            </text>
            <text
              x="0"
              y="12"
              textAnchor="middle"
              dominantBaseline="central"
              className="font-mono text-[10px] fill-[#9DA4B0]"
            >
              Esperando inicialización de nodos
            </text>
          </g>
        )}

        {/* CAPA 1: ARISTAS (EDGES) */}
        <g className="edges-layer">
          {edgesList.map((edge) => {
            const fromNode = nodesMap[edge.from];
            const toNode = nodesMap[edge.to];

            if (!fromNode || !toNode) return null;

            const isActive = edge.state === 'active' || edge.id === graphState?.activeEdgeId;
            const isTraversed = edge.state === 'traversed';

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            return (
              <g key={edge.id || `${edge.from}-${edge.to}`}>
                {/* Resaltador ancho bajo la línea para arista activa */}
                {isActive && (
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#FEF08A"
                    strokeWidth={8}
                    strokeLinecap="round"
                    opacity={0.8}
                  />
                )}

                {/* Resaltador suave bajo la línea para arista recorrida */}
                {isTraversed && !isActive && (
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#BBF7D0"
                    strokeWidth={6}
                    strokeLinecap="round"
                    opacity={0.8}
                  />
                )}

                {/* Trazo principal de la arista */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isActive ? '#FEF08A' : isTraversed ? '#BBF7D0' : '#1E232A'}
                  strokeWidth={isActive ? 3.5 : isTraversed ? 3 : 2}
                  strokeLinecap="round"
                />

                {/* Placa / badge redondeada para peso de arista */}
                {edge.weight !== undefined && (
                  <g transform={`translate(${midX}, ${midY})`} filter="url(#graph-tactile-shadow)">
                    <rect
                      x="-14"
                      y="-10"
                      width="28"
                      height="20"
                      rx="4"
                      fill={isActive ? '#FEF08A' : isTraversed ? '#BBF7D0' : '#FFFFFF'}
                      stroke="#1E232A"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-mono text-xs font-bold fill-[#1E232A] pointer-events-none"
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* CAPA 2: NODOS (CIRCULARES r=22) */}
        <g className="nodes-layer">
          {nodesList.map((node) => {
            const isCurrentNode =
              node.id === graphState?.currentNodeId ||
              node.state === 'comparing' ||
              (activeAction === 'compare' && node.id === graphState?.currentNodeId);

            const isProcessed = node.state === 'sorted';
            const isFrontier =
              !isCurrentNode &&
              (node.state === 'pointer' ||
                (graphState?.queue?.includes(node.id) && !isProcessed));

            // Estados semánticos de relleno
            let fill = '#FFFFFF';
            if (isCurrentNode) {
              fill = '#FEF08A'; // Amarillo pastel
            } else if (isProcessed) {
              fill = '#BBF7D0'; // Verde menta
            } else if (isFrontier) {
              fill = '#E9D5FF'; // Lavanda
            }

            return (
              <g key={node.id} className="transition-transform duration-200">
                {/* Aro pulsante exterior para nodo actual / evaluando */}
                {isCurrentNode && (
                  <>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={30}
                      fill="none"
                      stroke="#FEF08A"
                      strokeWidth={4}
                      className="animate-pulse"
                      opacity={0.85}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={30}
                      fill="none"
                      stroke="#CA8A04"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      opacity={0.75}
                    />
                  </>
                )}

                {/* Cuerpo del nodo: Círculo r=22 con borde carbón de 2px */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill={fill}
                  stroke="#1E232A"
                  strokeWidth={2}
                  filter="url(#graph-tactile-shadow)"
                />

                {/* Etiqueta / Valor centrado en tipografía JetBrains Mono */}
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-mono text-sm font-bold fill-[#1E232A] pointer-events-none"
                >
                  {node.label || node.id}
                </text>

                {/* Check sutil para nodo procesado / cerrado ('sorted') */}
                {isProcessed && (
                  <g transform={`translate(${node.x + 13}, ${node.y - 13})`}>
                    <circle cx="0" cy="0" r="7" fill="#BBF7D0" stroke="#1E232A" strokeWidth="1.2" />
                    <path
                      d="M-3.5 0 L-1 2.5 L3.5 -2"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* Distancia mínima anotada (Dijkstra) debajo del nodo */}
                {graphState?.dijkstraTable?.[node.id] && (
                  <g transform={`translate(${node.x}, ${node.y + 32})`}>
                    <rect
                      x="-18"
                      y="-8"
                      width="36"
                      height="16"
                      rx="3"
                      fill="#F5F3EF"
                      stroke="#1E232A"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-mono text-[9px] font-bold fill-[#1E232A]"
                    >
                      d={graphState.dijkstraTable[node.id].distance}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* PANEL AUXILIAR BFS: Cola FIFO horizontal estilo cinta de cuaderno */}
      {graphState?.queue !== undefined && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto flex items-center z-20 pointer-events-none">
          <div className="pointer-events-auto bg-[#FDFBF7] border-2 border-[#1E232A] rounded-md shadow-tactile-card px-3.5 py-2 flex flex-col gap-1.5 max-w-full">
            {/* Encabezado de cinta */}
            <div className="flex items-center justify-between border-b border-paper-border pb-1 gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E9D5FF] border border-[#1E232A]" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-primary">
                  COLA FIFO (BFS)
                </span>
              </div>
              <span className="font-mono text-[10px] text-ink-muted">
                Queue: [{graphState.queue.join(', ')}]
              </span>
            </div>

            {/* Fila visual con indicador FRONT -> [...] -> BACK */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="font-mono text-xs font-bold text-ink-secondary flex items-center gap-1 shrink-0">
                FRONT &rarr;
              </span>

              {graphState.queue.length === 0 ? (
                <span className="font-mono text-xs italic text-ink-muted px-2 py-0.5">
                  [ Cola Vacía ]
                </span>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  {graphState.queue.map((nodeId, idx) => (
                    <div
                      key={`${nodeId}-${idx}`}
                      className="flex items-center justify-center min-w-[28px] h-7 px-2 rounded bg-[#E9D5FF] border border-[#1E232A] font-mono text-xs font-bold text-[#1E232A] shadow-sm"
                      title={`Índice ${idx} (Nodo ${nodeId})`}
                    >
                      {nodeId}
                    </div>
                  ))}
                </div>
              )}

              <span className="font-mono text-xs font-bold text-ink-secondary flex items-center gap-1 shrink-0">
                &rarr; BACK
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PANEL AUXILIAR DIJKSTRA: Tabla compacta colapsable estilo libreta técnica de laboratorio */}
      {graphState?.dijkstraTable !== undefined && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none max-w-xs sm:max-w-sm">
          {!isDijkstraTableOpen ? (
            <button
              type="button"
              onClick={() => setIsDijkstraTableOpen(true)}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFFFFF] border-2 border-[#1E232A] text-ink-primary font-mono text-xs font-bold shadow-tactile-card hover:bg-surface-container-low transition-all active:translate-y-0.5"
              title="Abrir Tabla de Distancias de Dijkstra"
            >
              <Table2 className="w-3.5 h-3.5 text-ink-primary" />
              <span>Tabla Dijkstra</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-secondary" />
            </button>
          ) : (
            <div className="pointer-events-auto bg-[#FFFFFF]/95 backdrop-blur-sm border-2 border-[#1E232A] rounded-md shadow-tactile-card overflow-hidden w-full max-w-sm">
              {/* Encabezado técnico con botón para colapsar */}
              <div
                onClick={() => setIsDijkstraTableOpen(false)}
                className="bg-surface-container-low border-b border-[#1E232A] px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-surface-container select-none"
                title="Haga clic para colapsar tabla"
              >
                <div className="flex items-center gap-1.5">
                  <Table2 className="w-3.5 h-3.5 text-ink-primary" />
                  <span className="font-mono text-[11px] font-bold text-ink-primary uppercase tracking-wide">
                    TABLA DE DISTANCIAS
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[9px] text-ink-muted">MIN-DIST</span>
                  <ChevronUp className="w-3.5 h-3.5 text-ink-primary ml-1" />
                </div>
              </div>

              {/* Tabla con Vértice, dist[v], Predecesor, Estado (Cerrado/Pendiente) */}
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-paper-border bg-paper-surface text-[10px] text-ink-secondary">
                      <th className="py-1 px-2.5 font-bold">Vértice</th>
                      <th className="py-1 px-2.5 font-bold">dist[v]</th>
                      <th className="py-1 px-2.5 font-bold">Predecesor</th>
                      <th className="py-1 px-2.5 font-bold">Estado (Cerrado/Pendiente)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(graphState.dijkstraTable).map((entry) => {
                      const isCurrent = entry.vertex === graphState.currentNodeId;
                      return (
                        <tr
                          key={entry.vertex}
                          className={`border-b border-paper-border/60 transition-colors ${
                            isCurrent
                              ? 'bg-[#FEF08A]/30'
                              : entry.isSettled
                              ? 'bg-[#BBF7D0]/20'
                              : 'hover:bg-surface-container-low/50'
                          }`}
                        >
                          <td className="py-1 px-2.5 font-bold text-ink-primary">
                            {entry.vertex}
                          </td>
                          <td className="py-1 px-2.5 font-semibold text-ink-primary">
                            {entry.distance === '∞' ? (
                              <span className="text-ink-muted">&infin;</span>
                            ) : (
                              entry.distance
                            )}
                          </td>
                          <td className="py-1 px-2.5 text-ink-secondary">
                            {entry.predecessor ?? '-'}
                          </td>
                          <td className="py-1 px-2.5">
                            {entry.isSettled ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#BBF7D0] text-[#166534] border border-[#86EFAC]">
                                Cerrado
                              </span>
                            ) : isCurrent ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FEF08A] text-[#854D0E] border border-[#FDE047] animate-pulse">
                                Evaluando
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-surface-container-low text-ink-muted border border-paper-border">
                                Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphViewport;
