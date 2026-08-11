---
oj: dmy
pid: '71'
title: '[R12E] 投票分组'
difficulty: 提高
tags:
  - 动态规划
  - 组合数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，$3 \le k \le 9$（$k$ 为奇数），$0 \le a \le n\times k$，$0 \le x \le n$。

## 思路

题目要求把 $n\times k$ 名同学分成 $n$ 个组（组之间有序：任一同学落在不同的组里即视为不同方案），且最终恰好有 $x$ 个组支持款式 $1$。

对第 $i$ 个组，设组内支持款式 $1$ 的人数为 $\mathrm{num}$。由于 $k$ 为奇数，当 $\mathrm{num}>\lfloor k/2\rfloor$ 时该组支持款式 $1$，否则支持款式 $2$。

按组数从前到后做 DP，状态 $dp[i][j][s]$ 表示前 $i$ 个组中，支持款式 $1$ 的同学总数为 $s$、且有 $j$ 个组支持款式 $1$ 的方案数。初值 $dp[0][0][0]=1$。

转移时枚举第 $i$ 个组里款式 $1$ 的人数 $\mathrm{num}$：此时前 $i-1$ 个组共分了 $s-\mathrm{num}$ 个款式 $1$ 的同学，还剩 $\mathrm{avail}_1=a-(s-\mathrm{num})$ 个款式 $1$ 的同学、$\mathrm{avail}_2=(n-i+1)\cdot k-\mathrm{avail}_1$ 个款式 $2$ 的同学可分配，所以本组的选法数为

$$\binom{\mathrm{avail}_1}{\mathrm{num}}\cdot \binom{\mathrm{avail}_2}{k-\mathrm{num}}.$$

- 若 $\mathrm{num}>\lfloor k/2\rfloor$，第 $i$ 个组支持款式 $1$，需要 $j\ge 1$，贡献到 $dp[i][j][s] \mathrel{+}= dp[i-1][j-1][s-\mathrm{num}]$；
- 否则第 $i$ 个组支持款式 $2$，贡献到 $dp[i][j][s] \mathrel{+}= dp[i-1][j][s-\mathrm{num}]$。

合法转移还需满足 $i\cdot k-s\le n\cdot k-a$（前 $i$ 个组里款式 $2$ 的人数不超过总数）以及 $\mathrm{avail}_1,\mathrm{avail}_2$ 不越界。答案为 $dp[n][x][a]$。

组合数用杨辉三角预处理到 $\binom{nk}{\cdot}$。注意三数连乘在取模前会溢出 `Int64`，故先对两个组合数的乘积取模，再与 $dp$ 值相乘并取模。

复杂度：时间 $O(nxak)$，空间 $O(nxak)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353

main(): Int64 {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = parts[0]
    let k = parts[1]
    let a = parts[2]
    let x = parts[3]
    let nk = n * k

    // 组合数表 C[i][j]
    let C = Array<Array<Int64>>(nk + 1, { _ => Array<Int64>(nk + 1, { _ => 0 }) })
    for (i in 0..=nk) {
        C[i][0] = 1
    }
    for (i in 1..=nk) {
        for (j in 1..=i) {
            C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD
        }
    }

    // dp[i][j][s]: 前 i 个组中、有 s 个同学支持款式 1、有 j 个组支持款式 1 的方案数
    let dp = Array<Array<Array<Int64>>>(n + 1, { _ =>
        Array<Array<Int64>>(x + 1, { _ =>
            Array<Int64>(a + 1, { _ => 0 })
        })
    })
    dp[0][0][0] = 1

    let half = k / 2 // num > half 表示该组支持款式 1
    for (i in 1..=n) {
        for (j in 0..=x) {
            if (j > i) {
                break
            }
            for (s in 0..=a) {
                // 前 i 个组支持款式 2 的人数为 i*k-s，不能超过款式 2 总人数 nk-a
                if (i * k - s > nk - a) {
                    continue
                }
                let numHi = if (k < s) { k } else { s }
                for (num in 0..=numHi) {
                    // 前面已分了 s-num 个款式 1，当前组还要 num 个款式 1
                    let avail1 = a - (s - num)
                    let avail2 = (n - i + 1) * k - avail1
                    if (avail1 < num || avail2 < k - num) {
                        continue
                    }
                    let term = (C[avail1][num] * C[avail2][k - num]) % MOD
                    if (num > half) {
                        // 第 i 个组支持款式 1
                        if (j >= 1) {
                            dp[i][j][s] = (dp[i][j][s] + dp[i - 1][j - 1][s - num] * term) % MOD
                        }
                    } else {
                        // 第 i 个组支持款式 2
                        dp[i][j][s] = (dp[i][j][s] + dp[i - 1][j][s - num] * term) % MOD
                    }
                }
            }
        }
    }

    println(dp[n][x][a])
    return 0
}
```

要点：

- 状态里 $s$ 是「前 $i$ 个组累计的款式 $1$ 人数」，配合 $\mathrm{avail}_1=a-(s-\mathrm{num})$ 与 $\mathrm{avail}_2=(n-i+1)k-\mathrm{avail}_1$ 就能把剩余可分配的两类同学数算清楚，避免对剩余名额重复计数。
- 越界剪枝（$i\cdot k-s\le n\cdot k-a$、$\mathrm{avail}_1\ge \mathrm{num}$、$\mathrm{avail}_2\ge k-\mathrm{num}$）保证组合数下标合法。
- 连乘取模要分段：两个组合数先乘再取模得到 `term`，再与 `dp` 值相乘取模。
