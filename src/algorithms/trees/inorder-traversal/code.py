class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder_traversal(root, result):
    if root is None:
        return

    inorder_traversal(root.left, result)
    result.append(root.val)
    inorder_traversal(root.right, result)
