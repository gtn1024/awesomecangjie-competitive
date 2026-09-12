---
oj: dmy
pid: '424'
title: '[R68D] 树的高度'
difficulty: 普及/提高-
tags:
  - 树
  - 树上 DP
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le h_i \le 10^9$。

## 思路

要求任意祖先 $u$ 与后代 $v$（$u \ne v$）满足 $h_u > h_v$。由于高度关系具有传递性，只要**每条边**都满足父节点高度大于子节点高度，任意祖先—后代对就自动满足；反过来，祖先—后代对包含父子边，所以约束等价于：对树上每条边 $(u, v)$（$v$ 是 $u$ 的儿子），$h_u > h_v$。

高度只能增加，设 $f(u)$ 为 $u$ 最终需要达到的最小高度。叶子没有儿子，直接取 $f(u) = h_u$；内部节点 $u$ 要同时高过所有儿子，故

$$f(u) = \max\left(h_u,\ \max_{v \in \text{son}(u)}(f(v) + 1)\right)$$

自底向上（后序）算一遍即可，答案即 $\sum_u (f(u) - h_u)$，累加过程中无需额外数组存 $f$：处理节点 $u$ 时，用 $g(u)$ 记录儿子们贡献的 $\max(f(v)+1)$，则 $f(u) = \max(h_u, g(u))$，算完后用 $f(u)+1$ 去更新父亲的 $g$。

树是链时 $f$ 最大约为 $10^9 + n$，答案最大约 $n^2/2 \approx 2 \times 10^{10}$，用 `Int64`。

实现上用迭代 DFS 求先序序列（避免 $2 \times 10^5$ 深度的递归爆栈），先序序列的逆序就是合法的后序处理顺序——先序中父节点总在子孙之前，逆序时子孙先被处理。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let h = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let adj = Array<ArrayList<Int64>>(n + 1, { _ => ArrayList<Int64>() })
    for (_ in 1..n) {
        let e = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = e[0]
        let v = e[1]
        adj[u].add(v)
        adj[v].add(u)
    }
    // 迭代 DFS 得到先序序列（避免递归爆栈）
    let parent = Array<Int64>(n + 1, { _ => 0 })
    let order = ArrayList<Int64>()
    let stack = ArrayList<Int64>()
    stack.add(1)
    while (stack.size > 0) {
        let u = stack.remove(at: stack.size - 1)
        order.add(u)
        for (v in adj[u]) {
            if (v != parent[u]) {
                parent[v] = u
                stack.add(v)
            }
        }
    }
    // 逆先序即合法的后序处理顺序：g[u] 存 max(儿子最终高度 + 1)
    let g = Array<Int64>(n + 1, { _ => 0 })
    var ans: Int64 = 0
    var i = order.size - 1
    while (i >= 0) {
        let u = order[i]
        var fu = h[u - 1]
        if (g[u] > fu) {
            fu = g[u]
        }
        ans += fu - h[u - 1]
        if (u != 1) {
            let p = parent[u]
            let t = fu + 1
            if (t > g[p]) {
                g[p] = t
            }
        }
        i -= 1
    }
    println(ans)
}
```
