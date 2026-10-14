def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for coin in coins:
        for j in range(coin, amount + 1):
            if dp[j - coin] != float('inf'):
                dp[j] = min(dp[j], 1 + dp[j - coin])

    return dp[amount] if dp[amount] != float('inf') else -1

