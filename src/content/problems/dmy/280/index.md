---
oj: dmy
pid: '280'
title: '[R45F]消失的沙威玛'
difficulty: 省选
tags:
  - 树
  - 重链剖分
  - 单调栈
  - 倍增
  - 贪心
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n,q \le 2 \times 10^5$，$1 \le a_i,w_i \le 10^6$。

## 思路

设一轮比赛的有向路径依次为 $v_1,v_2,\ldots,v_k$。

因为体力没有容量限制，也不会自然损失，所以结点 $v_i$ 消耗的每一点体力，都应该在此前经过的结点中价格最低处购买。于是经过 $v_i$ 时，对应的单位价格为

$$
m_i=\min_{1\le j\le i}a_{v_j},
$$

整条路径的答案就是

$$
\sum_{i=1}^{k}w_{v_i}m_i
$$

问题转化为：支持树上有向路径查询，求权值序列的前缀最小值与另一组权值的乘积和。

### 重链剖分

先对原树做重链剖分。一条从 $s$ 到 $t$ 的有向路径会被拆成 $O(\log n)$ 个重链区间：

- $s$ 一侧的区间按从下到上的方向立即处理；
- $t$ 一侧的区间先保存，最后逆序按从上到下的方向处理。

这样便能严格按照从 $s$ 到 $t$ 的顺序扫描这些区间。处理过程中只维护两个量：此前见过的最低价格 $p$，以及已经产生的费用。

### 单条重链上的前缀最小值

考虑重链中从上到下的一个序列。对每个位置 $x$，用单调栈求出右侧第一个价格严格小于 $a_x$ 的位置 $\operatorname{nxt}(x)$。

若从 $x$ 开始扫描，价格前缀最小值发生变化的位置恰好是

$$
x,\operatorname{nxt}(x),\operatorname{nxt}^{2}(x),\ldots
$$

因此，对每条跳边 $x\to y$，预处理从 $x$ 到 $y$ 之前这一段的费用；再维护沿跳边到链尾的后缀费用和。对 $\operatorname{nxt}$ 建倍增表后，可以在 $O(\log n)$ 时间内完成两件事：

1. 找到查询区间内最后一个前缀最小值位置 $m$；
2. 找到第一个价格严格小于当前最低价格 $p$ 的位置 $f$。

若 $p\le a_m$，整个区间都沿用价格 $p$。否则，$f$ 之前的所有体力消耗按 $p$ 计算，从 $f$ 开始的费用则由跳边费用和直接得到：

$$
p\sum_{x=l}^{f-1}w_x
+\bigl(C_f-C_m\bigr)
+a_m\sum_{x=m}^{r}w_x
$$

其中 $C_x$ 是从 $x$ 沿 $\operatorname{nxt}$ 跳到链尾的累计费用。重链上的区间权值和由前缀和 $O(1)$ 求出。

从下到上的查询完全对称：用单调栈求左侧第一个更低价格的位置 $\operatorname{pre}(x)$，并建立另一套跳表与累计费用。

每处理完一个重链区间，当前最低价格更新为该区间结束时的前缀最小值，然后继续处理下一个区间。

## 复杂度

