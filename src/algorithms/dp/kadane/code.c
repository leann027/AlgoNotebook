/**
 * AlgoNotebook — Algoritmo de Kadane (C99)
 * Máxima subsuma contigua en O(N) con espacio O(1).
 * Ecuación de Bellman: M[i] = max(A[i], M[i-1] + A[i]).
 */
#include <stdio.h>
#include <limits.h>

int kadane(const int arr[], int n, int *out_start, int *out_end) {
    if (n <= 0) return 0;

    int current_sum = arr[0];
    int max_sum = arr[0];
    int start = 0, end = 0;
    int temp_start = 0;

    for (int i = 1; i < n; i++) {
        // ¿Conviene extender la ventana actual o reiniciar desde arr[i]?
        if (arr[i] > current_sum + arr[i]) {
            current_sum = arr[i];
            temp_start = i;
        } else {
            current_sum += arr[i];
        }

        // Actualizar el máximo global si la ventana actual lo supera
        if (current_sum > max_sum) {
            max_sum = current_sum;
            start = temp_start;
            end = i;
        }
    }

    if (out_start) *out_start = start;
    if (out_end) *out_end = end;
    return max_sum;
}
