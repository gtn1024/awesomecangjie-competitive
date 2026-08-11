---
oj: dmy
pid: '6'
title: '[R1F] 重复度不超过 k 的数'
difficulty: 普及/提高-
tags:
  - 动态规划
  - 组合数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le n \le 100$，$1 \le m \le 100$。

## 思路

「重复度不超过 $k$」即每种数字在 $n$ 个位置中出现的次数都不超过 $k$，问题等价于：用 $m$ 种数字填满 $n$ 个有标号的位置，且每种数字最多出现 $k$ 次，求方案数。

设 $dp[i][j]$ 为前 $i$ 种数字填了 $j$ 个位置的方案数，转移时枚举第 $i$ 种数字填 $p$ 个位置（$0 \le p \le \min(k,j)$）：

$$dp[i][j] = \sum_{p=0}^{\min(k,j)} dp[i-1][j-p] \times \binom{n-(j-p)}{p}$$

其中 $\binom{n-(j-p)}{p}$ 是从剩余空位中选出 $p$ 个放第 $i$ 种数字的方案数。边界 $dp[0][0]=1$，答案 $dp[m][n]$。

组合数用杨辉三角预处理（模 $998244353$）。$k=n$ 时答案即为 $m^n$，该 DP 自然覆盖此情况。

复杂度：时间 $O(mnk)$，空间 $O(mn)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD = 998244353

main(): Int64 {
    let reader = getStdIn()
    let nmk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nmk[0]
    let m = nmk[1]
    let k = nmk[2]
    let nn = n
    var C = Array<Array<Int64>>(nn + 1, { _ => Array<Int64>(nn + 1, { _ => 0 }) })
    for (i in 0..=nn) {
        C[i][0] = 1
        for (j in 1..=i) {
            C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD
        }
    }
    var dp = Array<Array<Int64>>(m + 1, { _ => Array<Int64>(nn + 1, { _ => 0 }) })
    dp[0][0] = 1
    for (i in 1..=m) {
        for (j in 0..=nn) {
            var p: Int64 = 0
            let maxp = if (j < k) { j } else { k }
            while (p <= maxp) {
                dp[i][j] = (dp[i][j] + dp[i - 1][j - p] * C[nn - (j - p)][p]) % MOD
                p += 1
            }
        }
    }
    println(dp[m][nn])
    return 0
}
```

要点：

- $n \le 100$，组合数只需 $\binom{0..n}{0..n}$ 的表，杨辉三角即可；取模要应用到每一步加法与乘法。
- 两个模数下的乘积约为 $10^{18}$，在 `Int64` 范围内，不会溢出。
