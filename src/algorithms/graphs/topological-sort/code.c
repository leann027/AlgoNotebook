/**
 * AlgoNotebook — Ordenamiento Topológico (Kahn en C99)
 * Linearización de dependencias en Grafos Acíclicos Dirigidos (DAG).
 * Complejidad: O(V + E) tiempo, O(V) espacio auxiliar.
 */
#include <stdio.h>
#include <stdbool.h>

#define MAX_V 32

typedef struct {
    int num_vertices;
    int adj[MAX_V][MAX_V];
    int adj_count[MAX_V];
} Graph;

bool topological_sort_kahn(const Graph *g, int result[], int *result_len) {
    int in_degree[MAX_V] = {0};
    int queue[MAX_V];
    int front = 0, rear = 0;

    // 1. Calcular grado de entrada (in-degree) para cada vértice: O(V + E)
    for (int u = 0; u < g->num_vertices; u++) {
        for (int i = 0; i < g->adj_count[u]; i++) {
            int v = g->adj[u][i];
            in_degree[v]++;
        }
    }

    // 2. Encolar todas las fuentes (vértices con in_degree == 0)
    for (int u = 0; u < g->num_vertices; u++) {
        if (in_degree[u] == 0) {
            queue[rear++] = u;
        }
    }

    int emitted = 0;

    // 3. Procesar cola FIFO
    while (front < rear) {
        int u = queue[front++];
        result[emitted++] = u;

        // Descontar aristas salientes (u -> v)
        for (int i = 0; i < g->adj_count[u]; i++) {
            int v = g->adj[u][i];
            in_degree[v]--;
            if (in_degree[v] == 0) {
                queue[rear++] = v;
            }
        }
    }

    *result_len = emitted;
    // Si emitted < num_vertices, el grafo contiene al menos un ciclo
    return emitted == g->num_vertices;
}
