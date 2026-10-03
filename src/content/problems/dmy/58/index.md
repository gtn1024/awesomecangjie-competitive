---
oj: dmy
pid: '58'
title: '[R10D] 合成球'
difficulty: 提高
tags:
  - 区间DP
  - 组合数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 400$，$S$ 仅含 `w`、`b`。

## 思路

把区间 $[l,r]$ 合成一个球的过程是一棵二叉合成树，最后一次合成把 $[l,i]$ 合成的球 $A$ 与 $[i+1,r]$ 合成的球 $B$ 合并。新球颜色只能取 $A$ 或 $B$ 的颜色之一。

设 $dp[l][r][c]$ 为把第 $l\sim r$ 个球合成成一个颜色为 $c$（$0$ 白，$1$ 黑）的球的方案数。单元素直接由其颜色给出。区间 $[l,r]$ 按 $i$ 切分时，$A$ 的合成用了 $i-l$ 轮、$B$ 用了 $r-(i+1)$ 轮，这些轮在最后一轮合成之前共 $r-l-1$ 轮中的相对顺序有 $\binom{r-l-1}{i-l}$ 种；而 $A$、$B$ 内部合成方案相互独立。所以该切分贡献：

- $A,B$ 同色 $k$：只能合成 $k$ 色，$dp[l][r][k] \mathrel{+}= dp[l][i][k]\,dp[i+1][r][k]\,\binom{r-l-1}{i-l}$；
- $A,B$ 异色：可合成白或黑，白、黑各加一遍 $dp[l][i][k_A]\,dp[i+1][r][k_B]\,\binom{r-l-1}{i-l}$。

组合数用杨辉三角预处理。按区间长度递增做区间 DP。答案是 $dp[1][n][0]$ 与 $dp[1][n][1]$。

复杂度：时间 $O(n^3)$，空间 $O(n^2)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow().toRuneArray()
    let C = Array<Array<Int64>>(n + 1, { _ => Array<Int64>(n + 1, { _ => 0 }) })
    for (i in 0..=n) {
        C[i][0] = 1
        C[i][i] = 1
    }
    for (i in 2..=n) {
        for (j in 1..i) {
            C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD
        }
    }
    let N = n + 2
    let dp = Array<Array<Array<Int64>>>(N, { _ => Array<Array<Int64>>(N, { _ => Array<Int64>(2, { _ => 0 }) }) })
    for (i in 1..=n) {
        if (s[i - 1] == r'w') {
            dp[i][i][0] = 1
            dp[i][i][1] = 0
        } else {
            dp[i][i][0] = 0
            dp[i][i][1] = 1
        }
    }
    var len: Int64 = 2
    while (len <= n) {
        var l: Int64 = 1
        while (l + len - 1 <= n) {
            let r = l + len - 1
            var i = l
            while (i < r) {
                let comb = C[r - l - 1][i - l]
                var k: Int64 = 0
                while (k < 2) {
                    if (dp[l][i][k] != 0) {
                        var k2: Int64 = 0
                        while (k2 < 2) {
                            if (dp[i + 1][r][k2] != 0) {
                                let base = dp[l][i][k] * dp[i + 1][r][k2] % MOD * comb % MOD
                                if (k == k2) {
                                    dp[l][r][k] = (dp[l][r][k] + base) % MOD
                                } else {
                                    dp[l][r][0] = (dp[l][r][0] + base) % MOD
                                    dp[l][r][1] = (dp[l][r][1] + base) % MOD
                                }
                            }
                            k2 += 1
                        }
                    }
                    k += 1
                }
                i += 1
            }
            l += 1
        }
        len += 1
    }
    println("${dp[1][n][0]} ${dp[1][n][1]}")
}
```

</details>

要点：

- 合成顺序对应一棵二叉树，两子树内部的合成轮次交错有 $\binom{r-l-1}{i-l}$ 种——这是区间 DP 计数里很标准的「合并顺序」因子。
- 新球颜色只能在两子球颜色中选，于是同色只加一色、异色两色都加。
