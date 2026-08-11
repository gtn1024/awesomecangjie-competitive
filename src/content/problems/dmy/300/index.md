---
oj: dmy
pid: '300'
title: '[R48E]采集果子'
difficulty: 提高
tags:
  - 树
  - 树形 DP
  - 二分答案
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le m \le n \le 5 \times 10^5$，$1 \le k \le 10^{15}$，$1 \le a_i \le 10^9$。

## 思路

二分采集体力 $h$。高度不超过 $h$ 的节点恰好组成一棵包含根的子树，需要判断在这棵子树中最多能采集多少果子。

为了让采集数量最大，只要决定使用某个节点，就可以取走该节点的全部果子。对于树边 $(u,v)$，当 $u,v$ 中至少一个是变异节点时，两端不能同时使用；如果两端都不是变异节点，则可以同时使用。因此，固定 $h$ 后可以用树形 DP 求最大采集数量。

设：

- $f_{u,0}$ 表示不使用节点 $u$ 时，$u$ 子树内最多能采集的果子数；
- $f_{u,1}$ 表示使用节点 $u$ 时，$u$ 子树内最多能采集的果子数。

初始有 $f_{u,0}=0$、$f_{u,1}=a_u$。对于 $u$ 的儿子 $v$：

$$
f_{u,0} \mathrel{+}= \max(f_{v,0},f_{v,1})
$$

若 $u$ 或 $v$ 是变异节点，则使用 $u$ 时只能不使用 $v$：

$$
f_{u,1} \mathrel{+}= f_{v,0}
$$

否则这条边没有限制：

$$
f_{u,1} \mathrel{+}= \max(f_{v,0},f_{v,1})
$$

先按广度优先顺序保存所有节点，此时节点高度单调不降。检查某个 $h$ 时，高度不超过 $h$ 的节点构成该顺序的一个前缀，将此前缀逆序处理即可完成 DP。

若体力为 $h$ 时能采集至少 $k$ 个果子，那么更大的体力也一定可行，因此可以二分最小可行的 $h$。如果整棵树的最大采集数量仍小于 $k$，答案为 $-1$。

## 复杂度

时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

func canCollect(
    limit: Int32,
    n: Int64,
    k: Int64,
    order: Array<Int32>,
    parent: Array<Int32>,
    depth: Array<Int32>,
    fruit: Array<Int64>,
    mutant: Array<Bool>,
    dp0: Array<Int64>,
    dp1: Array<Int64>
): Bool {
    var count: Int64 = 0
    while (count < n) {
        let u = Int64(order[count])
        if (depth[u] > limit) {
            break
        }
        dp0[u] = 0
        dp1[u] = fruit[u - 1]
        count += 1
    }

    var i = count - 1
    while (i > 0) {
        let u = Int64(order[i])
        let p = Int64(parent[u])
        let best = if (dp0[u] > dp1[u]) { dp0[u] } else { dp1[u] }
        dp0[p] += best
        if (mutant[p] || mutant[u]) {
            dp1[p] += dp0[u]
        } else {
            dp1[p] += best
        }
        i -= 1
    }

    let rootBest = if (dp0[1] > dp1[1]) { dp0[1] } else { dp1[1] }
    return rootBest >= k
}

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let k = first[2]

    let head = Array<Int32>(n + 1, { _ => 0 })
    let to = Array<Int32>(2 * n, { _ => 0 })
    let next = Array<Int32>(2 * n, { _ => 0 })
    var edgeCount: Int64 = 1
    for (_ in 1..n) {
        let edge = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = edge[0]
        let v = edge[1]
        to[edgeCount] = Int32(v)
        next[edgeCount] = head[u]
        head[u] = Int32(edgeCount)
        edgeCount += 1
        to[edgeCount] = Int32(u)
        next[edgeCount] = head[v]
        head[v] = Int32(edgeCount)
        edgeCount += 1
    }

    let fruit = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let mutantNodes = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let mutant = Array<Bool>(n + 1, { _ => false })
    for (i in 0..m) {
        mutant[mutantNodes[i]] = true
    }

    let parent = Array<Int32>(n + 1, { _ => 0 })
    let depth = Array<Int32>(n + 1, { _ => 0 })
    let order = Array<Int32>(n, { _ => 0 })
    order[0] = 1
    depth[1] = 1
    var count: Int64 = 1
    var index: Int64 = 0
    var maxDepth: Int32 = 1
    while (index < count) {
        let u = Int64(order[index])
        var e = Int64(head[u])
        while (e != 0) {
            let v = Int64(to[e])
            if (v != Int64(parent[u])) {
                parent[v] = Int32(u)
                depth[v] = depth[u] + 1
                if (depth[v] > maxDepth) {
                    maxDepth = depth[v]
                }
                order[count] = Int32(v)
                count += 1
            }
            e = Int64(next[e])
        }
        index += 1
    }

    let dp0 = Array<Int64>(n + 1, { _ => 0 })
    let dp1 = Array<Int64>(n + 1, { _ => 0 })
    if (!canCollect(maxDepth, n, k, order, parent, depth, fruit, mutant, dp0, dp1)) {
        println("-1")
        return 0
    }

    var left: Int32 = 1
    var right = maxDepth
    while (left < right) {
        let mid = left + (right - left) / 2
        if (canCollect(mid, n, k, order, parent, depth, fruit, mutant, dp0, dp1)) {
            right = mid
        } else {
            left = mid + 1
        }
    }
    println(left.toString())
    return 0
}
```
