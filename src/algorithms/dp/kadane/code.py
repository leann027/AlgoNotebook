"""
AlgoNotebook — Algoritmo de Kadane (Python 3)
Máxima subsuma contigua en O(N) con espacio O(1).
Ecuación de Bellman: M[i] = max(A[i], M[i-1] + A[i]).
"""

def kadane(arr: list[int]) -> tuple[int, int, int]:
    """Retorna (max_sum, start_index, end_index) en O(N) tiempo y O(1) espacio."""
    if not arr:
        return 0, -1, -1

    current_sum = arr[0]
    max_sum = arr[0]
    start = 0
    end = 0
    temp_start = 0

    for i in range(1, len(arr)):
        val = arr[i]
        # ¿Reiniciar ventana o extenderla?
        if val > current_sum + val:
            current_sum = val
            temp_start = i
        else:
            current_sum += val

        # Actualizar óptimo global
        if current_sum > max_sum:
            max_sum = current_sum
            start = temp_start
            end = i

    return max_sum, start, end
