class ListNode:
    def __init__(self, value: int) -> None:
        self.value = value
        self.next: ListNode | None = None


def append_node(head: ListNode | None, value: int) -> ListNode:
    new_node = ListNode(value)
    if head is None:
        return new_node

    tail = head
    while tail.next is not None:
        tail = tail.next
    tail.next = new_node
    return head
