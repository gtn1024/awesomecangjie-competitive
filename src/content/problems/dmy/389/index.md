---
oj: dmy
pid: '389'
title: '[R62E] 树'
difficulty: 普及+/提高
tags:
  - 树形 DP
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$c_i \in \{0, 1\}$，保证输入是一棵树。

## 思路

每条简单路径在它的**最高点（LCA）**处统计一次，这样每条路径恰好被统计一次。对每个结点 $u$ 维护三个状态，表示从 $u$ 出发向下的路径（包含单点路径 $u$ 自身）中，红色结点数量分别为 0、奇数、偶数且不少于 2 的条数，记为 $dp[u][0]$、$dp[u][1]$、$dp[u][2]$。

初始化：若 $c_u = 0$，则 $dp[u][0] = 1$；否则 $dp[u][1] = 1$。

合并儿子 $v$ 时，一条以 $u$ 为最高点的路径，由「已合并部分中的一条向下路径」和「子树 $v$ 中的一条向下路径」拼接而成（两条路径只相交于边 $u$–$v$，红点数直接相加）。要凑出偶数且不少于 2 的红点数，只有四种组合：

$$
dp[v][2] \times dp[u][0] + dp[v][2] \times dp[u][2] + dp[v][1] \times dp[u][1] + dp[v][0] \times dp[u][2]
$$

把这四项累加进答案，再把 $v$ 的路径接上 $u$ 并入状态。根据 $c_u$ 分类：

- $c_u = 1$：接上红色 $u$ 后奇偶性翻转，$dp[u][1] \mathrel{+}= dp[v][0] + dp[v][2]$，$dp[u][2] \mathrel{+}= dp[v][1]$；
- $c_u = 0$：奇偶性不变，$dp[u][0] \mathrel{+}= dp[v][0]$，$dp[u][1] \mathrel{+}= dp[v][1]$，$dp[u][2] \mathrel{+}= dp[v][2]$。

## 复杂度

每个结点及其每条边各被处理一次，时间复杂度 $O(n)$。

## 仓颉实现

树深可能达到 $2 \times 10^5$，递归会爆栈，实现中用**迭代 DFS** 求出遍历序，再按逆序合并子树。

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let cols = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let color = Array<Int64>(n + 1, { _ => 0 })
    for (i in 1..=n) {
        color[i] = cols[i - 1]
    }
    // 链式前向星存树
    let head = Array<Int64>(n + 1, { _ => -1 })
    let to = Array<Int64>(2 * n, { _ => 0 })
    let nxt = Array<Int64>(2 * n, { _ => 0 })
    var ec: Int64 = 0
    for (_ in 1..n) {
        let e = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = e[0]
        let v = e[1]
        to[ec] = v
        nxt[ec] = head[u]
        head[u] = ec
        ec += 1
        to[ec] = u
        nxt[ec] = head[v]
        head[v] = ec
        ec += 1
    }
    // 迭代 DFS 求父节点与遍历序（避免递归爆栈）
    let parent = Array<Int64>(n + 1, { _ => 0 })
    let st = Array<Int64>(n, { _ => 0 })
    let order = Array<Int64>(n, { _ => 0 })
    parent[1] = -1
    var top: Int64 = 1
    st[0] = 1
    var ocnt: Int64 = 0
    while (top > 0) {
        top -= 1
        let u = st[top]
        order[ocnt] = u
        ocnt += 1
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != parent[u]) {
                parent[v] = u
                st[top] = v
                top += 1
            }
            e = nxt[e]
        }
    }
    // 树形 DP：每条路径在其最高点（LCA）处统计
    // dp0：从 u 向下、红点数为 0 的路径数；dp1：红点数为奇数的路径数
    // dp2：红点数为偶数且不少于 2 的路径数（各自包含单点路径）
    let dp0 = Array<Int64>(n + 1, { _ => 0 })
    let dp1 = Array<Int64>(n + 1, { _ => 0 })
    let dp2 = Array<Int64>(n + 1, { _ => 0 })
    var ans: Int64 = 0
    var i = ocnt - 1
    while (i >= 0) {
        let u = order[i]
        var a0: Int64 = 0
        var a1: Int64 = 0
        var a2: Int64 = 0
        if (color[u] == 0) {
            a0 = 1
        } else {
            a1 = 1
        }
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != parent[u]) {
                let b0 = dp0[v]
                let b1 = dp1[v]
                let b2 = dp2[v]
                // 已合并部分与子树 v 中各取一条向下路径拼接，红点数为偶数且不少于 2
                ans += b2 * a0
                ans += b2 * a2
                ans += b1 * a1
                ans += b0 * a2
                // 把 v 的向下路径接上 u，并入 u 的状态
                if (color[u] == 0) {
                    a0 += b0
                    a1 += b1
                    a2 += b2
                } else {
                    a1 += b0 + b2
                    a2 += b1
                }
            }
            e = nxt[e]
        }
        dp0[u] = a0
        dp1[u] = a1
        dp2[u] = a2
        i -= 1
    }
    println(ans)
    return 0
}
```
