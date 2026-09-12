---
oj: dmy
pid: '195'
title: '[R32D]还原树'
difficulty: 提高
tags:
  - 树
  - LCA
timeLimit: 1s
memoryLimit: 512m
---

## 题意

给定一棵 $n$ 个节点（编号 $1\sim n$）有根树的 $n\times n$ LCA 矩阵 $L$，其中 $L_{i,j}$ 表示节点 $i$ 与节点 $j$ 的最近公共祖先。要求还原出每个节点的父亲，根节点的父亲记为 $-1$。保证矩阵合法且树唯一。$1\le n\le 1000$。

## 思路

这是一道纯粹的 LCA 矩阵分析题，核心是把「祖先/深度」这些树上的结构信息用矩阵 $L$ 显式表达出来。

**关键观察：怎样用 $L$ 判断一个节点是否是另一个节点的祖先？**

按定义，$w$ 是 $u$ 的祖先，当且仅当 $u$ 与 $w$ 的 LCA 仍然是 $w$（因为 $w$ 本身就是 $u$ 与 $w$ 的共同祖先，且是它们中深度最大的那个）。即：

$$
w\text{ 是 }u\text{ 的祖先}\iff L_{w,u}=w
$$

注意每个节点也是自己的祖先，所以 $L_{u,u}=u$ 恒成立。

**第一步：求每个节点的深度。**

一个节点的真祖先（包括自己）的数量，等于它在矩阵第 $u$ 列中满足 $L_{w,u}=w$ 的 $w$ 的个数。若根深度记为 $0$，则：

$$
\text{depth}[u]=\bigl|\{\,w: L_{w,u}=w\,\}\bigr|-1
$$

对每个 $u$ 扫一遍所有 $w$ 即可，复杂度 $O(n^2)$。

**第二步：求每个节点的父亲。**

节点 $u$ 的父亲，就是它的所有真祖先中深度最大的那个，也就是深度恰好为 $\text{depth}[u]-1$ 的那个祖先。于是只要在满足 $L_{w,u}=w$ 的 $w$ 中找出 $\text{depth}[w]=\text{depth}[u]-1$ 的那个即可。根节点深度为 $0$，其父亲记为 $-1$。

整个算法是 $O(n^2)$ 的，对 $n\le 1000$ 完全够用。

## 代码

```cangjie
import std.convert.*
import std.console.*

main() {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n

    // 读取 LCA 矩阵，L[i][j] 为节点 (i+1) 与 (j+1) 的 LCA 编号（1..n）
    let L = Array<Array<Int64>>(nn, { _ =>
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    })

    // depth[u] = u 的真祖先是 u 的祖先的节点数（含自身）减 1
    // w 是 u 的祖先当且仅当 L[w][u] == w+1
    var depth = Array<Int64>(nn, { _ => 0 })
    for (u in 0 .. nn) {
        var cnt = 0
        for (w in 0 .. nn) {
            if (L[w][u] == w + 1) {
                cnt += 1
            }
        }
        depth[u] = Int64(cnt) - 1
    }

    // 父亲 = u 的祖先中深度恰好为 depth[u]-1 的那个
    var parent = Array<Int64>(nn, { _ => -1 })
    for (u in 0 .. nn) {
        if (depth[u] == 0) {
            parent[u] = -1
            continue
        }
        let targetDepth = depth[u] - 1
        for (w in 0 .. nn) {
            if (L[w][u] == w + 1 && depth[w] == targetDepth) {
                parent[u] = w + 1
                break
            }
        }
    }

    for (i in 0 .. nn) {
        if (i > 0) {
            print(" ")
        }
        print(parent[i])
    }
    println()
}
```
