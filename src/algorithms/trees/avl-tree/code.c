/**
 * AlgoNotebook — Árbol AVL con Rotaciones Automáticas (C99)
 * Árbol binario de búsqueda auto-balanceable con cota de altura O(log N).
 * Invariante de balance: |altura(izq) - altura(der)| <= 1 para todo nodo.
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct AVLNode {
    int key;
    int height;
    struct AVLNode *left;
    struct AVLNode *right;
} AVLNode;

int max(int a, int b) {
    return (a > b) ? a : b;
}

int height(AVLNode *node) {
    return node ? node->height : 0;
}

int get_balance(AVLNode *node) {
    return node ? height(node->left) - height(node->right) : 0;
}

AVLNode* new_node(int key) {
    AVLNode *node = (AVLNode*)malloc(sizeof(AVLNode));
    node->key = key;
    node->height = 1;
    node->left = NULL;
    node->right = NULL;
    return node;
}

// Rotación simple hacia la derecha (Caso Left-Left)
AVLNode* rotate_right(AVLNode *y) {
    AVLNode *x = y->left;
    AVLNode *T2 = x->right;

    x->right = y;
    y->left = T2;

    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;
    return x;
}

// Rotación simple hacia la izquierda (Caso Right-Right)
AVLNode* rotate_left(AVLNode *x) {
    AVLNode *y = x->right;
    AVLNode *T2 = y->left;

    y->left = x;
    x->right = T2;

    x->height = max(height(x->left), height(x->right)) + 1;
    y->height = max(height(y->left), height(y->right)) + 1;
    return y;
}

AVLNode* avl_insert(AVLNode *node, int key) {
    if (!node) return new_node(key);

    if (key < node->key)
        node->left = avl_insert(node->left, key);
    else if (key > node->key)
        node->right = avl_insert(node->right, key);
    else
        return node; // Claves duplicadas no permitidas

    node->height = 1 + max(height(node->left), height(node->right));
    int balance = get_balance(node);

    // Caso 1: Left-Left (LL) -> Rotación derecha simple
    if (balance > 1 && key < node->left->key)
        return rotate_right(node);

    // Caso 2: Right-Right (RR) -> Rotación izquierda simple
    if (balance < -1 && key > node->right->key)
        return rotate_left(node);

    // Caso 3: Left-Right (LR) -> Rotación izquierda del hijo + derecha del padre
    if (balance > 1 && key > node->left->key) {
        node->left = rotate_left(node->left);
        return rotate_right(node);
    }

    // Caso 4: Right-Left (RL) -> Rotación derecha del hijo + izquierda del padre
    if (balance < -1 && key < node->right->key) {
        node->right = rotate_right(node->right);
        return rotate_left(node);
    }

    return node;
}
