---
oj: dmy
pid: '474'
title: '[R76F] 信号分区'
difficulty: 提高+
tags:
  - 树形 DP
  - 动态规划
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，字符串 $c$ 长度为 $n$ 且只含 `0` 和 `1`，输入的 $n-1$ 条边构成一棵无向树。

## 思路

**第一步：把分区数换成「保留的边数」。** 断开两端模式不同的边后，剩下的是一片森林，每棵树的顶点恰好构成一个分区。若最终模式相同的边有 $S$ 条，则保留的边就是这些边，分区数为 $n - S$。于是目标变成让 $S$ 尽可能小。

**第二步：看一次翻转对每条边的效果。** 设被翻转的顶点集合就是所选路径的顶点集 $P$（可以为空）。对一条边 $e=(x,y)$：

- 若 $x,y$ 都被翻转或都未被翻转，两端模式是否相同不变；
- 若恰有一个端点被翻转，两端模式是否相同恰好取反。

记 $s_e = 1$ 表示边 $e$ 原来两端同色、$s_e = 0$ 表示异色，则 $e$ 对最终 $S$ 的贡献是

$$s_e + (1 - 2s_e)\,[\,e \text{ 恰有一个端点属于 } P\,].$$

令 $t_e = 1 - 2s_e$，即异色边 $t_e = 1$、同色边 $t_e = -1$。设 $E_0 = \sum_e s_e$ 为原树中的同色边条数，并称「恰有一个端点属于 $P$」的边为**被割边**，则

$$S = E_0 + \sum_{e \text{ 被割}} t_e .$$

问题化为：**选一条路径（可以为空），最小化被割边的 $t_e$ 之和** $C(P)$。

**第三步：把割边之和改写成与路径顶点有关的量。** 一条边被割，等价于它恰有一个端点在 $P$ 中，于是

$$\#\{\text{被割边}\} = \sum_{x \in P} \deg(x) - 2(|P| - 1).$$

定义 $g(x) = \sum_{e \ni x} t_e$，即与 $x$ 相连的所有边的 $t$ 值之和。路径上的每条内部边在 $\sum_{x\in P} g(x)$ 中被它的两个端点各算了一次，需要各扣掉一次，因此

$$C(P) = \sum_{x \in P} g(x) - 2\sum_{\text{路径内部边 } (x,y)} t_{xy}, \qquad C(\varnothing) = 0 .$$

**第四步：树形 DP 求最优路径。** 以 $1$ 为根，令 $dp[x]$ 表示**从 $x$ 出发、只向下走**的路径的最小 $C$ 值（只取 $x$ 一个点的路径也算在内），则

$$dp[x] = g(x) + \min\Big(0,\ \min_{y \text{ 为 } x \text{ 的儿子}} \big(dp[y] - 2t_{xy}\big)\Big).$$

任意一条路径在根意义下都有唯一最高点 $x$：单点路径由 $dp[x]$ 覆盖，其余路径在 $x$ 处由两条向下的臂拼成。所以再对每个 $x$ 取两个儿子中最小的两个 $dp[y] - 2t_{xy}$，加起来与 $g(x)$ 求和，就得到经过 $x$ 且 $x$ 为最高点的最优路径。所有候选值与 $0$ 取最小即为 $\min C$，答案为 $n - (E_0 + \min C)$。

树可能退化成链，不能递归深搜，因此先用显式队列 BFS 求出每个点的父亲和遍历序，再按遍历序倒着做上述 DP；每个点只需记录两个儿子的最优值，用一次扫描维护最小值与次小值即可。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) {
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) {
        gpos += 1
    }
    let col = Array<Int64>(n, { _ => 0 })
    var k: Int64 = 0
    while (k < n) {
        col[k] = Int64(gdata[gpos])
        gpos += 1
        k += 1
    }
    let m = n - 1
    let eu = Array<Int64>(m, { _ => 0 })
    let ev = Array<Int64>(m, { _ => 0 })
    let deg = Array<Int64>(n + 2, { _ => 0 })
    var i: Int64 = 0
    while (i < m) {
        let a = nextInt()
        let b = nextInt()
        eu[i] = a
        ev[i] = b
        deg[a] += 1
        deg[b] += 1
        i += 1
    }
    let start = Array<Int64>(n + 2, { _ => 0 })
    var v: Int64 = 2
    while (v <= n + 1) {
        start[v] = start[v - 1] + deg[v - 1]
        v += 1
    }
    let adj = Array<Int64>(2 * m, { _ => 0 })
    let pos = Array<Int64>(n + 2, { _ => 0 })
    var w: Int64 = 0
    while (w <= n + 1) {
        pos[w] = start[w]
        w += 1
    }
    i = 0
    while (i < m) {
        let a = eu[i]
        let b = ev[i]
        adj[pos[a]] = b
        pos[a] += 1
        adj[pos[b]] = a
        pos[b] += 1
        i += 1
    }
    let parent = Array<Int64>(n + 1, { _ => 0 })
    let order = Array<Int64>(n + 1, { _ => 0 })
    var qh: Int64 = 0
    var qt: Int64 = 1
    order[0] = 1
    while (qh < qt) {
        let cx = order[qh]
        qh += 1
        let pe = parent[cx]
        let ee = start[cx + 1]
        var e = start[cx]
        while (e < ee) {
            let y = adj[e]
            if (y != pe) {
                parent[y] = cx
                order[qt] = y
                qt += 1
            }
            e += 1
        }
    }
    let g = Array<Int64>(n + 1, { _ => 0 })
    var esame: Int64 = 0
    i = 0
    while (i < m) {
        let a = eu[i]
        let b = ev[i]
        if (col[a - 1] == col[b - 1]) {
            esame += 1
            g[a] -= 1
            g[b] -= 1
        } else {
            g[a] += 1
            g[b] += 1
        }
        i += 1
    }
    let INF: Int64 = 4000000000000
    let b1 = Array<Int64>(n + 1, { _ => INF })
    let b2 = Array<Int64>(n + 1, { _ => INF })
    let dp = Array<Int64>(n + 1, { _ => 0 })
    var best: Int64 = 0
    var idx = n - 1
    while (idx >= 0) {
        let cx = order[idx]
        let s1 = b1[cx]
        var add: Int64 = 0
        if (s1 < 0) {
            add = s1
        }
        dp[cx] = g[cx] + add
        if (dp[cx] < best) {
            best = dp[cx]
        }
        if (b2[cx] < INF) {
            let cand = g[cx] + b1[cx] + b2[cx]
            if (cand < best) {
                best = cand
            }
        }
        let pe = parent[cx]
        if (pe != 0) {
            var t: Int64 = 1
            if (col[pe - 1] == col[cx - 1]) {
                t = -1
            }
            let val = dp[cx] - 2 * t
            if (val < b1[pe]) {
                b2[pe] = b1[pe]
                b1[pe] = val
            } else if (val < b2[pe]) {
                b2[pe] = val
            }
        }
        idx -= 1
    }
    println(n - (esame + best))
}
```
