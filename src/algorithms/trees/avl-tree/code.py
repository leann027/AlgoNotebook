"""
AlgoNotebook — Árbol AVL con Rotaciones Automáticas (Python 3)
Árbol binario de búsqueda auto-balanceable con cota de altura O(log N).
Invariante de balance: |altura(izq) - altura(der)| <= 1 para todo nodo.
"""

class AVLNode:
    def __init__(self, key: int):
        self.key = key
        self.height = 1
        self.left: AVLNode | None = None
        self.right: AVLNode | None = None

class AVLTree:
    def get_height(self, node: AVLNode | None) -> int:
        return node.height if node else 0

    def get_balance(self, node: AVLNode | None) -> int:
        return self.get_height(node.left) - self.get_height(node.right) if node else 0

    def rotate_right(self, y: AVLNode) -> AVLNode:
        x = y.left
        assert x is not None
        T2 = x.right
        x.right = y
        y.left = T2
        y.height = 1 + max(self.get_height(y.left), self.get_height(y.right))
        x.height = 1 + max(self.get_height(x.left), self.get_height(x.right))
        return x

    def rotate_left(self, x: AVLNode) -> AVLNode:
        y = x.right
        assert y is not None
        T2 = y.left
        y.left = x
        x.right = T2
        x.height = 1 + max(self.get_height(x.left), self.get_height(x.right))
        y.height = 1 + max(self.get_height(y.left), self.get_height(y.right))
        return y

    def insert(self, root: AVLNode | None, key: int) -> AVLNode:
        if not root:
            return AVLNode(key)

        if key < root.key:
            root.left = self.insert(root.left, key)
        elif key > root.key:
            root.right = self.insert(root.right, key)
        else:
            return root

        root.height = 1 + max(self.get_height(root.left), self.get_height(root.right))
        balance = self.get_balance(root)

        # Caso Left-Left (LL)
        if balance > 1 and key < root.left.key:
            return self.rotate_right(root)

        # Caso Right-Right (RR)
        if balance < -1 and key > root.right.key:
            return self.rotate_left(root)

        # Caso Left-Right (LR)
        if balance > 1 and key > root.left.key:
            root.left = self.rotate_left(root.left)
            return self.rotate_right(root)

        # Caso Right-Left (RL)
        if balance < -1 and key < root.right.key:
            root.right = self.rotate_right(root.right)
            return self.rotate_left(root)

        return root
