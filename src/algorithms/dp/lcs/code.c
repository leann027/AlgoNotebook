#include <stdio.h>
#include <string.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))

int lcs(const char *s1, const char *s2, int m, int n) {
    int dp[m + 1][n + 1];

    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i == 0 || j == 0) {
                dp[i][j] = 0;
            } else if (s1[i - 1] == s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = MAX(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Reconstrucción óptima de la subsecuencia (backtracking)
    int i = m, j = n;
    char result[m + 1];
    int index = dp[m][n];
    result[index] = '\0';

    while (i > 0 && j > 0) {
        if (s1[i - 1] == s2[j - 1]) {
            result[index - 1] = s1[i - 1];
            i--;
            j--;
            index--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    (void)result;
    return dp[m][n];
}

