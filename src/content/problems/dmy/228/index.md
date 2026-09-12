---
oj: dmy
pid: '228'
title: '[R37G]烹饪大赛'
difficulty: 提高
tags:
  - 数论
  - 欧拉函数
  - 莫比乌斯反演
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 2 \times 10^5$，$a_i \le 10^6$，$x < 998244353$。

## 思路

设选出的集合 $S$ 大小为 $m$，其美味程度为 $x^m \times \gcd(S)$。我们需要对所有非空集合求和。

按 $\gcd$ 分组。记 $c_t$ 为能被 $t$ 整除的食材个数，则所有元素都被 $t$ 整除的非空集合有 $2^{c_t}-1$ 个，其中每个集合的贡献为 $x^{|S|}$，于是

$$F(t) = \sum_{\substack{S \ne \emptyset \\ t \mid \gcd(S)}} x^{|S|} = (1+x)^{c_t} - 1$$

而 $F(t)$ 又可以按 $\gcd$ 恰好等于 $t$ 的倍数拆分：$F(t) = \sum_{t \mid d} G(d)$，其中 $G(d)$ 是 $\gcd$ 恰好为 $d$ 的集合对 $x^{|S|}$ 之和。由莫比乌斯反演，答案

$$\text{ans} = \sum_{d} d \cdot G(d) = \sum_{t} F(t) \sum_{d \mid t} d \cdot \mu\!\left(\frac{t}{d}\right) = \sum_{t} \varphi(t) \cdot \big((1+x)^{c_t} - 1\big)$$

最后一步用到了 $\sum_{d \mid t} d \cdot \mu(t/d) = \varphi(t)$。

于是流程为：线性筛预处理 $1 \dots M$（$M = \max a_i$）的欧拉函数 $\varphi$；预处理 $(1+x)^k$（$k \le n$）；对每个 $t$ 用倍数枚举统计 $c_t = \sum_{t \mid v} \text{cnt}[v]$，累加 $\varphi(t) \cdot ((1+x)^{c_t} - 1)$ 即可。

## 复杂度

时间 $O(M \log M + n)$（倍数枚举总和为调和级数 $M \ln M$，$M \le 10^6$），空间 $O(M)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let toks = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = toks[0]
    let x = toks[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var M: Int64 = 0
    for (v in a) {
        if (v > M) {
            M = v
        }
    }

    var cnt = Array<Int64>(M + 1, { _ => 0 })
    for (v in a) {
        cnt[v] = cnt[v] + 1
    }

    // 线性筛求欧拉函数 phi[1..M]
    var phi = Array<Int64>(M + 1, { _ => 0 })
    var isComp = Array<Bool>(M + 1, { _ => false })
    var primes = Array<Int64>(M + 1, { _ => 0 })
    var pc: Int64 = 0
    phi[1] = 1
    var i: Int64 = 2
    while (i <= M) {
        if (!isComp[i]) {
            primes[pc] = i
            pc = pc + 1
            phi[i] = i - 1
        }
        var j: Int64 = 0
        while (j < pc) {
            let p = primes[j]
            let t = i * p
            if (t > M) {
                break
            }
            isComp[t] = true
            if (i % p == 0) {
                phi[t] = phi[i] * p
                break
            } else {
                phi[t] = phi[i] * (p - 1)
            }
            j = j + 1
        }
        i = i + 1
    }

    // (1 + x)^k 预处理，k = 0..n
    var pow1x = Array<Int64>(n + 1, { _ => 0 })
    pow1x[0] = 1
    let base = (x + 1) % MOD
    var k: Int64 = 1
    while (k <= n) {
        pow1x[k] = pow1x[k - 1] * base % MOD
        k = k + 1
    }

    // 对每个 t，统计能被 t 整除的元素个数 c_t，累加 phi[t] * ((1+x)^c_t - 1)
    var ans: Int64 = 0
    var t: Int64 = 1
    while (t <= M) {
        var c: Int64 = 0
        var m: Int64 = t
        while (m <= M) {
            c = c + cnt[m]
            m = m + t
        }
        if (c > 0) {
            let term = (pow1x[c] - 1 + MOD) % MOD
            let add = phi[t] * term % MOD
            ans = ans + add
            if (ans >= MOD) {
                ans = ans - MOD
            }
        }
        t = t + 1
    }

    println(ans)
}
```
