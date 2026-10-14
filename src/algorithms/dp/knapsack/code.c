#include <stdio.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))

int knapsack(int W, int wt[], int val[], int n) {
    int dp[n + 1][W + 1];

    for (int i = 0; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            if (i == 0 || w == 0) {
                dp[i][w] = 0;
            } else if (wt[i - 1] <= w) {
                dp[i][w] = MAX(dp[i - 1][w],
                               val[i - 1] + dp[i - 1][w - wt[i - 1]]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    // Reconstrucción de ítems óptimos (backtracking)
    int res = dp[n][W];
    int w = W;
    for (int i = n; i > 0 && res > 0; i--) {
        if (res != dp[i - 1][w]) {
            // Objeto (i - 1) incluido en la solución óptima
            res -= val[i - 1];
            w -= wt[i - 1];
        }
    }

    return dp[n][W];
}

