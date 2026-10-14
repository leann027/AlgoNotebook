from collections import deque

def bfs(adj_list, start_node):
    visited = {start_node}
    queue = deque([start_node])

    while queue:
        curr = queue.popleft()
        for neighbor in adj_list[curr]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

