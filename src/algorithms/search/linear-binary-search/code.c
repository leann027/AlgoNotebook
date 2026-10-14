/**
 * AlgoNotebook — Búsqueda Lineal vs Binaria (C99)
 * Comparador interactivo de orden de crecimiento asintótico: O(N) vs O(log N).
 */
#include <stdio.h>
#include <stdbool.h>

// Búsqueda Lineal secuencial sobre arreglo: O(N)
int linear_search(const int arr[], int n, int target, int *comparisons) {
    *comparisons = 0;
    for (int i = 0; i < n; i++) {
        (*comparisons)++;
        if (arr[i] == target) {
            return i; // Encontrado en paso i + 1
        }
    }
    return -1; // No encontrado tras N comparaciones
}

// Búsqueda Binaria sobre arreglo previamente ordenado: O(log N)
int binary_search(const int arr[], int n, int target, int *comparisons) {
    int low = 0;
    int high = n - 1;
    *comparisons = 0;

    while (low <= high) {
        (*comparisons)++;
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            return mid; // Encontrado en a lo sumo ceil(log2(N)) pasos
        }
        if (arr[mid] < target) {
            low = mid + 1; // Descartar mitad izquierda
        } else {
            high = mid - 1; // Descartar mitad derecha
        }
    }
    return -1; // No encontrado
}
