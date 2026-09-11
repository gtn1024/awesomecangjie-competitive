---
oj: dmy
pid: '101'
title: '[R17E]线路架设'
difficulty: 提高
tags:
  - 贪心
  - 树上倍增
timeLimit: 2s
memoryLimit: 512m
---

## 题目

给定一棵以 $1$ 为根的树，节点 $i$ 有权值 $a_i$。一条路径的**宽度**是路径上所有节点的最大权值减最小权值。若 $y$ 在以 $x$ 为根的子树中，且路径 $x\to y$ 的宽度不超过线路宽度 $w$，则可架设 $x$ 到 $y$ 的线路，该线路覆盖路径 $x\to y$ 上的所有节点。共有 $q$ 个查询，每个查询给出一个 $w$，求覆盖所有节点所需的最少线路数。

> 对于 $100\%$ 的数据，$1\le n\le 10^5$，$1\le q\le 20$，$1\le a_i\le 10^9$，$1\le w_i\le 10^9$。

## 思路

一条线路的起点 $x$ 必须是终点 $y$ 的祖先，因此线路是一段**垂直路径**（祖先到后代的链）。

**关键观察一**：任何线路都可以向上延伸而不变差。若一条线路目前从某点延伸到祖先 $t$，且再向上一个节点后宽度仍不超过 $w$，那么延伸后覆盖的节点只会更多，线路数量不变。所以最优解中的每条线路都延伸到「最远可达祖先」。定义 $\text{top}(u)$ 为从 $u$ 出发向上走、整段路径宽度不超过 $w$ 所能到达的最高祖先（含 $u$ 自身）。路径越长宽度单调不减，故可达祖先是从 $u$ 向上的一段前缀，$\text{top}(u)$ 可以用**树上倍增**求出：预处理每个节点向上 $2^k$ 步所经过节点中的最大、最小权值，每次查询对每个节点按 $k$ 从大到小贪心跳跃即可。

**关键观察二**：按深度从大到小处理节点（子树内节点先于祖先处理）。节点 $u$ 若没有被子树中任何已开始的线路覆盖，就必须在 $u$ 处新开一条线路（起点为 $u$，向上延伸到 $\text{top}(u)$）；否则 $u$ 已被覆盖，无需新开。各条线路互不影响，能延伸就延伸，所以这个贪心是最优的。

具体实现时，不需要分别记录每条线路，只需维护

$$
m(u)=\min\{\text{depth}(\text{top}(g)) \mid g\text{ 是 }u\text{ 子树中已开始的线路起点}\}.
$$

若 $\min_{c\text{ 为 }u\text{ 的子节点}} m(c) > \text{depth}(u)$，说明没有线路能到达 $u$，答案加一，并令 $m(u)=\text{depth}(\text{top}(u))$；否则令 $m(u)$ 等于该最小值。叶子节点没有子节点，必然新开线路。

## 复杂度

- 时间复杂度：$O(q\cdot n\log n)$，其中 $q\le 20$，每轮查询对每个节点做 $O(\log n)$ 次倍增跳跃。
- 空间复杂度：$O(n\log n)$，存储倍增表。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main(): Int64 {
    let reader = getStdIn()
    let nq = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = nq[0]
    let q = nq[1]

    let av = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let a = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 1..(nn + 1)) {
        a[i] = av[i - 1]
    }

    let adj = Array<ArrayList<Int64>>(nn + 1, { _ => ArrayList<Int64>() })
    for (i in 1..nn) {
        let uv = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = uv[0]
        let v = uv[1]
        adj[u].add(v)
        adj[v].add(u)
    }

    // root the tree at 1: parent, depth, children, preorder list
    let parent = Array<Int64>(nn + 1, { _ => 0 })
    let depth = Array<Int64>(nn + 1, { _ => 0 })
    let children = Array<ArrayList<Int64>>(nn + 1, { _ => ArrayList<Int64>() })
    let order = Array<Int64>(nn + 1, { _ => 0 })
    var cnt = 0
    let st = Array<Int64>(nn + 1, { _ => 0 })
    var stp = 0
    st[stp] = 1
    stp += 1
    while (stp > 0) {
        stp -= 1
        let u = st[stp]
        order[cnt] = u
        cnt += 1
        for (v in adj[u]) {
            if (v != parent[u]) {
                parent[v] = u
                depth[v] = depth[u] + 1
                children[u].add(v)
                st[stp] = v
                stp += 1
            }
        }
    }

    // binary lifting: up[k][u] = 2^k-th ancestor, mx/mn[k][u] = max/min weight on chain u..up[k][u]
    let LOG = 18
    let up = Array<Array<Int64>>(LOG, { _ => Array<Int64>(nn + 1, { _ => 0 }) })
    let mx = Array<Array<Int64>>(LOG, { _ => Array<Int64>(nn + 1, { _ => 0 }) })
    let mn = Array<Array<Int64>>(LOG, { _ => Array<Int64>(nn + 1, { _ => 0 }) })
    for (u in 2..(nn + 1)) {
        let p = parent[u]
        up[0][u] = p
        mx[0][u] = if (a[u] > a[p]) { a[u] } else { a[p] }
        mn[0][u] = if (a[u] < a[p]) { a[u] } else { a[p] }
    }
    for (k in 1..LOG) {
        for (u in 1..(nn + 1)) {
            let mid = up[k - 1][u]
            up[k][u] = up[k - 1][mid]
            let mxu = mx[k - 1][u]
            let mxm = mx[k - 1][mid]
            mx[k][u] = if (mxu > mxm) { mxu } else { mxm }
            let mnu = mn[k - 1][u]
            let mnm = mn[k - 1][mid]
            mn[k][u] = if (mnu < mnm) { mnu } else { mnm }
        }
    }

    let top = Array<Int64>(nn + 1, { _ => 0 })
    let m = Array<Int64>(nn + 1, { _ => 0 })
    for (qi in 0..q) {
        let w = Int64.parse(reader.readln().getOrThrow())

        // top[u] = highest ancestor reachable from u with chain width <= w
        for (u in 1..(nn + 1)) {
            var cur = u
            var lo = a[u]
            var hi = a[u]
            var k = LOG - 1
            while (k >= 0) {
                let v = up[k][cur]
                if (v != 0) {
                    let mni = mn[k][cur]
                    let nlo = if (mni < lo) { mni } else { lo }
                    let mxi = mx[k][cur]
                    let nhi = if (mxi > hi) { mxi } else { hi }
                    if (nhi - nlo <= w) {
                        cur = v
                        lo = nlo
                        hi = nhi
                    }
                }
                k -= 1
            }
            top[u] = cur
        }

        // greedy bottom-up: node u starts a new line iff no line from its subtree reaches u
        var ans: Int64 = 0
        var i = cnt - 1
        while (i >= 0) {
            let u = order[i]
            var mm: Int64 = 1000000000000
            for (c in children[u]) {
                if (m[c] < mm) {
                    mm = m[c]
                }
            }
            if (mm > depth[u]) {
                ans += 1
                m[u] = depth[top[u]]
            } else {
                m[u] = mm
            }
            i -= 1
        }
        println(ans)
    }
    return 0
}
```
