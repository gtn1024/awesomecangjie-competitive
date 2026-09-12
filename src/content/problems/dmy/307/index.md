---
oj: dmy
pid: '307'
title: '[R49E]三元逆序对'
difficulty: 提高
tags:
  - 组合数学
  - 逆序对
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定长度为 $n$ 的序列 $a=(a_1,a_2,\dots,a_n)$，将其重复复制 $k$ 次得到长度为 $nk$ 的新序列 $X$（即 $X_{m\cdot n+i}=a_i$）。求满足 $1\le i<j<k\le nk$ 且 $X_i>X_j>X_k$ 的三元组个数，对 $998244353$ 取模。

> 对于 $100\%$ 的数据，$3\le n\le 2000$，$1\le k\le 10^6$，$1\le a_i\le 2000$。

## 思路

把序列 $X$ 看作 $k$ 个「拷贝」，每个拷贝都是原序列 $a$。三个下标落在三个拷贝中，按拷贝下标 $c_1\le c_2\le c_3$ 分类，共四种情况：

1. **三个拷贝两两不同** $c_1<c_2<c_3$：此时 $i<j<k$ 自动满足（拷贝间顺序已经确定），只需 $a_{t_1}>a_{t_2}>a_{t_3}$。枚举中间位置 $t_2$，统计 $a$ 中值大于 $a_{t_2}$ 的位置数 $\text{cntGt}$ 和值小于 $a_{t_2}$ 的位置数 $\text{cntLt}$，则贡献为 $\text{cntGt}\cdot\text{cntLt}$。拷贝选择数 $\binom{k}{3}$。

2. **前两个在同一拷贝，第三个在更靠后的拷贝** $c_1=c_2<c_3$：在同一拷贝中需要 $t_1<t_2$ 且 $a_{t_1}>a_{t_2}$，第三个位置 $t_3$ 取 $a$ 中值小于 $a_{t_2}$ 的任意位置。枚举 $t_2$，记 $\text{gt}[t_2]=\#\{t_1<t_2:a_{t_1}>a_{t_2}\}$，贡献 $\text{gt}[t_2]\cdot\text{cntLt}$。拷贝对选择数 $\binom{k}{2}$。

3. **第一个在更靠前的拷贝，后两个在同一拷贝** $c_1<c_2=c_3$：在同一拷贝中需要 $t_2<t_3$ 且 $a_{t_2}>a_{t_3}$，第一个位置 $t_1$ 取 $a$ 中值大于 $a_{t_2}$ 的任意位置。枚举 $t_2$，记 $\text{lrt}[t_2]=\#\{t_3>t_2:a_{t_3}<a_{t_2}\}$，贡献 $\text{cntGt}\cdot\text{lrt}[t_2]$。拷贝对选择数 $\binom{k}{2}$。

4. **三个都在同一拷贝** $c_1=c_2=c_3$：需要 $t_1<t_2<t_3$ 且 $a_{t_1}>a_{t_2}>a_{t_3}$。枚举中间位置 $t_2$，贡献 $\text{gt}[t_2]\cdot\text{lrt}[t_2]$。拷贝选择数 $k$。

最终答案为四项之和。

由于 $k$ 很大（$10^6$），$\binom{k}{2}$ 与 $\binom{k}{3}$ 直接用 $k$ 的多项式计算再对 $998244353$ 取模即可；除以 $2$ 用乘 $499122177$（$2$ 的逆元）实现，除以 $6$ 用乘 $166374059$（$6$ 的逆元）实现。

## 复杂度

- 时间复杂度：$O(n^2)$，主要花在预处理每个位置的 $\text{gt}$、$\text{lrt}$ 等计数上。
- 空间复杂度：$O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

main(): Int64 {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line[0])
    let k = Int64.parse(line[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // C(m,2) = m*(m-1)/2, C(m,3) = m*(m-1)*(m-2)/6
    func c2(m0: Int64): Int64 {
        let m = m0 % MOD
        let res = (((m * ((m - 1 + MOD) % MOD)) % MOD) * 499122177) % MOD
        return res
    }
    func c3(m0: Int64): Int64 {
        let m = m0 % MOD
        let res = ((((((m * ((m - 1 + MOD) % MOD)) % MOD) * ((m - 2 + 2 * MOD) % MOD)) % MOD) * 166374059) % MOD)
        return res
    }

    // Counters within single copy:
    // gt[t]  = #{t'<t : a[t']>a[t]}
    // grt[t] = #{t'>t : a[t']>a[t]}
    // lrt[t] = #{t'>t : a[t']<a[t]}
    let nn = a.size
    var gt = Array<Int64>(nn, { _ => 0 })
    var lrt = Array<Int64>(nn, { _ => 0 })
    var t = 0
    while (t < nn) {
        var tp = 0
        while (tp < t) {
            if (a[tp] > a[t]) {
                gt[t] += 1
            }
            tp += 1
        }
        tp = t + 1
        while (tp < nn) {
            if (a[tp] < a[t]) {
                lrt[t] += 1
            }
            tp += 1
        }
        t += 1
    }

    var ans: Int64 = 0

    // Term 1: c1<c2<c3. Enumerate middle position t2.
    var distinctTriples: Int64 = 0
    t = 0
    while (t < nn) {
        var cntGt: Int64 = 0
        var cntLt: Int64 = 0
        var tp = 0
        while (tp < nn) {
            if (a[tp] > a[t]) {
                cntGt += 1
            } else if (a[tp] < a[t]) {
                cntLt += 1
            }
            tp += 1
        }
        distinctTriples += (cntGt * cntLt) % MOD
        t += 1
    }
    distinctTriples = distinctTriples % MOD
    ans = (ans + (c3(k) * distinctTriples) % MOD) % MOD

    // Term 2: c1<c2=c3. Enumerate t2 in the shared later copy.
    var term2sum: Int64 = 0
    var t2 = 0
    while (t2 < nn) {
        var cntGt2: Int64 = 0
        var tp = 0
        while (tp < nn) {
            if (a[tp] > a[t2]) {
                cntGt2 += 1
            }
            tp += 1
        }
        term2sum = (term2sum + (cntGt2 * lrt[t2]) % MOD) % MOD
        t2 += 1
    }
    ans = (ans + (c2(k) * term2sum) % MOD) % MOD

    // Term 3: c1=c2<c3. Enumerate t2 in the shared earlier copy.
    var term3sum: Int64 = 0
    var tmid = 0
    while (tmid < nn) {
        var cntLt2: Int64 = 0
        var tp = 0
        while (tp < nn) {
            if (a[tp] < a[tmid]) {
                cntLt2 += 1
            }
            tp += 1
        }
        term3sum = (term3sum + (gt[tmid] * cntLt2) % MOD) % MOD
        tmid += 1
    }
    ans = (ans + (c2(k) * term3sum) % MOD) % MOD

    // Term 4: c1=c2=c3. Enumerate middle position t2.
    var term4sum: Int64 = 0
    var tm = 0
    while (tm < nn) {
        term4sum = (term4sum + (gt[tm] * lrt[tm]) % MOD) % MOD
        tm += 1
    }
    ans = (ans + (k * term4sum) % MOD) % MOD

    println(ans)
    return 0
}
```
