---
oj: dmy
pid: '135'
title: '[R22G]双路径极值差'
difficulty: NOI
tags:
  - 图论
  - 并查集
  - Kruskal 重构树
  - 点分治
  - 数论
timeLimit: 5s
memoryLimit: 1024m
---

> 数据规模：$1 \le n \le 4 \times 10^4$，$1 \le m \le 2 \times 10^5$，图为无向连通图。

## 思路

记

$$
A(i,j)=\min_{P:i\leadsto j}\max_{v\in P}v,\qquad
B(i,j)=\max_{P:i\leadsto j}\min_{v\in P}v.
$$

题目中的两条路径可以独立选择，所以

$$
f(i,j)=A(i,j)-B(i,j).
$$

当 $i<j$ 时，$\left\lfloor i/j\right\rfloor=0$；当 $i=j$ 时，$f(i,i)=0$。因此把两个不同端点记为 $a<b$，原式等于

$$
\sum_{1\le a<b\le n}f(a,b)\left\lfloor\frac ba\right\rfloor.
$$

### 两棵 Kruskal 重构树

按编号从小到大加入顶点。加入 $v$ 时，新建权值为 $v$ 的虚点，把原顶点 $v$ 和所有相邻的已加入连通块的根接到该虚点下；相邻连通块要用并查集去重。所得重构树中，原顶点 $i,j$ 的最近公共祖先权值恰为 $A(i,j)$。

同理，按编号从大到小加入顶点，可以得到另一棵重构树，其中 $i,j$ 的最近公共祖先权值为 $B(i,j)$。

令树边长度为两端权值之差的绝对值，分别记两棵树上原顶点间的距离为 $d_\uparrow(i,j)$ 和 $d_\downarrow(i,j)$。沿树上路径的权值单调变化，因此

$$
d_\uparrow(i,j)=2A(i,j)-i-j,
$$

$$
d_\downarrow(i,j)=i+j-2B(i,j).
$$

两式相加可得

$$
2f(i,j)=d_\uparrow(i,j)+d_\downarrow(i,j).
$$

问题于是转化为：分别在两棵静态树上计算

$$
\sum_{1\le a<b\le n}
\left\lfloor\frac ba\right\rfloor d(a,b),
$$

最后把两棵树的结果相加并除以 $2$。

### 拆分整除权重

利用

$$
\left\lfloor\frac ba\right\rfloor
=\sum_{\substack{k\ge 1\\ka\le b}}1,
$$

固定 $a$ 后，每个倍数阈值 $L=ka$ 都需要查询

$$
\sum_{b\ge L}d(a,b).
$$

从 $n$ 到 $1$ 枚举阈值 $L$，在数据结构中加入原顶点 $L$。此时已加入的点正好是所有编号不小于 $L$ 的点。对 $L$ 的每个约数 $a$ 查询一次到当前点集的距离和，就覆盖了全部 $(a,k)$。查询总数为

$$
\sum_{a=1}^{n}\left\lfloor\frac na\right\rfloor=O(n\log n).
$$

### 质心分解维护距离和

对重构树做质心分解。对每个原顶点保存其质心祖先链，以及到每个质心的距离和所在分支编号。

对每个质心 $c$ 维护当前已加入点的数量 $cnt_c$ 与到 $c$ 的距离和 $sum_c$；对质心删除后形成的每个分支维护同样的信息。加入顶点时沿质心祖先链更新这些量。

查询顶点 $x$ 到所有已加入点的距离和时，对质心祖先链上的每个 $c$ 加上

$$
sum_c+cnt_c\cdot d(x,c),
$$

再减去与 $x$ 位于 $c$ 同一分支的对应统计量。这样每一对点只会在它们质心分解路径首次分开的层被统计一次，单次加入和查询均为 $O(\log n)$。

## 复杂度

