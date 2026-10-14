/**
 * AlgoNotebook — Algoritmo de Bellman-Ford (C99)
 * Caminos mínimos desde origen único con aristas de peso negativo y detección de ciclos.
 * Complejidad: O(V * E) tiempo, O(V) espacio.
 */
#include <stdio.h>
#include <stdbool.h>
#include <limits.h>

#define INF 999999

typedef struct {
    int src, dest, weight;
} Edge;

typedef struct {
    int V, E;
    Edge edges[64];
} Graph;

bool bellman_ford(const Graph *g, int src, int dist[], int pred[]) {
    // 1. Inicializar distancias: O(V)
    for (int i = 0; i < g->V; i++) {
        dist[i] = INF;
        pred[i] = -1;
    }
    dist[src] = 0;

    // 2. Relajar todas las aristas |V| - 1 veces: O(V * E)
    for (int k = 1; k <= g->V - 1; k++) {
        bool updated = false;
        for (int j = 0; j < g->E; j++) {
            int u = g->edges[j].src;
            int v = g->edges[j].dest;
            int w = g->edges[j].weight;

            if (dist[u] != INF && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pred[v] = u;
                updated = true;
            }
        }
        if (!updated) break; // Optimización de parada temprana
    }

    // 3. Pasada |V|: Comprobación de ciclos negativos
    for (int j = 0; j < g->E; j++) {
        int u = g->edges[j].src;
        int v = g->edges[j].dest;
        int w = g->edges[j].weight;

        if (dist[u] != INF && dist[u] + w < dist[v]) {
            // Existe un ciclo de coste negativo alcanzable
            return false;
        }
    }

    return true; // Caminos mínimos válidos encontrados
}
