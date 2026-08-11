---
oj: dmy
pid: '394'
title: '[R63D] 区间缩小'
difficulty: 普及/提高-
tags:
  - 动态规划
  - 背包
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2000$，$0 \le m \le 2000$，$0 \le d_i \le n - 1$。

## 思路

初始区间长度为 $n - 1$，$m$ 次操作共使区间长度减少 $\sum d_i$。若 $\sum d_i \ne n - 1$，操作完成后区间不可能收缩为单点，所有答案均为 $0$。

当 $\sum d_i = n - 1$ 时，最终区间恰好收缩为 $[k, k]$ 等价于：所有选择方式 a（左端点右移）的 $d_i$ 之和恰好为 $k - 1$，其余操作选择方式 b（右端点左移）。因为方式 a 的总和就是左端点移动的总距离 $k - 1$，剩余部分由方式 b 完成右端点的移动。

于是问题转化为 0/1 背包：从 $m$ 个数 $d_1, \dots, d_m$ 中选出若干个数，求选出的数和为 $j$ 的方案数，第 $k$ 个答案就是和为 $k - 1$ 的方案数。

令 $dp[j]$ 表示选出的数和为 $j$ 的方案数，对每个 $d_i$ 倒序更新：

$$dp[j] = dp[j] + dp[j - d_i]$$

注意 $d_i = 0$ 时转移变为 $dp[j] = dp[j] + dp[j] = 2 \cdot dp[j]$，恰好对应「方式 a」与「方式 b」两种不同的选择，与题意一致。

时间复杂度 $O(nm)$，空间复杂度 $O(n)$（滚动数组优化掉第一维）。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

main(): Int64 {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]

    var d: Array<Int64> = Array<Int64>(0, { _ => Int64(0) })
    var total: Int64 = 0
    if (m > 0) {
        d = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        for (x in d) {
            total = total + x
        }
    }

    // dp[j]：从 m 个数中选出若干个数、和为 j 的方案数（0/1 背包）
    var dp = Array<Int64>(n, { _ => Int64(0) })
    if (total == n - 1) {
        dp[0] = 1
        for (x in d) {
            var j = n - 1
            while (j >= x) {
                dp[j] = (dp[j] + dp[j - x]) % MOD
                j = j - 1
            }
        }
    }

    let sb = StringBuilder()
    var k = Int64(0)
    while (k < n) {
        if (k > 0) {
            sb.append(" ")
        }
        sb.append(dp[k])
        k = k + 1
    }
    println(sb.toString())
    return 0
}
```

## 要点

- **先判可行性**：$\sum d_i \ne n - 1$ 时直接输出 $n$ 个 $0$，只有和恰好为 $n - 1$ 时才可能收缩为单点。
- **转化背包**：最终收缩到 $[k, k]$ 的方案数等于选出若干 $d_i$ 使其和为 $k - 1$ 的方案数，答案即为 $dp[k - 1]$。
- **$d_i = 0$ 的细节**：选与不选都保持和不变，但对应方式 a、b 两种不同序列，背包转移 $dp[j] += dp[j - d_i]$ 自动将其翻倍，无需特判。
