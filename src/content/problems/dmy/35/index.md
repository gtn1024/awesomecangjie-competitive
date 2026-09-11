---
oj: dmy
pid: '35'
title: '[R6E] 树上求和'
difficulty: 入门
tags:
  - 树
  - 换根 DP
timeLimit: 1s
memoryLimit: 512m
---

## 思路

先以 1 为根做一次 DFS：维护每个节点的深度（到根距离）`dist`、子树权值和 `sum`，并算出根节点的答案 $ans_1 = \sum a_i \times dist_i$。

换根转移：设 $x$ 是 $y$ 的父节点，边权为 $w$，把根从 $x$ 换到 $y$ 时，$y$ 子树内的节点（权值和 $sum[y]$）到根的距离减少 $w$，其余节点（权值和 $total - sum[y]$）到根的距离增加 $w$，因此

$$ans_y = ans_x + w \times (total - sum[y]) - w \times sum[y]$$

再做一次 DFS 按上式递推所有节点的答案。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.collection.*
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let adjTo = Array<ArrayList<Int64>>(n, { _ => ArrayList<Int64>() })
    let adjW = Array<ArrayList<Int64>>(n, { _ => ArrayList<Int64>() })
    for (_ in 0..(n - 1)) {
        let l = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let u = l[0] - 1
        let v = l[1] - 1
        adjTo[u].add(v)
        adjW[u].add(l[2])
        adjTo[v].add(u)
        adjW[v].add(l[2])
    }
    let parent = Array<Int64>(n, { _ => -1 })
    let dist = Array<Int64>(n, { _ => 0 })
    let sum = Array<Int64>(n, { i => a[i] })
    let order = ArrayList<Int64>()
    var ans1: Int64 = 0
    let stack = ArrayList<Int64>()
    stack.add(0)
    parent[0] = -2
    while (stack.size > 0) {
        let u = stack[Int64(stack.size) - 1]
        stack.remove(at: Int64(stack.size) - 1)
        order.add(u)
        ans1 += a[u] * dist[u]
        let sz = Int64(adjTo[u].size)
        for (i in 0..sz) {
            let v = adjTo[u][i]
            if (parent[v] == -1) {
                parent[v] = u
                dist[v] = dist[u] + adjW[u][i]
                stack.add(v)
            }
        }
    }
    // 子树权值和（按遍历逆序累加到父节点）
    var oi = Int64(order.size) - 1
    while (oi >= 0) {
        let u = order[oi]
        if (parent[u] >= 0) {
            sum[parent[u]] += sum[u]
        }
        oi -= 1
    }
    // 换根 DP
    let total = sum[0]
    let ans = Array<Int64>(n, { _ => 0 })
    ans[0] = ans1
    let stack2 = ArrayList<Int64>()
    stack2.add(0)
    while (stack2.size > 0) {
        let u = stack2[Int64(stack2.size) - 1]
        stack2.remove(at: Int64(stack2.size) - 1)
        let sz = Int64(adjTo[u].size)
        for (i in 0..sz) {
            let v = adjTo[u][i]
            if (parent[v] == u) {
                let w = adjW[u][i]
                ans[v] = ans[u] + w * (total - 2 * sum[v])
                stack2.add(v)
            }
        }
    }
    for (u in 0..n) {
        println(ans[u])
    }
}
```
