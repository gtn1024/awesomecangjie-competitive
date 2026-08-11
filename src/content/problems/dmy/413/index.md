---
oj: dmy
pid: '413'
title: '[R66E] 安检'
difficulty: 普及/提高-
tags:
  - 动态规划
  - 组合数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 5000$，$1 \le m \le 10^6$。

## 思路

先固定所有人的总安检顺序。由于 $n$ 个人互不相同，总顺序共有 $n!$ 种。

对于一个固定的总顺序，设某一批有 $k$ 个人。这一批需要从 $m$ 个安检口中选择 $k$ 个，且不记录人与安检口之间的对应关系，所以这一批的方案数为 $\binom{m}{k}$。

于是问题变成：把固定顺序的前 $n$ 个人划分成若干连续非空批次，每批人数不超过 $m$，大小为 $k$ 的批次带 $\binom{m}{k}$ 种选择，求总方案数。

设 $f_i$ 为安排完前 $i$ 个人的方案数，$f_0 = 1$。枚举最后一批的人数 $k$：前 $i - k$ 个人有 $f_{i-k}$ 种安排，最后一批有 $\binom{m}{k}$ 种安检口集合，所以

$$
f_i = \sum_{k=1}^{\min(i, m)} f_{i-k} \binom{m}{k}
$$

最终答案为 $n! \cdot f_n$。

组合数 $\binom{m}{k}$ 只需算到 $k \le \min(n, m)$：当 $k > m$ 时组合数为 $0$（$m \le 10^6$ 远小于模数 $998244353$，分子中直接出现 $0$ 因子），这些项不会产生贡献，因此递推上界取 $\min(i, m)$ 即可。组合数按 $\binom{m}{k} = \binom{m}{k-1} \cdot \dfrac{m-k+1}{k}$ 递推，分母的逆元用线性方法预处理。

复杂度：时间 $O(n \min(n, m))$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let MOD = 998244353

    // k 最多取 min(n, m)，因为批次人数不能超过 m
    let K = if (n < m) { n } else { m }

    // 线性求 1..K 的逆元
    var inv = Array<Int64>(K + 1, { _ => 0 })
    if (K >= 1) {
        inv[1] = 1
        var i: Int64 = 2
        while (i <= K) {
            inv[i] = (MOD - (MOD / i) * inv[MOD % i] % MOD) % MOD
            i = i + 1
        }
    }

    // c[k] = C(m, k) mod MOD，k = 0..K
    var c = Array<Int64>(K + 1, { _ => 0 })
    c[0] = 1
    var k: Int64 = 1
    while (k <= K) {
        c[k] = c[k - 1] * (m - k + 1) % MOD * inv[k] % MOD
        k = k + 1
    }

    // f[i]：固定总顺序后，前 i 个人的安排方案数
    var f = Array<Int64>(n + 1, { _ => 0 })
    f[0] = 1
    var i: Int64 = 1
    while (i <= n) {
        var s: Int64 = 0
        var lim = if (i < K) { i } else { K }
        var kk: Int64 = 1
        while (kk <= lim) {
            s = (s + f[i - kk] * c[kk]) % MOD
            kk = kk + 1
        }
        f[i] = s
        i = i + 1
    }

    // n!
    var fact: Int64 = 1
    var j: Int64 = 1
    while (j <= n) {
        fact = fact * j % MOD
        j = j + 1
    }

    println(((fact * f[n]) % MOD).toString())
}
```

## 要点

- 总顺序 $n!$ 与批次划分、安检口选择相互独立，先固定顺序再对划分做 DP，最后乘上 $n!$ 即可。
- 批次大小为 $k$ 时只记录「选哪些安检口」而不区分人与安检口的对应，贡献是 $\binom{m}{k}$ 而不是排列数 $k! \cdot \binom{m}{k}$。
- $m$ 可能远大于 $n$，组合数只需预处理到 $\min(n, m)$ 项；逆元用线性递推 $O(K)$ 求出，避免每次求逆的 $\log$ 开销。
