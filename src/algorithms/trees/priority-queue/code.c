/**
 * AlgoNotebook — Cola de Prioridad / Min-Heap (C99)
 * Invariante de montículo: heap[parent] <= heap[child] para todo nodo.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX_CAPACITY 64

typedef struct {
    int data[MAX_CAPACITY];
    int size;
} PriorityQueue;

void pq_init(PriorityQueue *pq) {
    pq->size = 0;
}

int pq_peek(const PriorityQueue *pq) {
    if (pq->size == 0) return -1;
    return pq->data[0]; // Mínimo global siempre en la raíz (índice 0)
}

void pq_push(PriorityQueue *pq, int val) {
    if (pq->size >= MAX_CAPACITY) return;
    int idx = pq->size++;
    pq->data[idx] = val;

    // Sift-up (Heapify ascendente): O(log N)
    while (idx > 0) {
        int parent = (idx - 1) / 2;
        if (pq->data[idx] < pq->data[parent]) {
            int tmp = pq->data[idx];
            pq->data[idx] = pq->data[parent];
            pq->data[parent] = tmp;
            idx = parent;
        } else {
            break;
        }
    }
}

int pq_pop(PriorityQueue *pq) {
    if (pq->size == 0) return -1;
    int min_val = pq->data[0];
    pq->data[0] = pq->data[--pq->size];

    // Sift-down (Heapify descendente): O(log N)
    int idx = 0;
    while (2 * idx + 1 < pq->size) {
        int left = 2 * idx + 1;
        int right = 2 * idx + 2;
        int smallest = idx;

        if (pq->data[left] < pq->data[smallest]) {
            smallest = left;
        }
        if (right < pq->size && pq->data[right] < pq->data[smallest]) {
            smallest = right;
        }
        if (smallest != idx) {
            int tmp = pq->data[idx];
            pq->data[idx] = pq->data[smallest];
            pq->data[smallest] = tmp;
            idx = smallest;
        } else {
            break;
        }
    }
    return min_val;
}
