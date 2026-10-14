class DSU:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, i: int) -> int:
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union_sets(self, x: int, y: int) -> bool:
        root_x = self.find(x)
        root_y = self.find(y)
        if root_x == root_y:
            return False
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        return True


def kruskal_mst(vertices: int, edges: list[tuple[int, int, int]]) -> list[tuple[int, int, int]]:
    # 1. Ordenar aristas por peso ascendente: (u, v, peso)
    edges.sort(key=lambda edge: edge[2])
    dsu = DSU(vertices)
    mst = []

    # 2. Evaluar aristas vorazmente
    for u, v, weight in edges:
        # Si no forma ciclo, se une y agrega al MST
        if dsu.union_sets(u, v):
            mst.append((u, v, weight))
            if len(mst) == vertices - 1:
                break
        # Si u y v ya están conectados, se descarta

    return mst

