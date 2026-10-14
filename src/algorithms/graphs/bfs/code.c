#include <stdio.h>
#include <stdbool.h>

#define V 6

void bfs(int adj[V][V], int startVertex) {
    bool visited[V] = {false};
    int queue[V];
    int front = 0, rear = 0;

    visited[startVertex] = true;
    queue[rear++] = startVertex;

    while (front < rear) {
        int curr = queue[front++];
        for (int neighbor = 0; neighbor < V; neighbor++) {
            if (adj[curr][neighbor] && !visited[neighbor]) {
                visited[neighbor] = true;
                queue[rear++] = neighbor;
            }
        }
    }
}

