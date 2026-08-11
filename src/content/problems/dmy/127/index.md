---
oj: dmy
pid: '127'
title: '[R21F]二分图计数'
difficulty: 提高+/省选-
tags:
  - 图论
  - 二分图
  - 计数
timeLimit: 1s
memoryLimit: 256m
---

## 题目

给定一张 $n$ 个顶点、$m$ 条边的无向简单图 $G$（可能不连通），求有多少种无向简单连通二分图 $H$，使得从 $H$ 中删除两条边后恰好得到 $G$，答案对 $998244353$ 取模。

> 对于 $100\%$ 的数据，$1\le n\le 10^5$，$0\le m\le 3\times 10^5$。

## 思路

从 $H$ 中删除两条边得到 $G$，等价于在 $G$ 中加入两条**不在 $G$ 中**的边 $e_1,e_2$（无序、互不相同）得到 $H$。因此只需统计无序边对 $\{e_1,e_2\}$ 的数量，使得 $G+e_1+e_2$ 简单（自动满足）、**连通**且**二分**。

先用 BFS 求出 $G$ 的所有连通分量并二染色，同时统计每个分量的两部分大小 $a_i,b_i$ 与内部边数 $m_i$。若 $G$ 本身不是二分图，则任何包含 $G$ 的图都不是二分图，答案为 $0$。

设分量数为 $k$。每加入一条边至多把两个分量连成一片，所以 $k>3$ 时答案为 $0$。每个二分连通分量的染色可以整体翻转，这为每条跨分量边带来自由变量，是分类讨论的关键：

- **分量内部的边** $(u,v)$：保持二分的充要条件是 $u,v$ 异色。记第 $i$ 个分量中「异色且不在 $G$ 中」的点对数为 $g_i=a_i b_i-m_i$（连通二分图的所有边都连接异色点对）。
- **跨分量的边**：仅一条跨边时，总能通过翻转两端分量使其满足二分约束。但两条边同时跨同一对分量时约束会耦合：设跨边 $(u,v)$ 的类型为 $\text{color}(u)\oplus\text{color}(v)$，两条跨边可行当且仅当类型相同（两个翻转变量恰好承载两个约束方程）。若两条跨边涉及三个分量，则三个翻转变量只有两个约束方程，必然可满足。

按分量数分类计数：

- **$k=1$**：两条边都在分量内部，各自异色即可，$g=a_1b_1-m$，答案为 $\binom{g}{2}$。
- **$k=2$**：连通要求至少一条跨边，分两种情况：一条跨边加一条内部异色边，数量为 $|A|\cdot|B|\cdot(g_A+g_B)$；两条跨边需类型相同，数量为 $\binom{t_0}{2}+\binom{t_1}{2}$，其中 $t_0=a_Aa_B+b_Ab_B$ 为类型 $0$（同色）的跨点对数，$t_1=a_Ab_B+b_Aa_B$ 为类型 $1$（异色）的跨点对数。总答案为 $|A|\cdot|B|\cdot(g_A+g_B)+\binom{t_0}{2}+\binom{t_1}{2}$。
- **$k=3$**：两条边必须都跨分量，且把三个分量连成一条链，即 $AB$ 与 $AC$、$AB$ 与 $BC$、$AC$ 与 $BC$ 三种形态，数量为 $|A||B|\cdot|A||C|+|A||B|\cdot|B||C|+|A||C|\cdot|B||C|=|A||B||C|\cdot(|A|+|B|+|C|)$。

所有乘法与组合数对 $998244353$ 取模，$\binom{x}{2}=x(x-1)/2$ 用模 $2$ 的逆元 $499122177$ 计算。

## 复杂度

- 时间复杂度：$O(n+m)$，BFS 二染色加一遍边数统计。
- 空间复杂度：$O(n+m)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main(): Int64 {
    let MOD: Int64 = 998244353
    let inv2: Int64 = 499122177
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = first[0]
    let m = first[1]
    var adj = ArrayList<ArrayList<Int64>>()
    var i: Int64 = 0
    while (i < nn) {
        adj.add(ArrayList<Int64>())
        i += 1
    }
    var eu = Array<Int64>(m, { _ => 0 })
    var ev = Array<Int64>(m, { _ => 0 })
    var j: Int64 = 0
    while (j < m) {
        let l = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = l[0] - 1
        let v = l[1] - 1
        eu[j] = u
        ev[j] = v
        adj[u].add(v)
        adj[v].add(u)
        j += 1
    }
    // BFS 求连通分量并二染色，同时统计每个分量两部的大小
    var comp = Array<Int64>(nn, { _ => -1 })
    var col = Array<Int64>(nn, { _ => -1 })
    var c0 = Array<Int64>(nn, { _ => 0 })
    var c1 = Array<Int64>(nn, { _ => 0 })
    var cm = Array<Int64>(nn, { _ => 0 })
    var k: Int64 = 0
    var ok = true
    var q = Array<Int64>(nn, { _ => 0 })
    var v: Int64 = 0
    while (v < nn) {
        if (comp[v] == -1) {
            var head: Int64 = 0
            var tail: Int64 = 0
            q[tail] = v
            tail += 1
            comp[v] = k
            col[v] = 0
            var cnt0: Int64 = 1
            var cnt1: Int64 = 0
            while (head < tail) {
                let x = q[head]
                head += 1
                for (y in adj[x]) {
                    if (comp[y] == -1) {
                        comp[y] = k
                        if (col[x] == 0) {
                            col[y] = 1
                            cnt1 += 1
                        } else {
                            col[y] = 0
                            cnt0 += 1
                        }
                        q[tail] = y
                        tail += 1
                    } else if (col[y] == col[x]) {
                        ok = false
                    }
                }
            }
            c0[k] = cnt0
            c1[k] = cnt1
            k += 1
        }
        v += 1
    }
    // 统计每个分量内部的边数
    var jj: Int64 = 0
    while (jj < m) {
        cm[comp[eu[jj]]] += 1
        jj += 1
    }
    var ans: Int64 = 0
    if (!ok || k > 3) {
        ans = 0
    } else if (k == 1) {
        // 加两条边都要异色且不重复：C(g, 2)，g = a*b - m
        let g = (c0[0] * c1[0] - m) % MOD
        ans = g * ((g - 1 + MOD) % MOD) % MOD * inv2 % MOD
    } else if (k == 2) {
        let aA = c0[0]
        let bA = c1[0]
        let aB = c0[1]
        let bB = c1[1]
        let cross = ((aA + bA) % MOD) * ((aB + bB) % MOD) % MOD
        // 两条都跨分量时需 color(u)^color(v) 相同
        let t0 = (aA * aB + bA * bB) % MOD
        let t1 = (aA * bB + bA * aB) % MOD
        let gA = (aA * bA - cm[0]) % MOD
        let gB = (aB * bB - cm[1]) % MOD
        ans = cross * ((gA + gB) % MOD) % MOD
        ans = (ans + t0 * ((t0 - 1 + MOD) % MOD) % MOD * inv2) % MOD
        ans = (ans + t1 * ((t1 - 1 + MOD) % MOD) % MOD * inv2) % MOD
    } else {
        // 三条边连通 3 个分量必须构成一棵覆盖三者的树
        let sA = (c0[0] + c1[0]) % MOD
        let sB = (c0[1] + c1[1]) % MOD
        let sC = (c0[2] + c1[2]) % MOD
        ans = sA * sB % MOD * sC % MOD * ((sA + sB + sC) % MOD) % MOD
    }
    println(ans)
    return 0
}
```
