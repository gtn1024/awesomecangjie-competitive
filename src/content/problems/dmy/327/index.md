---
oj: dmy
pid: '327'
title: '[R52F] RECALL'
difficulty: 提高
tags:
  - 树形动态规划
  - 组合计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2 \times 10^5$，$2 \le k \le 10^9$。

## 思路

利用贡献的可加性，固定一个点数为奇数的连通点集 $C$，计算它成为一个单色连通块的染色方案数。

记 $|C|=s$，与 $C$ 相邻但不属于 $C$ 的点数为 $b$。先从 $k$ 种颜色中选择 $C$ 的颜色。为了使 $C$ 恰好成为一个完整的单色连通块，边界上的 $b$ 个点都不能使用该颜色，各有 $k-1$ 种选择；剩余的 $n-s-b$ 个点可以任意染色。因此，$C$ 的贡献为

$$
k(k-1)^b k^{n-s-b}。
$$

由于原图是一棵树，同一个边界点不可能与 $C$ 中的两个点相邻，否则会形成环。所以这里的边界点数也等于从 $C$ 连向外部的边数。

令

$$
x=k^{-1},\qquad y=(k-1)k^{-1}。
$$

则上述贡献可以写成

$$
k^{n+1}x^{|C|}y^b。
$$

于是，只需计算所有奇数大小连通点集的权值和 $x^{|C|}y^b$，最后再乘 $k^{n+1}$。

把树根设为 $1$。每个连通点集都有唯一的最高点，可以在这个最高点处统计它。定义：

- $E_u$：完全位于 $u$ 的子树内、包含 $u$、大小为偶数的连通点集的权值和；
- $O_u$：完全位于 $u$ 的子树内、包含 $u$、大小为奇数的连通点集的权值和。

状态中的边界只统计通向儿子方向的边，通向父亲的边稍后处理。开始时只选择 $u$，所以 $(E,O)=(0,x)$。

考虑合并儿子 $v$：

- 不选择 $v$ 子树中的任何点，此时 $v$ 是一个边界点，权值乘 $y$；
- 选择 $v$ 子树中的点。为了保持连通，所选部分必须包含 $v$，其贡献正是 $(E_v,O_v)$。

因此，儿子 $v$ 对偶数、奇数大小的贡献分别是 $y+E_v$ 和 $O_v$。设合并前的状态为 $(E,O)$，则

$$
\begin{aligned}
E'&=E(y+E_v)+O\cdot O_v,\\
O'&=O(y+E_v)+E\cdot O_v。
\end{aligned}
$$

所有儿子合并完毕后，就得到 $(E_u,O_u)$。若 $u=1$，以 $u$ 为最高点的奇数连通点集贡献为 $O_u$；否则父节点不在点集中，是一个额外的边界点，贡献为 $yO_u$。

将所有节点的这部分贡献相加，再乘 $k^{n+1}$ 即为答案。使用迭代 DFS 求出遍历序并逆序进行 DP，避免递归层数过深。

复杂度：时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

let MOD: Int64 = 1000000007

func power(base0: Int64, exponent0: Int64): Int64 {
    var base = base0
    var exponent = exponent0
    var result: Int64 = 1
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = result * base % MOD
        }
        base = base * base % MOD
        exponent /= 2
    }
    return result
}

main(): Int64 {
    let reader = getStdIn()
    let input = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = input[0]
    let k = input[1]

    let head = Array<Int64>(n + 1, { _ => -1 })
    let to = Array<Int64>(2 * n, { _ => 0 })
    let next = Array<Int64>(2 * n, { _ => 0 })
    var edgeCount: Int64 = 0
    for (_ in 1..n) {
        let edge = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = edge[0]
        let v = edge[1]
        to[edgeCount] = v
        next[edgeCount] = head[u]
        head[u] = edgeCount
        edgeCount += 1
        to[edgeCount] = u
        next[edgeCount] = head[v]
        head[v] = edgeCount
        edgeCount += 1
    }

    let parent = Array<Int64>(n + 1, { _ => 0 })
    let stack = Array<Int64>(n, { _ => 0 })
    let order = Array<Int64>(n, { _ => 0 })
    parent[1] = -1
    stack[0] = 1
    var stackSize: Int64 = 1
    var orderSize: Int64 = 0
    while (stackSize > 0) {
        stackSize -= 1
        let u = stack[stackSize]
        order[orderSize] = u
        orderSize += 1
        var edge = head[u]
        while (edge != -1) {
            let v = to[edge]
            if (v != parent[u]) {
                parent[v] = u
                stack[stackSize] = v
                stackSize += 1
            }
            edge = next[edge]
        }
    }

    let inverseK = power(k, MOD - 2)
    let vertexWeight = inverseK
    let boundaryWeight = (k - 1) * inverseK % MOD
    let even = Array<Int64>(n + 1, { _ => 0 })
    let odd = Array<Int64>(n + 1, { _ => 0 })
    var connectedOddSum: Int64 = 0

    var i = orderSize - 1
    while (i >= 0) {
        let u = order[i]
        var currentEven: Int64 = 0
        var currentOdd = vertexWeight
        var edge = head[u]
        while (edge != -1) {
            let v = to[edge]
            if (v != parent[u]) {
                let factorEven = (boundaryWeight + even[v]) % MOD
                let factorOdd = odd[v]
                let newEven = (currentEven * factorEven + currentOdd * factorOdd) % MOD
                let newOdd = (currentEven * factorOdd + currentOdd * factorEven) % MOD
                currentEven = newEven
                currentOdd = newOdd
            }
            edge = next[edge]
        }
        even[u] = currentEven
        odd[u] = currentOdd
        if (u == 1) {
            connectedOddSum = (connectedOddSum + currentOdd) % MOD
        } else {
            connectedOddSum = (connectedOddSum + boundaryWeight * currentOdd) % MOD
        }
        i -= 1
    }

    let answer = power(k, n + 1) * connectedOddSum % MOD
    println(answer)
    return 0
}
```
