/**
 * AlgoNotebook — Distancia de Levenshtein (C99)
 * Distancia mínima de edición mediante Programación Dinámica Matricial 2D.
 * Complejidad: O(M * N) tiempo, O(M * N) espacio.
 */
#include <stdio.h>
#include <string.h>

#define MAX_LEN 32

int min3(int a, int b, int c) {
    int m = a < b ? a : b;
    return m < c ? m : c;
}

int levenshtein(const char *s1, const char *s2) {
    int m = (int)strlen(s1);
    int n = (int)strlen(s2);
    int dp[MAX_LEN][MAX_LEN];

    // Casos base: transformar prefijo a cadena vacía
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;

    // Relleno tabular bottom-up
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i - 1] == s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]; // Coincidencia sin costo adicional
            } else {
                dp[i][j] = 1 + min3(
                    dp[i - 1][j],     // Eliminación
                    dp[i][j - 1],     // Inserción
                    dp[i - 1][j - 1]  // Sustitución
                );
            }
        }
    }

    return dp[m][n];
}
