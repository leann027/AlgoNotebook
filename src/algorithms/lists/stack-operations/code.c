#include <stdio.h>
#include <stdbool.h>

#define CAPACITY 8

typedef struct {
    int data[CAPACITY];
    int top;
} Stack;

void initStack(Stack* s) {
    s->top = -1;
}

bool push(Stack* s, int value) {
    if (s->top >= CAPACITY - 1) {
        return false; // Stack Overflow
    }
    s->top++;
    s->data[s->top] = value;
    return true;
}

int pop(Stack* s) {
    if (s->top < 0) {
        return -1; // Stack Underflow
    }
    int value = s->data[s->top];
    s->top--;
    return value;
}

int peek(const Stack* s) {
    if (s->top < 0) {
        return -1; // Stack Underflow
    }
    return s->data[s->top];
}
