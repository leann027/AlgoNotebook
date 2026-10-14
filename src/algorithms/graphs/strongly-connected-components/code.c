/**
 * AlgoNotebook — Componentes Fuertemente Conexas (Tarjan en C99)
 * Identificación de SCCs maximales mediante DFS y marcas de low-link.
 * Complejidad: O(V + E) tiempo, O(V) espacio.
 */
#include <stdio.h>
#include <stdbool.h>

#define MAX_V 32

typedef struct {
    int num_vertices;
    int adj[MAX_V][MAX_V];
    int adj_count[MAX_V];
} Graph;

int disc[MAX_V];
int low[MAX_V];
bool on_stack[MAX_V];
int stack_nodes[MAX_V];
int stack_top = -1;
int timer = 0;
int scc_count = 0;

int min(int a, int b) {
    return a < b ? a : b;
}

void tarjan_dfs(const Graph *g, int u) {
    disc[u] = low[u] = ++timer;
    stack_nodes[++stack_top] = u;
    on_stack[u] = true;

    for (int i = 0; i < g->adj_count[u]; i++) {
        int v = g->adj[u][i];

        if (disc[v] == 0) {
            // Caso 1: Vértice v no visitado (arista de árbol)
            tarjan_dfs(g, v);
            low[u] = min(low[u], low[v]);
        } else if (on_stack[v]) {
            // Caso 2: Vértice v en la pila activa (arista de retroceso en la misma SCC)
            low[u] = min(low[u], disc[v]);
        }
    }

    // Si u es la raíz de una componente fuertemente conexa
    if (low[u] == disc[u]) {
        scc_count++;
        while (true) {
            int w = stack_nodes[stack_top--];
            on_stack[w] = false;
            if (u == w) break;
        }
    }
}

void tarjan_scc(const Graph *g) {
    for (int i = 0; i < g->num_vertices; i++) {
        disc[i] = 0;
        low[i] = 0;
        on_stack[i] = false;
    }
    stack_top = -1;
    timer = 0;
    scc_count = 0;

    for (int i = 0; i < g->num_vertices; i++) {
        if (disc[i] == 0) {
            tarjan_dfs(g, i);
        }
    }
}
