class QueueFIFO:
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.buffer = []
        self.front_idx = 0
        self.rear_idx = -1

    def is_empty(self):
        return len(self.buffer) == 0

    def is_full(self):
        return len(self.buffer) >= self.capacity

    def enqueue(self, value):
        if self.is_full():
            raise OverflowError("Queue is full")
        self.buffer.append(value)
        self.rear_idx = len(self.buffer) - 1
        return True

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        val = self.buffer.pop(0)
        self.rear_idx = len(self.buffer) - 1
        return val

    def peek(self):
        if self.is_empty():
            return None
        return self.buffer[0]