两棵重构树各有 $2n$ 个节点。时间复杂度为 $O((n+m)\alpha(n)+n\log^2 n)$，空间复杂度为 $O(m+n\log n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

func findRoot(parent: Array<Int64>, start: Int64): Int64 {
    var x = start
    while (parent[x] != x) {
        parent[x] = parent[parent[x]]
        x = parent[x]
    }
    return x
}

func edgeLength(weight: Array<Int64>, x: Int64, y: Int64): Int64 {
    if (weight[x] >= weight[y]) {
        return weight[x] - weight[y]
    }
    return weight[y] - weight[x]
}

func reconstructionDistanceSum(
    n: Int64,
    graphOffset: Array<Int64>,
    graphTo: Array<Int64>,
    queryOffset: Array<Int64>,
    queryVertex: Array<Int64>,
    increasing: Bool
): Int64 {
    let nodeCount = 2 * n
    let parent = Array<Int64>(nodeCount + 1, { _ => 0 })
    let active = Array<Int64>(n + 1, { _ => 0 })
    let mark = Array<Int64>(nodeCount + 1, { _ => 0 })
    let roots = Array<Int64>(n + 1, { _ => 0 })
    let weight = Array<Int64>(nodeCount + 1, { _ => 0 })
    let treeU = Array<Int64>(nodeCount, { _ => 0 })
    let treeV = Array<Int64>(nodeCount, { _ => 0 })

    var i: Int64 = 1
    while (i <= nodeCount) {
        parent[i] = i
        i += 1
    }
    i = 1
    while (i <= n) {
        weight[i] = i
        weight[n + i] = i
        i += 1
    }

    var edgeCount: Int64 = 0
    var stamp: Int64 = 0
    var step: Int64 = 1
    while (step <= n) {
        let v = if (increasing) { step } else { n - step + 1 }
        let newNode = n + v
        active[v] = 1
        parent[v] = newNode
        parent[newNode] = newNode

        treeU[edgeCount] = newNode
        treeV[edgeCount] = v
        edgeCount += 1

        stamp += 1
        var rootCount: Int64 = 0
        var pos = graphOffset[v]
        while (pos < graphOffset[v + 1]) {
            let to = graphTo[pos]
            if (active[to] == 1) {
                let root = findRoot(parent, to)
                if (root != newNode && mark[root] != stamp) {
                    mark[root] = stamp
                    roots[rootCount] = root
                    rootCount += 1
                }
            }
            pos += 1
        }

        var j: Int64 = 0
        while (j < rootCount) {
            let root = roots[j]
            treeU[edgeCount] = newNode
            treeV[edgeCount] = root
            edgeCount += 1
            parent[root] = newNode
            j += 1
        }
        step += 1
    }

    let treeDegree = Array<Int64>(nodeCount + 1, { _ => 0 })
    i = 0
    while (i < edgeCount) {
        treeDegree[treeU[i]] += 1
        treeDegree[treeV[i]] += 1
        i += 1
    }
    let treeOffset = Array<Int64>(nodeCount + 2, { _ => 0 })
    i = 1
    while (i <= nodeCount) {
        treeOffset[i + 1] = treeOffset[i] + treeDegree[i]
        i += 1
    }
    let treeCursor = Array<Int64>(nodeCount + 1, { _ => 0 })
    i = 1
    while (i <= nodeCount) {
        treeCursor[i] = treeOffset[i]
        i += 1
    }
    let treeTo = Array<Int64>(2 * edgeCount, { _ => 0 })
    i = 0
    while (i < edgeCount) {
        let x = treeU[i]
        let y = treeV[i]
        treeTo[treeCursor[x]] = y
        treeCursor[x] += 1
        treeTo[treeCursor[y]] = x
        treeCursor[y] += 1
        i += 1
    }

    let removed = Array<Int64>(nodeCount + 1, { _ => 0 })
    let temporaryParent = Array<Int64>(nodeCount + 1, { _ => 0 })
    let subtreeSize = Array<Int64>(nodeCount + 1, { _ => 0 })
    let temporaryDistance = Array<Int64>(nodeCount + 1, { _ => 0 })
    let stack = Array<Int64>(nodeCount + 1, { _ => 0 })
    let componentNodes = Array<Int64>(nodeCount + 1, { _ => 0 })
    let tasks = Array<Int64>(nodeCount + 1, { _ => 0 })

    let chainWidth: Int64 = 20
    let chainSlots = (n + 1) * chainWidth
    let chainLength = Array<Int64>(n + 1, { _ => 0 })
    let chainCentroid = Array<Int64>(chainSlots, { _ => 0 })
    let chainDistance = Array<Int64>(chainSlots, { _ => 0 })
    let chainBranch = Array<Int64>(chainSlots, { _ => -1 })

    var taskCount: Int64 = 1
    tasks[0] = 1
    var branchCount: Int64 = 0

    while (taskCount > 0) {
        taskCount -= 1
        let start = tasks[taskCount]
        if (removed[start] == 1) {
            continue
        }

        var stackSize: Int64 = 1
        stack[0] = start
        temporaryParent[start] = 0
        var componentSize: Int64 = 0
        while (stackSize > 0) {
            stackSize -= 1
            let x = stack[stackSize]
            componentNodes[componentSize] = x
            componentSize += 1
            var pos = treeOffset[x]
            while (pos < treeOffset[x + 1]) {
                let y = treeTo[pos]
                if (removed[y] == 0 && y != temporaryParent[x]) {
                    temporaryParent[y] = x
                    stack[stackSize] = y
                    stackSize += 1
                }
                pos += 1
            }
        }

        i = 0
        while (i < componentSize) {
            subtreeSize[componentNodes[i]] = 1
            i += 1
        }
        i = componentSize
        while (i > 0) {
            i -= 1
            let x = componentNodes[i]
            let p = temporaryParent[x]
            if (p != 0) {
                subtreeSize[p] += subtreeSize[x]
            }
        }

        var centroid = start
        i = 0
        while (i < componentSize) {
            let x = componentNodes[i]
            var largestPart = componentSize - subtreeSize[x]
            var pos = treeOffset[x]
            while (pos < treeOffset[x + 1]) {
                let y = treeTo[pos]
                if (removed[y] == 0 && temporaryParent[y] == x && subtreeSize[y] > largestPart) {
                    largestPart = subtreeSize[y]
                }
                pos += 1
            }
            if (2 * largestPart <= componentSize) {
                centroid = x
                break
            }
            i += 1
        }

        if (centroid <= n) {
            let length = chainLength[centroid]
            let slot = centroid * chainWidth + length
            chainCentroid[slot] = centroid
            chainDistance[slot] = 0
            chainBranch[slot] = -1
            chainLength[centroid] = length + 1
        }

        removed[centroid] = 1
        var adjacentPos = treeOffset[centroid]
        while (adjacentPos < treeOffset[centroid + 1]) {
            let first = treeTo[adjacentPos]
            if (removed[first] == 0) {
                let currentBranch = branchCount
                branchCount += 1
                tasks[taskCount] = first
                taskCount += 1

                stackSize = 1
                stack[0] = first
                temporaryParent[first] = centroid
                temporaryDistance[first] = edgeLength(weight, centroid, first)
                while (stackSize > 0) {
                    stackSize -= 1
                    let x = stack[stackSize]
                    if (x <= n) {
                        let length = chainLength[x]
                        let slot = x * chainWidth + length
                        chainCentroid[slot] = centroid
                        chainDistance[slot] = temporaryDistance[x]
                        chainBranch[slot] = currentBranch
                        chainLength[x] = length + 1
                    }
                    var pos = treeOffset[x]
                    while (pos < treeOffset[x + 1]) {
                        let y = treeTo[pos]
                        if (removed[y] == 0 && y != temporaryParent[x]) {
                            temporaryParent[y] = x
                            temporaryDistance[y] = temporaryDistance[x] + edgeLength(weight, x, y)
                            stack[stackSize] = y
                            stackSize += 1
                        }
                        pos += 1
                    }
                }
            }
            adjacentPos += 1
        }
    }

    let centroidCount = Array<Int64>(nodeCount + 1, { _ => 0 })
    let centroidDistanceSum = Array<Int64>(nodeCount + 1, { _ => 0 })
    let branchActiveCount = Array<Int64>(nodeCount + 1, { _ => 0 })
    let branchDistanceSum = Array<Int64>(nodeCount + 1, { _ => 0 })

    var answer: Int64 = 0
    var threshold = n
    while (threshold >= 1) {
        var level: Int64 = 0
        while (level < chainLength[threshold]) {
            let slot = threshold * chainWidth + level
            let centroid = chainCentroid[slot]
            let distance = chainDistance[slot]
            centroidCount[centroid] += 1
            centroidDistanceSum[centroid] += distance
            let branch = chainBranch[slot]
            if (branch >= 0) {
                branchActiveCount[branch] += 1
                branchDistanceSum[branch] += distance
            }
            level += 1
        }

        var queryPos = queryOffset[threshold]
        while (queryPos < queryOffset[threshold + 1]) {
            let vertex = queryVertex[queryPos]
            var distanceSum: Int64 = 0
            level = 0
            while (level < chainLength[vertex]) {
                let slot = vertex * chainWidth + level
                let centroid = chainCentroid[slot]
                let distance = chainDistance[slot]
                distanceSum += centroidDistanceSum[centroid] + centroidCount[centroid] * distance
                let branch = chainBranch[slot]
                if (branch >= 0) {
                    distanceSum -= branchDistanceSum[branch] + branchActiveCount[branch] * distance
                }
                level += 1
            }
            answer += distanceSum
            queryPos += 1
        }
        threshold -= 1
    }
    return answer
}

main() {
    let reader = getStdIn()
    let firstLine = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = firstLine[0]
    let m = firstLine[1]

    let edgeU = Array<Int64>(m, { _ => 0 })
    let edgeV = Array<Int64>(m, { _ => 0 })
    let graphDegree = Array<Int64>(n + 1, { _ => 0 })
    var i: Int64 = 0
    while (i < m) {
        let edge = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = edge[0]
        let v = edge[1]
        edgeU[i] = u
        edgeV[i] = v
        graphDegree[u] += 1
        graphDegree[v] += 1
        i += 1
    }

    let graphOffset = Array<Int64>(n + 2, { _ => 0 })
    i = 1
    while (i <= n) {
        graphOffset[i + 1] = graphOffset[i] + graphDegree[i]
        i += 1
    }
    let graphCursor = Array<Int64>(n + 1, { _ => 0 })
    i = 1
    while (i <= n) {
        graphCursor[i] = graphOffset[i]
        i += 1
    }
    let graphTo = Array<Int64>(2 * m, { _ => 0 })
    i = 0
    while (i < m) {
        let u = edgeU[i]
        let v = edgeV[i]
        graphTo[graphCursor[u]] = v
        graphCursor[u] += 1
        graphTo[graphCursor[v]] = u
        graphCursor[v] += 1
        i += 1
    }

    let divisorCount = Array<Int64>(n + 1, { _ => 0 })
    var divisor: Int64 = 1
    while (divisor <= n) {
        var multiple = divisor
        while (multiple <= n) {
            divisorCount[multiple] += 1
            multiple += divisor
        }
        divisor += 1
    }
    let queryOffset = Array<Int64>(n + 2, { _ => 0 })
    i = 1
    while (i <= n) {
        queryOffset[i + 1] = queryOffset[i] + divisorCount[i]
        i += 1
    }
    let queryCursor = Array<Int64>(n + 1, { _ => 0 })
    i = 1
    while (i <= n) {
        queryCursor[i] = queryOffset[i]
        i += 1
    }
    let queryVertex = Array<Int64>(queryOffset[n + 1], { _ => 0 })
    divisor = 1
    while (divisor <= n) {
        var multiple = divisor
        while (multiple <= n) {
            queryVertex[queryCursor[multiple]] = divisor
            queryCursor[multiple] += 1
            multiple += divisor
        }
        divisor += 1
    }

    let increasingSum = reconstructionDistanceSum(n, graphOffset, graphTo, queryOffset, queryVertex, true)
    let decreasingSum = reconstructionDistanceSum(n, graphOffset, graphTo, queryOffset, queryVertex, false)
    println(((increasingSum + decreasingSum) / 2).toString())
}
```

</details>
