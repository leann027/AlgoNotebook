#include <stdio.h>
#include <limits.h>

#define INF 99999

int min(int a, int b) {
    return (a < b) ? a : b;
}

int coinChange(int coins[], int n, int amount) {
    int dp[amount + 1];
    dp[0] = 0;
    for (int j = 1; j <= amount; j++) {
        dp[j] = INF;
    }

    for (int i = 0; i < n; i++) {
        for (int j = coins[i]; j <= amount; j++) {
            if (dp[j - coins[i]] != INF) {
                dp[j] = min(dp[j], 1 + dp[j - coins[i]]);
            }
        }
    }
    return (dp[amount] >= INF) ? -1 : dp[amount];
}

