#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

struct Node *append_node(struct Node *head, int value) {
    struct Node *new_node = malloc(sizeof(struct Node));
    if (new_node == NULL) {
        return head;
    }

    new_node->data = value;
    new_node->next = NULL;

    if (head == NULL) {
        return new_node;
    }

    struct Node *tail = head;
    while (tail->next != NULL) {
        tail = tail->next;
    }
    tail->next = new_node;
    return head;
}
