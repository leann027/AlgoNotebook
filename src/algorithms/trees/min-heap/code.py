MAX_SIZE = 32

class MinHeap:
    def __init__(self):
        self.data = []

    def parent(self, i):
        return (i - 1) // 2

    def heapify_up(self, i):
        while i > 0 and self.data[i] < self.data[self.parent(i)]:
            p = self.parent(i)
            self.data[i], self.data[p] = self.data[p], self.data[i]
            i = p

    def insert(self, key):
        if len(self.data) >= MAX_SIZE:
            return False
        i = len(self.data)
        self.data.append(key)
        self.heapify_up(i)
        return True
