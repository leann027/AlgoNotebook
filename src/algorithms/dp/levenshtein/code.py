"""
AlgoNotebook — Distancia de Levenshtein (Python 3)
Distancia mínima de edición mediante Programación Dinámica Matricial 2D.
Complejidad: O(M * N) tiempo, O(M * N) espacio.
"""

def levenshtein(s1: str, s2: str) -> int:
    """Calcula el número mínimo de operaciones (ins, del, sub) entre dos cadenas."""
    m = len(s1)
    n = len(s2)

    # Inicializar matriz (m+1) x (n+1)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # Casos base
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    # Relleno de la matriz DP
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],     # Eliminación
                    dp[i][j - 1],     # Inserción
                    dp[i - 1][j - 1]  # Sustitución
                )

    return dp[m][n]
