---
oj: dmy
pid: '158'
title: '[R26E]树上三元组'
difficulty: 普及/提高-
tags:
  - 树
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定一棵 $n$ 个节点的树，统计三元组 $(u, v, w)$ 的数量：$u, v, w$ 互不相同、$u < v$，且 $w$ 不在 $u$ 到 $v$ 的简单路径上（路径包含端点）。

> 数据规模：$2 \le n \le 5 \times 10^5$。

## 思路

对固定点对 $(u, v)$，路径上有 $\text{dist}(u, v) + 1$ 个节点，所以不在路径上的候选 $w$ 有 $n - \text{dist}(u, v) - 1$ 个。答案即

$$
\sum_{\{u,v\}}\left(n-1-\text{dist}(u,v)\right)
= (n-1)\binom{n}{2}-\sum_{\{u,v\}}\text{dist}(u,v)
$$

而 $\sum_{\{u,v\}}\text{dist}(u,v)$ 是所有点对距离之和，是经典结论：**每条边对和的贡献等于其两端子树大小之积 $s \cdot (n-s)$**，因为恰好有 $s(n-s)$ 个点对的路径经过该边。

于是任取根（如 $1$）做一次 BFS 得到遍历序，再按逆序累加子树大小，对每个非根节点 $x$（子树大小为 $s_x$，父边即对应割边）累加 $s_x \cdot (n-s_x)$ 即可。注意 $n$ 最大 $5 \times 10^5$，递归 DFS 可能爆栈，且距离和最大约 $2 \times 10^{16}$，需要用 64 位整数。

## 复杂度

$O(n)$ 时间，$O(n)$ 空间。

## 代码

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let m = n - 1
    var head = Array<Int64>(n + 1, { _ => -1 })
    let to = Array<Int64>(2 * m, { _ => 0 })
    let nxt = Array<Int64>(2 * m, { _ => 0 })
    var ec: Int64 = 0
    var ei: Int64 = 0
    while (ei < m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = line[0]
        let v = line[1]
        to[ec] = v
        nxt[ec] = head[u]
        head[u] = ec
        ec += 1
        to[ec] = u
        nxt[ec] = head[v]
        head[v] = ec
        ec += 1
        ei += 1
    }
    var order = Array<Int64>(n, { _ => 0 })
    var parent = Array<Int64>(n + 1, { _ => 0 })
    let q = Array<Int64>(n, { _ => 0 })
    var qh: Int64 = 0
    var qt: Int64 = 0
    q[qt] = 1
    qt += 1
    parent[1] = -1
    var oc: Int64 = 0
    while (qh < qt) {
        let u = q[qh]
        qh += 1
        order[oc] = u
        oc += 1
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != parent[u]) {
                parent[v] = u
                q[qt] = v
                qt += 1
            }
            e = nxt[e]
        }
    }
    var sz = Array<Int64>(n + 1, { _ => 1 })
    var sumDist: Int64 = 0
    var idx: Int64 = n - 1
    while (idx >= 1) {
        let u = order[idx]
        let s = sz[u]
        sumDist += s * (n - s)
        sz[parent[u]] += s
        idx -= 1
    }
    let pairs = n * (n - 1) / 2
    let ans = pairs * (n - 1) - sumDist
    println(ans)
}
```

</details>
