---
oj: dmy
pid: '353'
title: '[R56F] 不是计数题'
difficulty: 提高+/省选-
tags:
  - 数学
timeLimit: 3s
memoryLimit: 256m
---

> 数据规模：$1 \le T \le 15$，$1 \le a \le 10^{14}$。

## 思路

设 $n = x(x+1)$，问题是求最小的 $x$，使得 $a \mid x(x+1)$（$n$ 随 $x$ 严格递增，最小好数对应最小匹配值）。关键性质：$\gcd(x, x+1) = 1$，所以对 $a$ 的每个素因子幂 $p^e$，$p^e$ 必须**完全**整除 $x$ 或 $x+1$，不能拆开分给两者。

把 $a$ 分解为互质的素因子幂 $m_1 m_2 \cdots m_k$（$m_i = p_i^{e_i}$），对每个 $m_i$ 二选一：$m_i \mid x$ 或 $m_i \mid (x+1)$。选定后，选中给 $x$ 的乘积记为 $A$，剩下给 $x+1$ 的乘积记为 $B$，于是

$$
x \equiv 0 \pmod A, \qquad x \equiv -1 \pmod B, \qquad AB = a, \quad \gcd(A, B) = 1.
$$

令 $x = At$，则 $At \equiv -1 \pmod B$，即 $t \equiv -A^{-1} \pmod B$（模逆用扩展欧几里得求），取 $t \in [1, B]$ 的最小正解即可得到该组合下最小的 $x = At$。

枚举 $2^k$ 种选择组合（$k \le 12$，因为前 13 个素数之积已超过 $10^{14}$），取所有组合中 $x$ 的最小值。注意 $x = a$ 恒为一组可行解（$a \mid a(a+1)$），因此**对任意 $a$ 都有解**，题面中的 `-1` 分支实际不会触发，代码中仍保留防御。

分解 $10^{14}$ 以内的数只需试除到 $\sqrt a \le 10^7$：先埃氏筛出 $10^7$ 内素数，再逐组用素数试除即可（$T$ 组全为接近 $10^{14}$ 的素数是最坏情形，也仅需约 $6.6 \times 10^5$ 次取模每组）。

复杂度：分解 $O(\sqrt a / \log a)$（每组），枚举 $O(2^k \cdot k)$，总时间约 $O(10^7 \log\log 10^7)$ 量级，空间 $O(10^7)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

// 求 a 模 m 的逆元（保证 gcd(a, m) = 1，m > 1）
func modInv(a: Int64, m: Int64): Int64 {
    var t: Int64 = 0
    var newt: Int64 = 1
    var r: Int64 = m
    var newr: Int64 = a
    while (newr != 0) {
        let q = r / newr
        let tt = t - q * newt
        t = newt
        newt = tt
        let rr = r - q * newr
        r = newr
        newr = rr
    }
    while (t < 0) {
        t += m
    }
    return t
}

// 求最小的 x，使得 a | x(x+1)
func solve(a: Int64, primes: ArrayList<Int64>): Int64 {
    var xx = a
    let pf = ArrayList<Int64>()   // 各素因子幂 p^e
    for (p in primes) {
        if (p * p > xx) {
            break
        }
        if (xx % p == 0) {
            var m: Int64 = 1
            while (xx % p == 0) {
                xx /= p
                m *= p
            }
            pf.add(m)
        }
    }
    if (xx > 1) {
        pf.add(xx)
    }
    let k = pf.size
    var best: Int64 = a
    for (mask in 0..(1 << k)) {
        var A: Int64 = 1
        for (i in 0..k) {
            if (((mask >> i) & 1) == 1) {
                A *= pf[i]
            }
        }
        let B = a / A
        if (B == 1) {
            if (A < best) {
                best = A
            }
            continue
        }
        // x ≡ 0 (mod A)，x ≡ -1 (mod B)，x = A * t，t ≡ -A^{-1} (mod B)
        let inv = modInv(A % B, B)
        let t = B - inv
        let x = A * t
        if (x < best) {
            best = x
        }
    }
    return best
}

main(): Int64 {
    let reader = getStdIn()
    let tLine = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let T = tLine[0]
    // 埃氏筛出 10^7 以内素数（sqrt(10^14)）
    let N: Int64 = 10000000
    let isPrime = Array<Bool>(N + 1, { _ => true })
    isPrime[0] = false
    isPrime[1] = false
    var p: Int64 = 2
    while (p * p <= N) {
        if (isPrime[p]) {
            var j: Int64 = p * p
            while (j <= N) {
                isPrime[j] = false
                j += p
            }
        }
        p += 1
    }
    let primes = ArrayList<Int64>()
    for (i in 2..(N + 1)) {
        if (isPrime[i]) {
            primes.add(i)
        }
    }
    for (i in 0..T) {
        let aa = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })[0]
        println(solve(aa, primes))
    }
    return 0
}
```

要点：

- 扩展欧几里得中间量 $|t_{i-1} - q_i t_i| \le |t_{i-1}| + |t_{i+1}| \le 2m$（$|t_i| \le m / r_i$），$m \le 10^{14}$ 时 `Int64` 不会溢出。
- $B = 1$ 时组合退化为 $x \equiv 0 \pmod A$，最小正解即 $x = A$，直接取。
