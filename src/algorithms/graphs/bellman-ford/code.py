"""
AlgoNotebook — Algoritmo de Bellman-Ford (Python 3)
Caminos mínimos desde origen único con aristas de peso negativo y detección de ciclos.
Complejidad: O(V * E) tiempo, O(V) espacio.
"""

def bellman_ford(vertices: list[str], edges: list[tuple[str, str, int]], src: str) -> tuple[dict[str, float], dict[str, str | None], bool]:
    """Retorna (distancias, predecesores, tiene_ciclo_negativo)."""
    dist: dict[str, float] = {v: float('inf') for v in vertices}
    pred: dict[str, str | None] = {v: None for v in vertices}
    dist[src] = 0.0

    # 1. Relajar aristas |V| - 1 rondas
    for _ in range(len(vertices) - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                pred[v] = u
                updated = True
        if not updated:
            break

    # 2. Ronda |V|: Detección de ciclo negativo
    has_negative_cycle = False
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            has_negative_cycle = True
            break

    return dist, pred, has_negative_cycle
