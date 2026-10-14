#include <stdio.h>
#include <stdbool.h>

#define CAPACITY 8

struct Queue {
    int data[CAPACITY];
    int front;
    int rear;
    int count;
};

void init(struct Queue* q) {
    q->front = 0;
    q->rear = -1;
    q->count = 0;
}

bool isFull(struct Queue* q) {
    return q->count == CAPACITY;
}

bool isEmpty(struct Queue* q) {
    return q->count == 0;
}

bool enqueue(struct Queue* q, int value) {
    if (isFull(q)) return false;
    q->rear = (q->rear + 1) % CAPACITY;
    q->data[q->rear] = value;
    q->count++;
    return true;
}

int dequeue(struct Queue* q) {
    if (isEmpty(q)) return -1;
    int val = q->data[q->front];
    q->front = (q->front + 1) % CAPACITY;
    q->count--;
    return val;
}

int peek(struct Queue* q) {
    if (isEmpty(q)) return -1;
    return q->data[q->front];
}

