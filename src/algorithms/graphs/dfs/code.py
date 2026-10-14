def dfs_util(adj_list, curr, visited):
    visited.add(curr)

    for neighbor in adj_list[curr]:
        if neighbor not in visited:
            dfs_util(adj_list, neighbor, visited)

def dfs(adj_list, start_node):
    visited = set()
    dfs_util(adj_list, start_node, visited)
