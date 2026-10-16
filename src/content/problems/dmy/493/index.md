---
oj: dmy
pid: '493'
title: '[R79F] 展品'
difficulty: 提高+
tags:
  - 线段树
  - 思维
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2\times10^5$，$1\le a_i\le n$。

## 思路

**区间是否合法关于右端点单调。** 固定 $R$，若 $[L,R]$ 非法（内部能选出 $x\,y\,x\,y$ 交错模式），则任何 $L'\le L$ 的 $[L',R]$ 也非法。设 $M(R)$ 为所有末下标 $l\le R$ 的非法四元组的首下标 $i$ 的最大值（没有则为 $0$），那么 $[L,R]$ 合法当且仅当 $L>M(R)$，答案为

$$\sum_{R=1}^{n}\bigl(R-M(R)\bigr).$$

**把四元组按第三元 $k$ 参数化。** 记 $s[k]$ 为 $a_k$ 上一次出现的位置（没有则为 $0$）。考察所有以 $k$ 为第三元的合法四元组 $(i,j,k,l)$，其中 $a_i=a_k=w$，$a_j=a_l=y\ne w$。由于 $s[k]$ 是 $k$ 之前最后一个 $w$ 的出现位置，必有 $i\le s[k]$。

- 若 $j>s[k]$，则 $y$ 出现在 $(s[k],k)$ 内，取 $i=s[k]$ 起始更优；
- 若 $j<s[k]$，由 $i<j<s[k]<k$ 且 $i$、$s[k]$ 都是 $w$，把第三元换成 $s[k]$ 后 $(i,j,s[k],l)$ 仍是合法四元组，起始不会变小。第三元严格下降且始终大于 $j$，反复替换必终止。

因此 **$M(R)$ 只需考察 $i=s[k]$ 的四元组**。此时 $j$ 必须落在 $(s[k],k)$ 内，$l$ 是某个 $y$ 在 $k$ 之后的第一次出现。对每个 $k$ 只保留起始最大者，其最小末下标为

$$L_k=\min\{\,q>k : s[k]<s[q]<k\,\},$$

取到最小值的 $q$ 满足 $s[q]\in(s[k],k)$，即 $a_q$ 在 $(s[k],k)$ 内出现过，对应 $j=s[q]$。条件 $s[q]<k$ 同时保证 $a_q\ne a_k$（否则 $s[q]$ 是 $(s[k],k)$ 内的 $w$，与 $s[k]$、$k$ 相邻矛盾），故 $(s[k],\,s[q],\,k,\,q)$ 是合法四元组。

**扫描求所有 $L_k$。** 把 $p$ 从 $1$ 到 $n$ 递增扫描，给所有尚未赋值且满足

$$s[k]<s[p]<k<p$$

的 $k$ 定下 $L_k=p$。$p$ 递增保证了取到的是「首个满足条件的位置」，每个 $k$ 恰好被赋值一次。这相当于维护一个以 $s$ 值为关键字的集合，支持「把区间 $(s[p],p)$ 内所有关键字 $<s[p]$ 的元素取出」。用线段树维护区间最小值即可：从根递归，若区间最小值 $\ge s[p]$ 则剪枝，否则下传；到达叶子即取出（置为 $+\infty$）并记录 $s[k]$。每个位置只被取一次，总复杂度 $O(n\log n)$。

随后按 $R$ 扫描，维护 $M=\max\{s[k]:L_k\le R\}$ 并累加 $R-M$，即得答案。

## 复杂度

时间 $O(n\log n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) { gpos += 1 }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x
}

var gs = Array<Int64>(0, { _ => 0 })
var gmn = Array<Int64>(0, { _ => 0 })
var gINF: Int64 = 0
var gLo: Int64 = 0
var gHi: Int64 = 0
var gTh: Int64 = 0
var gBest: Int64 = 0

func extract(node: Int64, l: Int64, r: Int64): Unit {
    if (r < gLo || l > gHi || gmn[node] >= gTh) {
        return
    }
    if (l == r) {
        if (gs[l] > gBest) {
            gBest = gs[l]
        }
        gmn[node] = gINF
        return
    }
    let mid = (l + r) / 2
    extract(node * 2, l, mid)
    extract(node * 2 + 1, mid + 1, r)
    let lv = gmn[node * 2]
    let rv = gmn[node * 2 + 1]
    gmn[node] = if (lv < rv) { lv } else { rv }
}

func build(node: Int64, l: Int64, r: Int64): Unit {
    if (l == r) {
        gmn[node] = gs[l]
        return
    }
    let mid = (l + r) / 2
    build(node * 2, l, mid)
    build(node * 2 + 1, mid + 1, r)
    let lv = gmn[node * 2]
    let rv = gmn[node * 2 + 1]
    gmn[node] = if (lv < rv) { lv } else { rv }
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    gINF = n + 5
    var a = Array<Int64>(n + 1, { _ => 0 })
    for (i in 1..=n) {
        a[i] = nextInt()
    }
    let nn = n
    gs = Array<Int64>(nn + 1, { _ => 0 })
    gmn = Array<Int64>(4 * nn + 10, { _ => 0 })
    var last = Array<Int64>(nn + 2, { _ => 0 })
    for (k in 1..=n) {
        let v = a[k]
        gs[k] = last[v]
        last[v] = k
    }
    if (n >= 1) {
        build(1, 1, nn)
        var M: Int64 = 0
        var ans: Int64 = 0
        for (p in 1..=n) {
            gLo = gs[p] + 1
            gHi = p - 1
            gTh = gs[p]
            gBest = 0
            if (gLo <= gHi) {
                extract(1, 1, nn)
            }
            if (gBest > M) {
                M = gBest
            }
            ans += p - M
        }
        println(ans)
    }
}
```

</details>
