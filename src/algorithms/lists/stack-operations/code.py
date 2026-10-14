CAPACITY = 8

class Stack:
    def __init__(self):
        self.data = []
        self.top = -1

    def push(self, value):
        if self.top >= CAPACITY - 1:
            return False  # Stack Overflow
        self.top += 1
        self.data.append(value)
        return True

    def pop(self):
        if self.top < 0:
            return None   # Stack Underflow
        val = self.data.pop()
        self.top -= 1
        return val

    def peek(self):
        if self.top < 0:
            return None   # Stack Underflow
        return self.data[self.top]
