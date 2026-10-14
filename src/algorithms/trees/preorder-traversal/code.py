class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def preorder_traversal(root, result):
    if root is None:
        return

    result.append(root.val)
    preorder_traversal(root.left, result)
    preorder_traversal(root.right, result)

