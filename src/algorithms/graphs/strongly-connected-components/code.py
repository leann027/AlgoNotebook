"""
AlgoNotebook — Componentes Fuertemente Conexas (Tarjan en Python 3)
Identificación de SCCs maximales mediante DFS y marcas de low-link.
Complejidad: O(V + E) tiempo, O(V) espacio.
"""

def tarjan_scc(num_vertices: int, adj_list: dict[int, list[int]]) -> list[list[int]]:
    """Calcula las componentes fuertemente conexas en un solo recorrido DFS."""
    timer = 0
    disc = [-1] * num_vertices
    low = [-1] * num_vertices
    on_stack = [False] * num_vertices
    stack: list[int] = []
    components: list[list[int]] = []

    def dfs(u: int):
        nonlocal timer
        timer += 1
        disc[u] = low[u] = timer
        stack.append(u)
        on_stack[u] = True

        for v in adj_list.get(u, []):
            if disc[v] == -1:
                dfs(v)
                low[u] = min(low[u], low[v])
            elif on_stack[v]:
                low[u] = min(low[u], disc[v])

        # Si u es raíz de una SCC
        if low[u] == disc[u]:
            current_scc: list[int] = []
            while True:
                w = stack.pop()
                on_stack[w] = False
                current_scc.append(w)
                if w == u:
                    break
            components.append(current_scc)

    for i in range(num_vertices):
        if disc[i] == -1:
            dfs(i)

    return components
