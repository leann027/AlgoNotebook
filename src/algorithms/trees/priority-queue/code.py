"""
AlgoNotebook — Cola de Prioridad / Min-Heap (Python 3)
Invariante de montículo: heap[parent] <= heap[child] para todo nodo.
"""

class PriorityQueue:
    def __init__(self):
        self.data: list[int] = []

    def peek(self) -> int | None:
        """Retorna el mínimo elemento en la raíz: O(1)."""
        return self.data[0] if self.data else None

    def push(self, val: int) -> None:
        """Inserta un valor y restablece el invariante mediante sift-up: O(log N)."""
        self.data.append(val)
        idx = len(self.data) - 1

        while idx > 0:
            parent = (idx - 1) // 2
            if self.data[idx] < self.data[parent]:
                self.data[idx], self.data[parent] = self.data[parent], self.data[idx]
                idx = parent
            else:
                break

    def pop(self) -> int | None:
        """Extrae el elemento mínimo y rebalancea mediante sift-down: O(log N)."""
        if not self.data:
            return None
        min_val = self.data[0]
        last_val = self.data.pop()

        if self.data:
            self.data[0] = last_val
            idx = 0
            n = len(self.data)

            while 2 * idx + 1 < n:
                left = 2 * idx + 1
                right = 2 * idx + 2
                smallest = idx

                if self.data[left] < self.data[smallest]:
                    smallest = left
                if right < n and self.data[right] < self.data[smallest]:
                    smallest = right

                if smallest != idx:
                    self.data[idx], self.data[smallest] = self.data[smallest], self.data[idx]
                    idx = smallest
                else:
                    break

        return min_val