预处理时间 $O(n\log n)$，每次查询时间 $O(\log^2 n)$；空间复杂度 $O(n\log n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

let LOG: Int64 = 19

func rangeWeight(left: Int64, right: Int64, prefixWeight: Array<Int64>): Int64 {
    if (left > right) {
        return 0
    }
    return prefixWeight[right + 1] - prefixWeight[left]
}

func processForward(
    left: Int64,
    right: Int64,
    state: Array<Int64>,
    nodeAt: Array<Int64>,
    position: Array<Int64>,
    price: Array<Int64>,
    basePrefixWeight: Array<Int64>,
    nextLower: Array<Int64>,
    jump: Array<Array<Int64>>,
    linkCost: Array<Int64>
): Unit {
    if (left == right) {
        let u = nodeAt[left]
        if (price[u] < state[0]) {
            state[0] = price[u]
        }
        state[1] += state[0] * rangeWeight(left, right, basePrefixWeight)
        return
    }

    let start = nodeAt[left]
    var last = start
    var level = LOG - 1
    while (level >= 0) {
        let candidate = jump[level][last]
        if (candidate != -1 && position[candidate] <= right) {
            last = candidate
        }
        level -= 1
    }

    if (state[0] <= price[last]) {
        state[1] += state[0] * rangeWeight(left, right, basePrefixWeight)
        return
    }

    var first = start
    if (price[start] >= state[0]) {
        var before = start
        level = LOG - 1
        while (level >= 0) {
            let candidate = jump[level][before]
            if (candidate != -1 && position[candidate] <= right && price[candidate] >= state[0]) {
                before = candidate
            }
            level -= 1
        }
        first = nextLower[before]
    }

    let firstPosition = position[first]
    state[1] += state[0] * rangeWeight(left, firstPosition - 1, basePrefixWeight)
    state[1] += linkCost[first] - linkCost[last]
    state[1] += price[last] * rangeWeight(position[last], right, basePrefixWeight)
    state[0] = price[last]
}

func processBackward(
    left: Int64,
    right: Int64,
    state: Array<Int64>,
    nodeAt: Array<Int64>,
    position: Array<Int64>,
    price: Array<Int64>,
    basePrefixWeight: Array<Int64>,
    previousLower: Array<Int64>,
    jump: Array<Array<Int64>>,
    linkCost: Array<Int64>
): Unit {
    if (left == right) {
        let u = nodeAt[left]
        if (price[u] < state[0]) {
            state[0] = price[u]
        }
        state[1] += state[0] * rangeWeight(left, right, basePrefixWeight)
        return
    }

    let start = nodeAt[right]
    var last = start
    var level = LOG - 1
    while (level >= 0) {
        let candidate = jump[level][last]
        if (candidate != -1 && position[candidate] >= left) {
            last = candidate
        }
        level -= 1
    }

    if (state[0] <= price[last]) {
        state[1] += state[0] * rangeWeight(left, right, basePrefixWeight)
        return
    }

    var first = start
    if (price[start] >= state[0]) {
        var before = start
        level = LOG - 1
        while (level >= 0) {
            let candidate = jump[level][before]
            if (candidate != -1 && position[candidate] >= left && price[candidate] >= state[0]) {
                before = candidate
            }
            level -= 1
        }
        first = previousLower[before]
    }

    let firstPosition = position[first]
    state[1] += state[0] * rangeWeight(firstPosition + 1, right, basePrefixWeight)
    state[1] += linkCost[first] - linkCost[last]
    state[1] += price[last] * rangeWeight(left, position[last], basePrefixWeight)
    state[0] = price[last]
}

main(): Int64 {
    let reader = getStdIn()
    let nq = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nq[0]
    let q = nq[1]
    let price = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let weight = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let graphHead = Array<Int64>(n, { _ => -1 })
    let edgeTo = Array<Int64>(2 * (n - 1), { _ => 0 })
    let edgeNext = Array<Int64>(2 * (n - 1), { _ => 0 })
    var edgeCount: Int64 = 0
    for (_ in 0..(n - 1)) {
        let uv = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = uv[0] - 1
        let v = uv[1] - 1
        edgeTo[edgeCount] = v
        edgeNext[edgeCount] = graphHead[u]
        graphHead[u] = edgeCount
        edgeCount += 1
        edgeTo[edgeCount] = u
        edgeNext[edgeCount] = graphHead[v]
        graphHead[v] = edgeCount
        edgeCount += 1
    }

    let parent = Array<Int64>(n, { _ => -1 })
    let depth = Array<Int64>(n, { _ => 0 })
    let prefixWeight = Array<Int64>(n, { _ => 0 })
    let order = Array<Int64>(n, { _ => 0 })
    let stack = Array<Int64>(n, { _ => 0 })
    var stackSize: Int64 = 1
    var orderSize: Int64 = 0
    stack[0] = 0
    parent[0] = 0
    prefixWeight[0] = weight[0]
    while (stackSize > 0) {
        stackSize -= 1
        let u = stack[stackSize]
        order[orderSize] = u
        orderSize += 1
        var edge = graphHead[u]
        while (edge != -1) {
            let v = edgeTo[edge]
            if (parent[v] == -1) {
                parent[v] = u
                depth[v] = depth[u] + 1
                prefixWeight[v] = prefixWeight[u] + weight[v]
                stack[stackSize] = v
                stackSize += 1
            }
            edge = edgeNext[edge]
        }
    }

    let subtreeSize = Array<Int64>(n, { _ => 1 })
    let heavyChild = Array<Int64>(n, { _ => -1 })
    var position = n - 1
    while (position >= 0) {
        let u = order[position]
        var bestSize: Int64 = 0
        var edge = graphHead[u]
        while (edge != -1) {
            let v = edgeTo[edge]
            if (parent[v] == u) {
                subtreeSize[u] += subtreeSize[v]
                if (subtreeSize[v] > bestSize) {
                    bestSize = subtreeSize[v]
                    heavyChild[u] = v
                }
            }
            edge = edgeNext[edge]
        }
        position -= 1
    }

    let chainHead = Array<Int64>(n, { _ => 0 })
    var i: Int64 = 0
    while (i < n) {
        if (i == 0 || heavyChild[parent[i]] != i) {
            var u = i
            while (u != -1) {
                chainHead[u] = i
                u = heavyChild[u]
            }
        }
        i += 1
    }

    let basePosition = Array<Int64>(n, { _ => 0 })
    let nodeAt = Array<Int64>(n, { _ => 0 })
    let chainEnd = Array<Int64>(n, { _ => -1 })
    var baseSize: Int64 = 0
    i = 0
    while (i < n) {
        if (i == 0 || heavyChild[parent[i]] != i) {
            var u = i
            while (u != -1) {
                basePosition[u] = baseSize
                nodeAt[baseSize] = u
                baseSize += 1
                u = heavyChild[u]
            }
            chainEnd[i] = baseSize - 1
        }
        i += 1
    }

    let basePrefixWeight = Array<Int64>(n + 1, { _ => 0 })
    i = 0
    while (i < n) {
        basePrefixWeight[i + 1] = basePrefixWeight[i] + weight[nodeAt[i]]
        i += 1
    }

    let nextLower = Array<Int64>(n, { _ => -1 })
    let previousLower = Array<Int64>(n, { _ => -1 })
    let rightLinkCost = Array<Int64>(n, { _ => 0 })
    let leftLinkCost = Array<Int64>(n, { _ => 0 })
    i = 0
    while (i < n) {
        if (chainEnd[i] != -1) {
            let left = basePosition[i]
            let right = chainEnd[i]
            stackSize = 0
            var p = right
            while (p >= left) {
                let u = nodeAt[p]
                while (stackSize > 0 && price[stack[stackSize - 1]] >= price[u]) {
                    stackSize -= 1
                }
                if (stackSize > 0) {
                    nextLower[u] = stack[stackSize - 1]
                }
                let boundary = if (nextLower[u] == -1) { right } else { basePosition[nextLower[u]] - 1 }
                rightLinkCost[u] = price[u] * rangeWeight(p, boundary, basePrefixWeight)
                if (nextLower[u] != -1) {
                    rightLinkCost[u] += rightLinkCost[nextLower[u]]
                }
                stack[stackSize] = u
                stackSize += 1
                p -= 1
            }

            stackSize = 0
            p = left
            while (p <= right) {
                let u = nodeAt[p]
                while (stackSize > 0 && price[stack[stackSize - 1]] >= price[u]) {
                    stackSize -= 1
                }
                if (stackSize > 0) {
                    previousLower[u] = stack[stackSize - 1]
                }
                let boundary = if (previousLower[u] == -1) { left } else { basePosition[previousLower[u]] + 1 }
                leftLinkCost[u] = price[u] * rangeWeight(boundary, p, basePrefixWeight)
                if (previousLower[u] != -1) {
                    leftLinkCost[u] += leftLinkCost[previousLower[u]]
                }
                stack[stackSize] = u
                stackSize += 1
                p += 1
            }
        }
        i += 1
    }

    let jumpRight = Array<Array<Int64>>(LOG, { _ => Array<Int64>(n, { _ => -1 }) })
    let jumpLeft = Array<Array<Int64>>(LOG, { _ => Array<Int64>(n, { _ => -1 }) })
    i = 0
    while (i < n) {
        jumpRight[0][i] = nextLower[i]
        jumpLeft[0][i] = previousLower[i]
        i += 1
    }
    var level: Int64 = 1
    while (level < LOG) {
        i = 0
        while (i < n) {
            let rightMiddle = jumpRight[level - 1][i]
            if (rightMiddle != -1) {
                jumpRight[level][i] = jumpRight[level - 1][rightMiddle]
            }
            let leftMiddle = jumpLeft[level - 1][i]
            if (leftMiddle != -1) {
                jumpLeft[level][i] = jumpLeft[level - 1][leftMiddle]
            }
            i += 1
        }
        level += 1
    }

    let pendingLeft = Array<Int64>(64, { _ => 0 })
    let pendingRight = Array<Int64>(64, { _ => 0 })
    let state = Array<Int64>(2, { _ => 0 })
    for (_ in 0..q) {
        let st = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        var u = st[0] - 1
        var v = st[1] - 1
        var pendingCount: Int64 = 0
        state[0] = 1000001
        state[1] = 0

        while (chainHead[u] != chainHead[v]) {
            if (depth[chainHead[u]] >= depth[chainHead[v]]) {
                processBackward(
                    basePosition[chainHead[u]], basePosition[u], state, nodeAt, basePosition,
                    price, basePrefixWeight, previousLower, jumpLeft, leftLinkCost
                )
                u = parent[chainHead[u]]
            } else {
                pendingLeft[pendingCount] = basePosition[chainHead[v]]
                pendingRight[pendingCount] = basePosition[v]
                pendingCount += 1
                v = parent[chainHead[v]]
            }
        }
        if (depth[u] >= depth[v]) {
            processBackward(
                basePosition[v], basePosition[u], state, nodeAt, basePosition,
                price, basePrefixWeight, previousLower, jumpLeft, leftLinkCost
            )
        } else {
            pendingLeft[pendingCount] = basePosition[u]
            pendingRight[pendingCount] = basePosition[v]
            pendingCount += 1
        }

        var pendingIndex = pendingCount - 1
        while (pendingIndex >= 0) {
            processForward(
                pendingLeft[pendingIndex], pendingRight[pendingIndex], state, nodeAt, basePosition,
                price, basePrefixWeight, nextLower, jumpRight, rightLinkCost
            )
            pendingIndex -= 1
        }
        println(state[1])
    }
    return 0
}
```
