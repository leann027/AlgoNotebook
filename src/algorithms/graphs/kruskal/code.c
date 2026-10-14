#include <stdio.h>
#include <stdlib.h>

#define V 6
#define E 9

typedef struct {
    int src, dest, weight;
} Edge;

typedef struct {
    int parent;
    int rank;
} Subset;

int find(Subset subsets[], int i) {
    if (subsets[i].parent != i)
        subsets[i].parent = find(subsets, subsets[i].parent);
    return subsets[i].parent;
}

void unionSets(Subset subsets[], int x, int y) {
    int rootX = find(subsets, x);
    int rootY = find(subsets, y);

    if (subsets[rootX].rank < subsets[rootY].rank) {
        subsets[rootX].parent = rootY;
    } else if (subsets[rootX].rank > subsets[rootY].rank) {
        subsets[rootY].parent = rootX;
    } else {
        subsets[rootY].parent = rootX;
        subsets[rootX].rank++;
    }
}

int compareEdges(const void *a, const void *b) {
    return ((Edge *)a)->weight - ((Edge *)b)->weight;
}

void kruskalMST(Edge edges[E]) {
    Edge result[V - 1];
    int e = 0;

    // 1. Ordenar aristas por peso ascendente
    qsort(edges, E, sizeof(edges[0]), compareEdges);

    // 2. Inicializar conjuntos disjuntos (DSU)
    Subset subsets[V];
    for (int v = 0; v < V; v++) {
        subsets[v].parent = v;
        subsets[v].rank = 0;
    }

    // 3. Procesar aristas vorazmente
    for (int i = 0; i < E && e < V - 1; i++) {
        Edge next_edge = edges[i];
        int x = find(subsets, next_edge.src);
        int y = find(subsets, next_edge.dest);

        // Si no forma ciclo, se une y agrega al MST
        if (x != y) {
            result[e++] = next_edge;
            unionSets(subsets, x, y);
        }
        // Si x == y, la arista forma ciclo y se descarta
    }

    (void)result;
}

