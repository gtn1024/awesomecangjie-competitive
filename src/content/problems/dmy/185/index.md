---
oj: dmy
pid: '185'
title: '[R30F]红蓝砖块'
difficulty: 提高
tags:
  - 组合数学
  - 容斥
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$0 \le R, B \le 10^6$，$0 \le K < R+B$，且 $R, B$ 不同时为 $0$。

## 思路

**恰好有 $K$ 个颜色交替位置**等价于整个序列由 $K+1$ 个颜色连续的「块」组成，且相邻块颜色必然相反。因此块的着色只有两种模式：开头为红（红块 $r_1 = \lceil (K+1)/2 \rceil$ 个、蓝块 $b_1 = \lfloor (K+1)/2 \rfloor$ 个）或开头为蓝（红块 $b_1$ 个、蓝块 $r_1$ 个）。

设 $f(n, k, L)$ 为把 $n$ 个同色砖块分成 $k$ 个非空块、每块长度不超过 $L$ 的方案数，则长度限制为 $L$ 时的答案：

$$ans_L = f(R, r_1, L) \cdot f(B, b_1, L) + f(R, b_1, L) \cdot f(B, r_1, L)$$

（当 $K+1$ 为偶数时 $r_1 = b_1$，两项相同，即为 $2$ 倍。）答案即 $\bigoplus_{L=1}^{M} L \cdot ans_L$，其中 $M = \max(R, B)$。

**计算 $f(n, k, L)$**：一个块的长度可以看作从 $1$ 开始的「正整数拆分」，其生成函数为 $(x + x^2 + \cdots + x^L)^k$，于是

$$f(n, k, L) = [x^n]\, (x + x^2 + \cdots + x^L)^k = [x^n]\, x^k \frac{(1 - x^L)^k}{(1 - x)^k}$$

展开后按容斥得到：

$$f(n, k, L) = \sum_{j \ge 0} (-1)^j \binom{k}{j} \binom{n - 1 - jL}{k - 1}$$

其中 $\binom{n - 1 - jL}{k - 1}$ 在 $n - 1 - jL < k - 1$ 时为 $0$，所以 $j$ 只需取到 $\min(k, \lfloor (n-k)/L \rfloor)$。

预处理 $1..M$ 的阶乘与逆阶乘后，组合数可 $O(1)$ 求得。对每个 $L$ 直接枚举 $j$ 计算 $f$：单项的项数不超过 $\min(k, (n-k)/L) + 1$，对 $L$ 求和约为 $(n-k) \ln M + k \cdot M/k = O((n-k) \log M)$ 量级，两个颜色累计在 $O((R+B) \log M)$ 内，可以接受。边界情况：$K = 0$ 时只有一个块，只有全为同色才可行；某一种块数超过对应砖块数（$k > n$）时 $f = 0$。

## 复杂度

预处理阶乘 $O(M)$；枚举所有 $L$ 计算 $f$ 的总代价 $O((R+B) \log M)$；空间 $O(M)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

func powMod(a: Int64, e: Int64): Int64 {
    var r: Int64 = 1
    var base = a % MOD
    var ee = e
    while (ee > 0) {
        if (ee % 2 == 1) {
            r = r * base % MOD
        }
        base = base * base % MOD
        ee = ee / 2
    }
    return r
}

// 把 n 个同色砖块分成 k 个颜色连续的块（每块长度在 [1, L]）的方案数，模 MOD
func ways(n: Int64, k: Int64, L: Int64, ck: Array<Int64>, invfk: Int64, fact: Array<Int64>, invfact: Array<Int64>): Int64 {
    if (k == 0) {
        return if (n == 0) { 1 } else { 0 }
    }
    if (k > n) {
        return 0
    }
    var jmax = (n - k) / L
    if (jmax > k) {
        jmax = k
    }
    var s: Int64 = 0
    var sign: Int64 = 1
    var j: Int64 = 0
    while (j <= jmax) {
        let a = n - 1 - j * L
        let c = fact[a] * invfact[a - k + 1] % MOD * invfk % MOD
        let term = c * ck[j] % MOD
        if (sign == 1) {
            s = s + term
            if (s >= MOD) {
                s = s - MOD
            }
        } else {
            s = s - term
            if (s < 0) {
                s = s + MOD
            }
        }
        sign = 0 - sign
        j = j + 1
    }
    return s
}

main(): Int64 {
    let reader = getStdIn()
    let toks = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let R = toks[0]
    let B = toks[1]
    let K = toks[2]
    let N = if (R > B) { R } else { B }
    let M = N

    // 阶乘与逆阶乘
    let fact = Array<Int64>(N + 1, { _ => 0 })
    let invfact = Array<Int64>(N + 1, { _ => 0 })
    fact[0] = 1
    var i: Int64 = 1
    while (i <= N) {
        fact[i] = fact[i - 1] * i % MOD
        i = i + 1
    }
    invfact[N] = powMod(fact[N], MOD - 2)
    i = N
    while (i >= 1) {
        invfact[i - 1] = invfact[i] * i % MOD
        i = i - 1
    }

    // K+1 个块，颜色交替。开头为红时红块 r1、蓝块 b1；开头为蓝时红块 b1、蓝块 r1
    let r1 = (K + 2) / 2
    let b1 = (K + 1) / 2

    var ckR1 = Array<Int64>(0, { _ => 0 })
    var ckB1 = Array<Int64>(0, { _ => 0 })
    var invfR1: Int64 = 0
    var invfB1: Int64 = 0
    let haveR1 = r1 <= N
    let haveB1 = b1 <= N
    if (haveR1) {
        ckR1 = Array<Int64>(r1 + 1, { j: Int64 => fact[r1] * invfact[j] % MOD * invfact[r1 - j] % MOD })
        invfR1 = invfact[r1 - 1]
    }
    if (haveB1) {
        ckB1 = Array<Int64>(b1 + 1, { j: Int64 => fact[b1] * invfact[j] % MOD * invfact[b1 - j] % MOD })
        if (b1 >= 1) {
            invfB1 = invfact[b1 - 1]
        }
    }

    var ansXor: Int64 = 0
    var L: Int64 = 1
    while (L <= M) {
        var wRR: Int64 = 0
        var wRB: Int64 = 0
        var wBR: Int64 = 0
        var wBB: Int64 = 0
        if (haveR1) {
            wRR = ways(R, r1, L, ckR1, invfR1, fact, invfact)
            wBR = ways(B, r1, L, ckR1, invfR1, fact, invfact)
        }
        if (haveB1) {
            wRB = ways(R, b1, L, ckB1, invfB1, fact, invfact)
            wBB = ways(B, b1, L, ckB1, invfB1, fact, invfact)
        }
        let ans = (wRR * wBB + wRB * wBR) % MOD
        if (ans != 0) {
            ansXor = ansXor ^ (L * ans)
        }
        L = L + 1
    }
    println(ansXor)
    return 0
}
```
