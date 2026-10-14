"""
AlgoNotebook — Búsqueda Lineal vs Binaria (Python 3)
Comparador interactivo de orden de crecimiento asintótico: O(N) vs O(log N).
"""

def linear_search(arr: list[int], target: int) -> tuple[int, int]:
    """Búsqueda lineal secuencial: O(N). Retorna (índice, comparaciones)."""
    comparisons = 0
    for i, val in enumerate(arr):
        comparisons += 1
        if val == target:
            return i, comparisons
    return -1, comparisons

def binary_search(arr: list[int], target: int) -> tuple[int, int]:
    """Búsqueda binaria logarítmica sobre lista ordenada: O(log N)."""
    low = 0
    high = len(arr) - 1
    comparisons = 0

    while low <= high:
        comparisons += 1
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid, comparisons
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1, comparisons
