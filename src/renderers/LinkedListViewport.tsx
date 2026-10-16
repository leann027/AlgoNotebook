import React from 'react';
import type { LinkedListAlgorithmState, ActiveAction } from '../core/types';

export interface LinkedListViewportProps {
  linkedListState?: LinkedListAlgorithmState;
  activeAction?: ActiveAction;
  className?: string;
}

/**
 * LinkedListViewport — Lienzo Especializado para Listas Enlazadas con Punteros de Memoria C
 *
 * Características pedagógicas clave:
 * 1. Nodos divididos [ Valor | Puntero next ] con borde de tinta carbón (#1E232A).
 * 2. Direcciones de memoria simuladas en hexadecimal (ej. 0x7ffee1) al pie de cada nodo.
 * 3. Banderas flotantes de punteros de control (prev, curr, next) situadas sobre los nodos correspondientes.
 * 4. Trazado vectorial SVG de flechas que invierten su dirección dinámicamente cuando curr->next = prev.
 * 5. Terminadores NULL estilizados.
 */
export const LinkedListViewport: React.FC<LinkedListViewportProps> = ({
  linkedListState,
  className = '',
}) => {
  const nodes = linkedListState?.nodes ?? [];
  const pointers = linkedListState?.pointers ?? { prev: null, curr: null, next: null };

  if (nodes.length === 0) {
    return (
      <div className={`w-full h-full min-h-[360px] flex items-center justify-center text-ink-muted font-mono text-xs ${className}`}>
        Lista enlazada vacía o sin inicializar.
      </div>
    );
  }

  // Dimensiones y espaciado para distribución horizontal centrada y sin recortes
  const nodeWidth = 92;
  const nodeHeight = 54;
  const gap = 52; // Espacio para flecha entre nodos
  const centerY = 145;

  // Ancho total requerido por la cadena de nodos
  const totalNodesWidth = nodes.length * nodeWidth + Math.max(0, nodes.length - 1) * gap;
  // Ancho del viewBox asegurando al menos 860px y margen para el terminador NULL
  const totalWidth = Math.max(860, totalNodesWidth + 120);
  // Posición inicial dinámicamente centrada en el lienzo
  const startX = Math.max(36, Math.round((totalWidth - totalNodesWidth) / 2));

  // Mapa de índices y coordenadas de nodos por ID
  const nodePositions = new Map<string, { x: number; y: number; index: number }>();
  nodes.forEach((node, idx) => {
    nodePositions.set(node.id, {
      x: startX + idx * (nodeWidth + gap),
      y: centerY,
      index: idx,
    });
  });

  // Obtener banderas de punteros activos para un nodo dado
  const getPointerBadgesForNode = (nodeId: string): Array<{ name: string; colorClass: string }> => {
    const badges: Array<{ name: string; colorClass: string }> = [];
    if (pointers.prev === nodeId) {
      badges.push({ name: 'prev', colorClass: 'bg-highlighter-success border-ink-primary text-ink-primary' });
    }
    if (pointers.curr === nodeId) {
      badges.push({ name: 'curr', colorClass: 'bg-highlighter-compare border-ink-primary text-ink-primary' });
    }
    if (pointers.next === nodeId) {
      badges.push({ name: 'next', colorClass: 'bg-highlighter-pointer border-ink-primary text-ink-primary' });
    }
    if (pointers.slow === nodeId) {
      badges.push({ name: 'slow 🐢', colorClass: 'bg-highlighter-compare border-ink-primary text-ink-primary' });
    }
    if (pointers.fast === nodeId) {
      badges.push({ name: 'fast 🐇', colorClass: 'bg-highlighter-pointer border-ink-primary text-ink-primary' });
    }
    if (pointers.top === nodeId) {
      badges.push({ name: 'top', colorClass: 'bg-highlighter-compare border-ink-primary text-ink-primary' });
    }
    if (pointers.front === nodeId) {
      badges.push({ name: 'front', colorClass: 'bg-highlighter-compare border-ink-primary text-ink-primary' });
    }
    if (pointers.rear === nodeId) {
      badges.push({ name: 'rear', colorClass: 'bg-highlighter-pointer border-ink-primary text-ink-primary' });
    }
    return badges;
  };

  return (
    <div className={`w-full h-full min-h-[380px] flex flex-col justify-between overflow-x-auto select-none p-2 sm:p-4 relative ${className}`}>
      {/* Lienzo SVG con Nodos, Flechas y Punteros */}
      <svg
        viewBox={`0 0 ${totalWidth} 360`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto min-h-[340px] overflow-visible max-w-full mx-auto"
      >
        <defs>
          {/* Patrón de cuadrícula de papel técnico sutil */}
          <pattern
            id="ll-graph-grid"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="#EAE5DC" />
          </pattern>

          {/* Marcador de flecha hacia la derecha (Next normal) */}
          <marker
            id="arrow-right"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#1E232A" />
          </marker>

          {/* Marcador de flecha hacia la izquierda (Next invertido hacia atrás) */}
          <marker
            id="arrow-left"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#1E232A" />
          </marker>

          {/* Marcador de flecha activa (amarillo o menta) */}
          <marker
            id="arrow-highlight"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#1E232A" stroke="#1E232A" strokeWidth="1" />
          </marker>
        </defs>

        {/* Fondo con rejilla técnica sutil de ingeniería */}
        <rect width="100%" height="100%" fill="url(#ll-graph-grid)" />

        {/* 1. FLECHAS DE CONEXIÓN ENTRE NODOS */}
        {nodes.map((node) => {
          const fromPos = nodePositions.get(node.id);
          if (!fromPos) return null;

          // Origen de la flecha: centro del conector derecho del nodo
          const fromX = fromPos.x + nodeWidth - 14;
          const fromY = fromPos.y + nodeHeight / 2;

          // Caso A: nextId apunta a otro nodo
          if (node.nextId && nodePositions.has(node.nextId)) {
            const toPos = nodePositions.get(node.nextId)!;
            const isBackward = toPos.index < fromPos.index;

            if (!isBackward) {
              // Flecha directa hacia la derecha
              const toX = toPos.x;
              const toY = toPos.y + nodeHeight / 2;
              return (
                <g key={`arrow-${node.id}-to-${node.nextId}`}>
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#1E232A"
                    strokeWidth="2.5"
                    markerEnd="url(#arrow-right)"
                  />
                  {/* Etiqueta de puntero next */}
                  <text
                    x={(fromX + toX) / 2}
                    y={fromY - 6}
                    textAnchor="middle"
                    className="font-mono text-[9px] fill-ink-secondary"
                  >
                    next
                  </text>
                </g>
              );
            } else {
              // Flecha hacia atrás (Inversión o Ciclo)
              const spanDistance = fromPos.index - toPos.index;
              const isCycle = pointers.slow !== undefined || pointers.fast !== undefined || spanDistance > 1;
              // Desplazar punto de llegada a la izquierda del compartimento de datos para despejar la dirección de memoria central
              const toX = toPos.x + 20;
              const toY = toPos.y + nodeHeight;
              // Profundidad de arco optimizada para esquivar limpiamente las direcciones de memoria inferiores
              const arcDepth = Math.max(76, 56 + spanDistance * 22);
              const controlY = fromY + arcDepth;
              const midX = (fromX + toX) / 2;
              // Trayectoria Bézier cúbica con vectores de control verticales para descenso y ascenso limpios
              const pathD = `M ${fromX} ${fromY} C ${fromX} ${controlY}, ${toX} ${controlY}, ${toX} ${toY + 8}`;
              return (
                <g key={`arrow-back-${node.id}-to-${node.nextId}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#1E232A"
                    strokeWidth="2.5"
                    markerEnd="url(#arrow-highlight)"
                  />
                  {/* Badge descriptivo de retorno de ciclo o inversión */}
                  <rect
                    x={midX - 30}
                    y={controlY - 9}
                    width="60"
                    height="18"
                    rx="4"
                    fill="#FFFFFF"
                    stroke="#1E232A"
                    strokeWidth="1.2"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))"
                  />
                  <text
                    x={midX}
                    y={controlY + 3.5}
                    textAnchor="middle"
                    className="font-mono text-[9px] fill-ink-primary font-bold select-none"
                  >
                    {isCycle ? 'ciclo ↺' : 'invertido ⮌'}
                  </text>
                </g>
              );
            }
          }

          // Caso B: nextId es NULL
          // Si es el nodo original 0 que ahora apunta hacia atrás a NULL
          const isReversedHeadToNull = node.nextId === null && pointers.prev !== null && fromPos.index === 0;

          if (isReversedHeadToNull) {
            const leftOriginX = fromPos.x;
            return (
              <g key={`arrow-null-${node.id}`}>
                <line
                  x1={leftOriginX}
                  y1={fromY}
                  x2={leftOriginX - 20}
                  y2={fromY}
                  stroke="#1E232A"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  markerEnd="url(#arrow-left)"
                />
                <rect
                  x={leftOriginX - 58}
                  y={fromY - 11}
                  width="34"
                  height="22"
                  rx="4"
                  fill="#F5F3EF"
                  stroke="#E5E0D8"
                  strokeWidth="1.5"
                />
                <text
                  x={leftOriginX - 41}
                  y={fromY + 4}
                  textAnchor="middle"
                  className="font-mono text-[10px] font-bold fill-ink-muted"
                >
                  NULL
                </text>
              </g>
            );
          }

          return (
            <g key={`arrow-null-${node.id}`}>
              <line
                x1={fromX}
                y1={fromY}
                x2={fromX + 22}
                y2={fromY}
                stroke="#1E232A"
                strokeWidth="2"
                strokeDasharray="3 3"
                markerEnd="url(#arrow-right)"
              />
              {/* Badge NULL */}
              <rect
                x={fromX + 26}
                y={fromY - 11}
                width="34"
                height="22"
                rx="4"
                fill="#F5F3EF"
                stroke="#E5E0D8"
                strokeWidth="1.5"
              />
              <text
                x={fromX + 43}
                y={fromY + 4}
                textAnchor="middle"
                className="font-mono text-[10px] font-bold fill-ink-muted"
              >
                NULL
              </text>
            </g>
          );
        })}

        {/* 2. NODOS DE LA LISTA ENLAZADA */}
        {nodes.map((node) => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;

          const isCurr = pointers.curr === node.id;
          const isPrev = pointers.prev === node.id;
          const isNext = pointers.next === node.id;
          const isTop = pointers.top === node.id;

          // Color del compartimento de datos
          let valueFill = '#FFFFFF';
          if (node.state === 'comparing' || isCurr) {
            valueFill = '#FEF08A'; // highlighter-compare
          } else if (node.state === 'swapping') {
            valueFill = '#FFD7BA'; // highlighter-swap
          } else if (node.state === 'sorted' || isPrev) {
            valueFill = '#BBF7D0'; // highlighter-success (invertido / visitado)
          } else if (isNext) {
            valueFill = '#E9D5FF'; // highlighter-pointer
          } else if (isTop) {
            valueFill = '#FEF08A'; // highlighter-compare
          }

          const pointerBadges = getPointerBadgesForNode(node.id);

          return (
            <g key={`node-${node.id}`}>
              {/* Banderas de punteros flotantes encima del nodo */}
              {pointerBadges.length > 0 && (
                <g transform={`translate(${pos.x + nodeWidth / 2}, ${pos.y - 28})`}>
                  {pointerBadges.map((badge, bIdx) => {
                    const isEmojiBadge = badge.name.includes('🐢') || badge.name.includes('🐇');
                    const badgeWidth = isEmojiBadge ? 58 : Math.max(38, badge.name.length * 7.5 + 12);
                    const badgeHeight = 18;
                    const stepSpacing = isEmojiBadge ? 64 : 44;
                    const badgeOffset = (bIdx - (pointerBadges.length - 1) / 2) * stepSpacing;
                    return (
                      <g key={badge.name} transform={`translate(${badgeOffset}, 0)`}>
                        {/* Etiqueta tipo Flag con pin */}
                        <rect
                          x={-badgeWidth / 2}
                          y={-badgeHeight / 2}
                          width={badgeWidth}
                          height={badgeHeight}
                          rx="3"
                          fill={
                            badge.name.includes('curr') || badge.name.includes('top') || badge.name.includes('front')
                              ? '#FEF08A'
                              : badge.name.includes('prev')
                              ? '#BBF7D0'
                              : badge.name.includes('slow')
                              ? '#FEF08A'
                              : '#E9D5FF'
                          }
                          stroke="#1E232A"
                          strokeWidth="1.5"
                          filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.08))"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          className="font-mono text-[9px] font-extrabold fill-ink-primary uppercase tracking-tighter select-none"
                        >
                          {badge.name}
                        </text>
                        {/* Pequeña aguja indicadora hacia el nodo */}
                        <line x1="0" y1={badgeHeight / 2} x2="0" y2={badgeHeight / 2 + 10} stroke="#1E232A" strokeWidth="1.5" />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Contenedor del Bloque Dividido [ Data | Next ] */}
              <rect
                x={pos.x}
                y={pos.y}
                width={nodeWidth}
                height={nodeHeight}
                rx="6"
                fill="#FFFFFF"
                stroke="#1E232A"
                strokeWidth={isCurr ? '2.5' : '2'}
                className="transition-all duration-150"
              />

              {/* Mitad Izquierda: Compartimento de Dato (Valor) */}
              <rect
                x={pos.x}
                y={pos.y}
                width={nodeWidth - 32}
                height={nodeHeight}
                rx="5"
                fill={valueFill}
                className="transition-colors duration-200"
              />
              <text
                x={pos.x + (nodeWidth - 32) / 2}
                y={pos.y + nodeHeight / 2 + 5}
                textAnchor="middle"
                className="font-mono text-base font-bold fill-ink-primary"
              >
                {node.value}
              </text>

              {/* Línea divisoria interna de tinta carbón */}
              <line
                x1={pos.x + nodeWidth - 32}
                y1={pos.y}
                x2={pos.x + nodeWidth - 32}
                y2={pos.y + nodeHeight}
                stroke="#1E232A"
                strokeWidth="2"
              />

              {/* Mitad Derecha: Compartimento del Puntero next */}
              <rect
                x={pos.x + nodeWidth - 32}
                y={pos.y}
                width={32}
                height={nodeHeight}
                rx="0"
                fill="#FDFBF7"
              />
              {/* Conector tipo bullet (origen del puntero de memoria) */}
              <circle
                cx={pos.x + nodeWidth - 16}
                cy={pos.y + nodeHeight / 2}
                r="4.5"
                fill="#1E232A"
              />

              {/* Dirección de Memoria Hexadecimal Simulada en C con placa táctil protegida */}
              <g transform={`translate(${pos.x + nodeWidth / 2}, ${pos.y + nodeHeight + 16})`}>
                <rect
                  x="-28"
                  y="-8"
                  width="56"
                  height="16"
                  rx="3"
                  fill="#FDFBF7"
                  stroke="#E5E0D8"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-mono text-[10px] font-medium fill-ink-muted tracking-tight"
                >
                  {node.address}
                </text>
              </g>
            </g>
          );
        })}

        {/* 3. Indicador flotante cuando algún puntero apunta a NULL explícitamente */}
        {pointers.prev === null && (
          <g transform={`translate(${startX - 36}, ${centerY - 28})`}>
            <rect
              x="-16"
              y="-10"
              width="32"
              height="18"
              rx="3"
              fill="#BBF7D0"
              stroke="#1E232A"
              strokeWidth="1.5"
            />
            <text x="0" y="3" textAnchor="middle" className="font-mono text-[9px] font-bold fill-ink-primary uppercase">
              prev
            </text>
            <line x1="0" y1="8" x2="0" y2="18" stroke="#1E232A" strokeWidth="1.5" strokeDasharray="2 2" />
            <text x="0" y="30" textAnchor="middle" className="font-mono text-[9px] fill-ink-muted">
              NULL
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
