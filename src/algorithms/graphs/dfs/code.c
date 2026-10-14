#include <stdio.h>
#include <stdbool.h>

#define V 6

void dfs_util(int adj[V][V], int curr, bool visited[V]) {
    visited[curr] = true;

    for (int neighbor = 0; neighbor < V; neighbor++) {
        if (adj[curr][neighbor] && !visited[neighbor]) {
            dfs_util(adj, neighbor, visited);
        }
    }
}

void dfs(int adj[V][V], int startVertex) {
    bool visited[V] = {false};
    dfs_util(adj, startVertex, visited);
}
