---
oj: dmy
pid: '318'
title: '[R51D] 听取蛙声一片3'
difficulty: 普及+/提高
tags:
  - 数论
  - 容斥原理
  - 快速幂
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 10^9$。

## 思路

如果一个被选中的编号不是 $n$ 的约数，那么所有被选中编号的最小公倍数也不可能等于 $n$。因此，所有非约数都必须 WA，问题只需考虑 $n$ 的约数。

将 $n$ 分解质因数：

$$
n=\prod_{i=1}^{k}p_i^{a_i}
$$

$n$ 的每个约数都可以用指数向量 $(e_1,e_2,\ldots,e_k)$ 表示，其中 $0\le e_i\le a_i$。一组约数的最小公倍数等于 $n$，当且仅当对于每个 $i$，至少有一个被选中的约数满足 $e_i=a_i$。

定义坏事件 $E_i$：没有任何被选中的约数含有 $p_i$ 的最高次幂 $p_i^{a_i}$。对这些坏事件使用容斥原理。

枚举坏事件集合 $T\subseteq\{1,2,\ldots,k\}$。若要求 $T$ 中的坏事件同时发生，那么：

- 对于 $i\in T$，约数中 $p_i$ 的指数只能从 $0$ 到 $a_i-1$，共有 $a_i$ 种选择；
- 对于 $i\notin T$，指数可以从 $0$ 到 $a_i$，共有 $a_i+1$ 种选择。

所以此时允许被选中的约数共有

$$
d_T=\prod_{i\in T}a_i\prod_{i\notin T}(a_i+1)
$$

个。每个允许的约数都能独立选择 AC 或 WA，因此满足这些坏事件的方案数为 $2^{d_T}$。由容斥原理，答案为

$$
\sum_{T\subseteq\{1,2,\ldots,k\}}(-1)^{|T|}2^{d_T}
$$

空集也被每一项计入，但因为 $n\ge 2$，所以 $k\ge 1$，空集的总系数为 $(1-1)^k=0$，会在容斥中自动消去。

例如 $n=6=2\times3$，两个质因子的指数都是 $1$，答案为

$$
2^4-2^2-2^2+2^1=10
$$

试除分解质因数需要 $O(\sqrt n)$ 时间。设 $k$ 为不同质因子的数量，$\tau(n)$ 为约数个数，枚举容斥集合并计算快速幂需要 $O\bigl(2^k(k+\log\tau(n))\bigr)$ 时间。总时间复杂度为 $O\bigl(\sqrt n+2^k(k+\log\tau(n))\bigr)$，空间复杂度为 $O(k)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*
import std.collection.*

// 听取蛙声一片3: count subsets S of divisors of n whose lcm == n.
// n = prod p_i^a_i. IE over primes that fail to reach max exponent.
// Answer = sum over T subset of primes (-1)^|T| * 2^(prod_{i in T} a_i * prod_{i notin T} (a_i+1))

// Trial division is fine for n <= 1e9.

func powMod(base: Int64, exp: Int64, mod: Int64): Int64 {
    var b = base % mod
    if (b < 0) {
        b = b + mod
    }
    var e = exp
    var result: Int64 = 1
    while (e > 0) {
        if ((e & 1) == 1) {
            result = (result * b) % mod
        }
        b = (b * b) % mod
        e = e >> 1
    }
    return result
}

func factorize(n0: Int64): ArrayList<Int64> {
    // returns list of distinct prime exponents a_i (>=1)
    var n = n0
    let result = ArrayList<Int64>()
    var d: Int64 = 2
    while (d * d <= n) {
        if (n % d == 0) {
            var cnt: Int64 = 0
            while (n % d == 0) {
                cnt = cnt + 1
                n = n / d
            }
            result.add(cnt)
        }
        d = d + 1
    }
    if (n > 1) {
        result.add(Int64(1))
    }
    return result
}

main() {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let MOD: Int64 = 998244353
    let TWO: Int64 = 2

    let exps = factorize(n)
    let k = exps.size

    var answer: Int64 = 0
    let total = 1 << k
    var mask = 0
    while (mask < total) {
        // count bits in mask = number of primes in T
        var bits: Int64 = 0
        var mm = mask
        while (mm > 0) {
            bits = bits + Int64(mm & 1)
            mm = mm >> 1
        }
        // exponent = prod_{i in T} a_i * prod_{i not in T} (a_i+1)
        var exponent: Int64 = 1
        var i = 0
        while (i < k) {
            if (((mask >> i) & 1) == 1) {
                exponent = exponent * exps[i]
            } else {
                exponent = exponent * (exps[i] + 1)
            }
            i = i + 1
        }
        var term = powMod(TWO, exponent, MOD)
        if (bits % 2 == 0) {
            answer = (answer + term) % MOD
        } else {
            answer = (answer - term + MOD) % MOD
        }
        mask = mask + 1
    }

    println(answer)
}
```
