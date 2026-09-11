---
oj: dmy
pid: '108'
title: '[R18F]重排座位'
difficulty: 提高
tags:
  - 组合数学
  - 容斥
  - 生成函数
timeLimit: 1s
memoryLimit: 512m
---

## 题目

有 $2\times n$ 个座位与 $2\times n$ 名同学，编号均为 $1\sim 2\times n$，座位两两一组（座位 $1,2$ 为第 $1$ 组，座位 $3,4$ 为第 $2$ 组，以此类推），原本同学 $i$ 坐在座位 $i$。现在把同学重排到座位上（一一对应），对 $k=0\sim 2\times n$ 求恰好有 $k$ 名同学的新座位与原本座位属于同一组的方案数，对 $998244353$ 取模。

> 对于 $100\%$ 的数据，$2\le n\le 2000$。

## 思路

每种重排方案就是同学集合到座位集合的一个一一对应（置换）。把同学 $i$ 到座位 $j$ 的「指派」看作一条带权边：若 $i$ 与 $j$ 同组，边权为 $x$，否则为 $1$。于是「恰好 $k$ 人留在组内」的方案数，正是这张完全二部图所有完美匹配的边权乘积之和中 $x^k$ 的系数。

记权矩阵为 $W$（行为同学、列为座位），它可以写成

$$
W = J - (1-x)M,
$$

其中 $J$ 是全 $1$ 矩阵，$M$ 是每组的 $2\times 2$ 全 $1$ 分块构成的对角分块矩阵（$M$ 在同组位置为 $1$，其余为 $0$）。设 $y=1-x$，则

$$
\operatorname{per}(J-yM)=\sum_{\sigma}\prod_i (1-y\cdot[\sigma(i)\text{ 与 }i\text{ 同组}]).
$$

把乘积展开，对每个置换挑出若干「取 $-y$ 项」的下标集合 $T$，交换求和顺序：

$$
\operatorname{per}(J-yM)=\sum_T (-y)^{|T|}\cdot\#\{\sigma:\ T\text{ 中同学都坐进自己组}\}.
$$

对固定的 $T$，设 $t=|T|$。每组内：$T$ 在该组有 $0$ 人时贡献 $1$ 种指派，$1$ 人时有 $2$ 种（该同学可坐本组两个座位之一），$2$ 人时有 $2$ 种（两人占本组两座）。其余 $2n-t$ 名同学任意坐剩下的座位，有 $(2n-t)!$ 种。设 $u$ 个组被 $T$ 取满 $2$ 人、$v$ 个组取 $1$ 人，则 $t=2u+v$，选组的方案数为 $\binom{n}{u}\binom{n-u}{v}2^v$，贡献的指派数为 $2^u\cdot 2^v$。于是

$$
A(x)=\sum_{u,v}\binom{n}{u}\binom{n-u}{v}2^u4^v\,(2n-2u-v)!\,(-(1-x))^{2u+v}.
$$

按 $t=2u+v$ 归并：设 $E_t=\sum_{2u+v=t}\frac{n!}{u!\,v!\,(n-u-v)!}\,2^u4^v$，则 $D_t=(2n-t)!\,E_t$，答案为

$$
\mathrm{ans}_k=\sum_t(-1)^{t+k}\binom{t}{k}D_t
=\frac{(-1)^k}{k!}\sum_{j=0}^{2n-k}(-1)^{k+j}D_{k+j}\frac{(k+j)!}{j!}.
$$

预计算阶乘与阶乘逆元，先 $O(n^2)$ 枚举 $(u,v)$ 求所有 $E_t$，再对每个 $k$ 做 $O(n)$ 求和即可。

## 复杂度

- 时间复杂度：$O(n^2)$，即 $O((2n)^2)$ 的常数级运算，$n=2000$ 时完全可行。
- 空间复杂度：$O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

func powMod(a: Int64, e: Int64): Int64 {
    var base = a % MOD
    var exp = e
    var res: Int64 = 1
    while (exp > 0) {
        if (exp % 2 == 1) {
            res = res * base % MOD
        }
        base = base * base % MOD
        exp = exp / 2
    }
    return res
}

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let N = 2 * nn

    // 阶乘与阶乘逆元，到 2n
    let fact = Array<Int64>(N + 1, { _ => 0 })
    fact[0] = 1
    for (i in 1..=N) {
        fact[i] = fact[i - 1] * i % MOD
    }
    let invfact = Array<Int64>(N + 1, { _ => 0 })
    invfact[N] = powMod(fact[N], MOD - 2)
    var idx = N
    while (idx >= 1) {
        invfact[idx - 1] = invfact[idx] * idx % MOD
        idx -= 1
    }

    // 2 与 4 的幂
    let p2 = Array<Int64>(nn + 1, { _ => 0 })
    let p4 = Array<Int64>(nn + 1, { _ => 0 })
    p2[0] = 1
    p4[0] = 1
    for (i in 1..=nn) {
        p2[i] = p2[i - 1] * 2 % MOD
        p4[i] = p4[i - 1] * 4 % MOD
    }

    // E[t] = sum_{2u+v=t, u+v<=n} n!/(u!v!(n-u-v)!) * 2^u * 4^v
    let E = Array<Int64>(N + 1, { _ => 0 })
    var u: Int64 = 0
    while (u <= nn) {
        var v: Int64 = 0
        while (v <= nn - u) {
            let t = 2 * u + v
            let w1 = fact[nn] * invfact[u] % MOD
            let w2 = w1 * invfact[v] % MOD
            let w3 = w2 * invfact[nn - u - v] % MOD
            let w4 = w3 * p2[u] % MOD
            let w = w4 * p4[v] % MOD
            E[t] = (E[t] + w) % MOD
            v += 1
        }
        u += 1
    }

    // H[t] = (-1)^t * (2n-t)! * E[t] * t!
    let H = Array<Int64>(N + 1, { _ => 0 })
    for (t in 0..=N) {
        let d = fact[N - t] * E[t] % MOD
        var h = d * fact[t] % MOD
        if (t % 2 == 1) {
            h = (MOD - h) % MOD
        }
        H[t] = h
    }

    // ans[k] = (-1)^k * invfact[k] * sum_{j} H[k+j] * invfact[j]
    for (k in 0..=N) {
        var s: Int64 = 0
        var j: Int64 = 0
        while (j <= N - k) {
            s = (s + H[k + j] * invfact[j]) % MOD
            j += 1
        }
        var ak = s * invfact[k] % MOD
        if (k % 2 == 1) {
            ak = (MOD - ak) % MOD
        }
        println(ak)
    }
    return 0
}
```
