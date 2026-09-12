---
oj: dmy
pid: '54'
title: '[R9F] 硬币问题'
difficulty: 提高
tags:
  - 背包
  - 计数
  - 分块
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$。

## 思路

第 $i$ 种硬币有 $i$ 枚、每枚价值 $i$，求总价值恰为 $n$ 的方案数。这是带数量上限的多重背包计数。以 $\sqrt n$ 为界把硬币分成小（$i \le \sqrt n$）、大（$i > \sqrt n$）两类分别处理，最后按总价值卷起来。

**小硬币**（$i \le \sqrt n$）：物品 $i$ 至多用 $i$ 枚，多重背包用「定长滑动窗口」优化到 $O(n\sqrt n)$。记 $f[j]$ 为用前若干种小硬币凑出 $j$ 的方案数，转移到第 $i$ 种时维护 $s[j] = f[j] + s[j-i]$，于是

$$f[j] = s[j] \;(\text{若 } (i+1)\cdot i > j), \quad f[j] = s[j] - s[j-(i+1)\cdot i] \;(\text{否则})$$

即窗口长度恰好为枚举数 $0 \sim i$ 的 $i+1$ 项。滚动数组空间 $O(n)$。

**大硬币**（$i > \sqrt n$）：一枚大硬币价值至少 $\sqrt n + 1$，凑出 $\le n$ 最多用 $\sqrt n$ 枚，所以数量上限自动满足，可视为无限制。记 $g[i][j]$ 为恰好用 $i$ 枚大硬币凑成 $j$ 的方案数，按「至少一枚最小大硬币 / 每枚都减一」二分：

$$g[i][j] = g[i-1][j-(\sqrt n+1)] + g[i][j-i]$$

$i$ 只到 $\sqrt n$，空间 $O(n\sqrt n)$，时间 $O(n\sqrt n)$。

最后答案为 $\displaystyle\sum_{i,j} g[i][j] \cdot f[n-j]$，即大硬币凑 $j$、小硬币凑 $n-j$ 的方案乘积之和。

复杂度：时间 $O(n\sqrt n)$，空间 $O(n\sqrt n)$（可滚动到 $O(n)$）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var B: Int64 = 1
    while ((B + 1) * (B + 1) <= n) {
        B += 1
    }
    let SQ = B
    // 小硬币 f[j]
    var f = Array<Int64>(n + 1, { _ => 0 })
    f[0] = 1
    for (i in 1..=SQ) {
        let nf = Array<Int64>(n + 1, { _ => 0 })
        var s = Array<Int64>(n + 1, { _ => 0 })
        for (j in 0..=n) {
            let a = f[j]
            let b = if (j >= i) { s[j - i] } else { 0 }
            s[j] = (a + b) % MOD
            var val = s[j]
            let lim = (i + 1) * i
            if (j >= lim) {
                val = (val - s[j - lim] + MOD) % MOD
            }
            nf[j] = val
        }
        f = nf
    }
    // 大硬币 g[i][j]: 恰好 i 枚大硬币凑成 j
    let g = Array<Array<Int64>>(SQ + 1, { _ => Array<Int64>(n + 1, { _ => 0 }) })
    g[0][0] = 1
    for (i in 1..=SQ) {
        let gi = g[i]
        let gim1 = g[i - 1]
        for (j in 0..=n) {
            var v: Int64 = 0
            if (j >= SQ + 1) {
                v = gim1[j - (SQ + 1)]
            }
            if (j >= i) {
                v = (v + gi[j - i]) % MOD
            }
            gi[j] = v
        }
    }
    var ans: Int64 = 0
    for (i in 0..=SQ) {
        let gi = g[i]
        for (j in 0..=n) {
            if (gi[j] != 0) {
                ans = (ans + gi[j] * f[n - j]) % MOD
            }
        }
    }
    println(ans)
}
```

要点：

- 按价值 $\sqrt n$ 切分：小硬币数量限制关键但种类少，用滑动窗口多重背包；大硬币数量限制天然松，用「数枚数」的完全背包。
- 小硬币转移维护 $s[j]=f[j]+s[j-i]$ 让等差数列求和变成 $O(1)$，是把 $O(n^2)$ 降到 $O(n\sqrt n)$ 的关键。
