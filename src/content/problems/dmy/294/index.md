---
oj: dmy
pid: '294'
title: '[R47F]消除电荷'
difficulty: 省选
tags:
  - 树
  - 树状数组
  - 离散化
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le p_i < i$，$|a_i| \le 5 \times 10^7$。

## 思路

记 $b_x$ 为操作前节点 $x$ 的子树电荷和，并令初始健康程度为：

$$
H=\sum_{x=1}^{n}|b_x|.
$$

消除节点 $u$ 的电荷 $a_u$ 后，只有 $u$ 到根路径上的节点包含 $u$，这些节点的子树和会从 $b_x$ 变成 $b_x-a_u$。其他节点的贡献不变。因此：

$$
\operatorname{ans}_u
=H-\sum_{x\in \operatorname{Anc}(u)}|b_x|
+\sum_{x\in \operatorname{Anc}(u)}|b_x-a_u|,
$$

其中 $\operatorname{Anc}(u)$ 包含 $u$ 自身。

由于 $p_i<i$，先令 $b_i=a_i$，再按编号从大到小把 $b_i$ 加给父亲，就能在线性时间内求出全部子树和。

接着 DFS 整棵树，并动态维护当前根到节点路径上的所有 $b_x$。将全部 $b_x$ 离散化，用两棵树状数组分别维护每个值的出现次数与数值之和；进入节点时加入它的 $b_x$，离开时删除。同时维护路径长度 $d$、路径元素总和 $S$ 与路径绝对值之和 $A$。

处理节点 $u$ 时令 $z=a_u$。查询得到路径上满足 $b_x\le z$ 的元素个数 $c$ 与元素和 $L$，则：

$$
\begin{aligned}
\sum_{x\in \operatorname{Anc}(u)}|b_x-z|
&=zc-L+(S-L)-z(d-c).
\end{aligned}
$$

把这个值与当前的 $A$ 代入上式即可得到 $\operatorname{ans}_u$。DFS 用显式栈记录进入、离开事件，避免树退化成链时产生过深递归。

## 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

class Fenwick {
    let n: Int64
    var count: Array<Int64>
    var sum: Array<Int64>

    init(n: Int64) {
        this.n = n
        this.count = Array<Int64>(n + 1, { _ => 0 })
        this.sum = Array<Int64>(n + 1, { _ => 0 })
    }

    func add(pos0: Int64, countDelta: Int64, sumDelta: Int64): Unit {
        var pos = pos0
        while (pos <= n) {
            count[pos] += countDelta
            sum[pos] += sumDelta
            pos += pos & (-pos)
        }
    }

    func countPrefix(pos0: Int64): Int64 {
        var pos = pos0
        var result: Int64 = 0
        while (pos > 0) {
            result += count[pos]
            pos -= pos & (-pos)
        }
        return result
    }

    func sumPrefix(pos0: Int64): Int64 {
        var pos = pos0
        var result: Int64 = 0
        while (pos > 0) {
            result += sum[pos]
            pos -= pos & (-pos)
        }
        return result
    }
}

func lowerBound(a: Array<Int64>, x: Int64): Int64 {
    var left: Int64 = 0
    var right = a.size
    while (left < right) {
        let mid = (left + right) / 2
        if (a[mid] < x) {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left
}

func upperBound(a: Array<Int64>, x: Int64): Int64 {
    var left: Int64 = 0
    var right = a.size
    while (left < right) {
        let mid = (left + right) / 2
        if (a[mid] <= x) {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left
}

func absolute(x: Int64): Int64 {
    if (x >= 0) {
        x
    } else {
        -x
    }
}

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let parentInput = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let charge = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let parent = Array<Int64>(n, { _ => -1 })
    let head = Array<Int64>(n, { _ => -1 })
    let next = Array<Int64>(n, { _ => -1 })
    for (u in 1..n) {
        let p = parentInput[u - 1] - 1
        parent[u] = p
        next[u] = head[p]
        head[p] = u
    }

    let subtreeSum = Array<Int64>(n, { i => charge[i] })
    var u = n - 1
    while (u >= 1) {
        subtreeSum[parent[u]] += subtreeSum[u]
        u -= 1
    }

    var health: Int64 = 0
    for (x in subtreeSum) {
        health += absolute(x)
    }

    let values = Array<Int64>(n, { i => subtreeSum[i] })
    sort(values)
    let fenwick = Fenwick(n)
    let answer = Array<Int64>(n, { _ => 0 })

    let stack = Array<Int64>(2 * n + 1, { _ => 0 })
    var top: Int64 = 0
    stack[top] = 1
    top += 1
    var pathCount: Int64 = 0
    var pathSum: Int64 = 0
    var pathAbsoluteSum: Int64 = 0

    while (top > 0) {
        top -= 1
        let event = stack[top]
        if (event > 0) {
            let node = event - 1
            let value = subtreeSum[node]
            let index = lowerBound(values, value) + 1
            fenwick.add(index, 1, value)
            pathCount += 1
            pathSum += value
            pathAbsoluteSum += absolute(value)

            let removed = charge[node]
            let bound = upperBound(values, removed)
            let leftCount = fenwick.countPrefix(bound)
            let leftSum = fenwick.sumPrefix(bound)
            let changed = removed * leftCount - leftSum + pathSum - leftSum - removed * (pathCount - leftCount)
            answer[node] = health - pathAbsoluteSum + changed

            stack[top] = -event
            top += 1
            var child = head[node]
            while (child >= 0) {
                stack[top] = child + 1
                top += 1
                child = next[child]
            }
        } else {
            let node = -event - 1
            let value = subtreeSum[node]
            let index = lowerBound(values, value) + 1
            fenwick.add(index, -1, -value)
            pathCount -= 1
            pathSum -= value
            pathAbsoluteSum -= absolute(value)
        }
    }

    for (i in 0..n) {
        if (i > 0) {
            print(" ")
        }
        print(answer[i])
    }
    println()
    return 0
}
```
