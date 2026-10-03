---
oj: dmy
pid: '442'
title: '[R71D] 择邻定向'
difficulty: 普及-
tags:
  - 图论
  - 连通分量
  - 构造
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n, m \le 2 \times 10^5$，无自环与重边，每个点度至少为 $1$。

## 思路

每个中继站恰有一个转发目标，因此整个网络形成一张**函数图**（每个点出度为 $1$ 的有向图）。函数图有一个性质：沿着出边一直走必然会进入一个环，且每个弱连通分量中恰好存在一个环。不稳定中继站就是环上的点，所以答案等于所有分量环长之和。

由于不存在自环，每个分量中环长至少为 $2$。另一方面，任意连通分量都能做到环长为 $2$：任取一条边 $(s, y)$，令 $p_s = y$、$p_y = s$ 构成二元环；再对分量做一次 DFS，其余每个点指向 DFS 树上的父节点，所有路径都会汇入 $s \to y \to s$，不会产生新的环。

因此最小不稳定数就是 $2 \times$ 连通分量数，构造方案即每个分量一个二元环加一棵指向环的 DFS 树。

## 复杂度

时间 $O(n + m)$，空间 $O(n + m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line0[0]
    let m = line0[1]

    let adj = Array<ArrayList<Int64>>(n + 1, { _ => ArrayList<Int64>() })
    for (_ in 0..m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let u = Int64.parse(line[0])
        let v = Int64.parse(line[1])
        adj[u].add(v)
        adj[v].add(u)
    }

    var p = Array<Int64>(n + 1, { _ => 0 })
    var vis = Array<Bool>(n + 1, { _ => false })
    var comps: Int64 = 0
    var st = Array<Int64>(n + 1, { _ => 0 })
    var top: Int64 = 0

    for (s in 1..=n) {
        if (vis[s]) {
            continue
        }
        comps += 1
        let y = adj[s].get(0).getOrThrow()
        p[s] = y
        vis[s] = true
        st[0] = s
        top = 1
        while (top > 0) {
            top -= 1
            let u = st[top]
            for (w in adj[u]) {
                if (!vis[w]) {
                    vis[w] = true
                    p[w] = u
                    st[top] = w
                    top += 1
                }
            }
        }
    }

    println(2 * comps)
    for (i in 1..=n) {
        print(p[i])
        if (i < n) {
            print(" ")
        }
    }
    println()
}
```

</details>
