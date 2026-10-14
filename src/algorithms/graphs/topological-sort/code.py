"""
AlgoNotebook — Ordenamiento Topológico (Kahn en Python 3)
Linearización de dependencias en Grafos Acíclicos Dirigidos (DAG).
Complejidad: O(V + E) tiempo, O(V) espacio auxiliar.
"""
from collections import deque

def topological_sort_kahn(num_vertices: int, adj_list: dict[int, list[int]]) -> list[int] | None:
    """Retorna la secuencia topológicamente ordenada o None si existe ciclo."""
    in_degree = {u: 0 for u in range(num_vertices)}

    # 1. Contabilizar grados de entrada
    for u in adj_list:
        for v in adj_list[u]:
            in_degree[v] += 1

    # 2. Encolar nodos fuente (in_degree == 0)
    queue = deque([u for u in range(num_vertices) if in_degree[u] == 0])
    result: list[int] = []

    # 3. Desencolar y decrementar vecinos
    while queue:
        u = queue.popleft()
        result.append(u)

        for v in adj_list.get(u, []):
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    # 4. Verificar detección de ciclos
    if len(result) == num_vertices:
        return result
    return None  # Grafo contiene ciclo dirigido
