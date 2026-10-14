#include <stdio.h>
#include <stdbool.h>

#define MAX_SIZE 32

typedef struct {
    int data[MAX_SIZE];
    int size;
} MinHeap;

void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int parent(int i) {
    return (i - 1) / 2;
}

void heapifyUp(MinHeap* heap, int i) {
    while (i > 0 && heap->data[i] < heap->data[parent(i)]) {
        swap(&heap->data[i], &heap->data[parent(i)]);
        i = parent(i);
    }
}

bool insert(MinHeap* heap, int key) {
    if (heap->size >= MAX_SIZE) {
        return false;
    }
    int i = heap->size;
    heap->data[i] = key;
    heap->size++;
    heapifyUp(heap, i);
    return true;
}
