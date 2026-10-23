---
oj: dmy
pid: '517'
title: '[R81F] 营地'
difficulty: 提高+/省选-
tags:
  - 树形 DP
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1\le n\le 2\times 10^5$，$1\le u,v\le n$，输入的道路构成一棵无向树。子任务 2 满足特殊性质 A：原树是一条链。

## 思路

**先转化条件。** 把路径 $P$ 上的点全部关掉后，剩余区域恰好是「$P$ 上每个点背离 $P$ 挂出去的那些子树」：对 $v\in P$ 的每个不在 $P$ 上的邻居 $w$，割掉边 $(v,w)$ 后 $w$ 所在的连通块就是一块剩余区域。所以「剩余每个连通块大小都是奇数」等价于 **$P$ 上每个点背离 $P$ 的每棵子树大小都是奇数**。路径覆盖全树时没有剩余区域，按空集处理，天然满足。

**每个点最多容忍一个偶数分支。** 以 $1$ 为根，记 $\mathrm{sz}[c]$ 为孩子分支的大小。先考虑「路径已经占住了 $v$ 的父方向，接下来只能往孩子方向延伸」的情形：$v$ 最多向一个孩子分支里延伸，没被延伸的孩子分支会整块留下来，因此它们必须都是奇数大小。按剩下的孩子分支里有几个是偶数分三类：

- $0$ 个偶数分支：可以停在 $v$（$v$ 自己就是合法端点），也可以钻进任意一个孩子分支继续走，贡献 $1+\sum_c \mathrm{down}[c]$；
- $1$ 个偶数分支 $c_e$：$c_e$ 整块留下就是偶数大小的连通块，不合法，必须钻进它，贡献 $\mathrm{down}[c_e]$；
- $\ge 2$ 个偶数分支：只能钻进其中一个，另一个必然整块留下，无解，贡献 $0$。

这就是 $\mathrm{down}[v]$ 的转移：**$\mathrm{down}[v]$ 表示父方向已被路径占住时，从 $v$ 出发往下能到达的合法端点数**（停在 $v$ 也算一个）。按后序求出所有 $\mathrm{down}$。

**再换根求 $\mathrm{up}$。** **$\mathrm{up}[v]$ 表示从 $v$ 出发先走父方向时能到达的合法端点数**，等价于把父分支当成 $v$ 的一条普通分支。于是对点 $v$ 把全部邻居分支列出来：孩子 $c$ 的分支是 $(\mathrm{sz}[c],\mathrm{down}[c])$，父方向分支是 $(n-\mathrm{sz}[v],\mathrm{up}[v])$。对每个孩子 $c$，把它这一支从列表里删掉，再按上面三条规则重算一次，就得到 $\mathrm{up}[c]$。根没有父方向，$\mathrm{up}[1]$ 恒为 $0$，也不会被用到。

**统计答案。** 起点 $v$ 没有已被占住的父方向，所以它的合法端点数就是拿全部邻居分支套同一套规则：偶数分支数为 $0$ 时贡献 $1+\sum$，为 $1$ 时贡献那支的 $\mathrm{down}$（或 $\mathrm{up}$），否则为 $0$。把所有起点的贡献累加记为 `ordered`。

一条长度大于 $1$ 的合法路径在两个端点各被数一次；长度等于 $1$ 的路径只在「$v$ 的所有分支都是奇数」时在 `ordered` 里被数一次，用 `singleton` 单独记这个次数。因此

$$\text{answer}=\frac{\text{ordered}+\text{singleton}}{2}.$$

**实现要点。** $2\times 10^5$ 的链会爆栈，所以不写递归：先 BFS 出 `order`，倒序扫 `order` 即后序，可以顺带算出 `sz` 与 `down`；再正序扫 `order` 做换根。答案最大约 $n(n+1)/2\approx 2\times 10^{10}$，所有计数都要用 64 位整数。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n + 1
    let g = Array<ArrayList<Int64>>(nn, { _ => ArrayList<Int64>() })
    var i: Int64 = 1
    while (i < n) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let u = Int64.parse(parts[0])
        let v = Int64.parse(parts[1])
        g[u].add(v)
        g[v].add(u)
        i += 1
    }

    let parent = Array<Int64>(nn, { _ => 0 })
    let sz = Array<Int64>(nn, { _ => 1 })
    let order = ArrayList<Int64>()
    order.add(1)
    var head: Int64 = 0
    while (head < order.size) {
        let v = order[head]
        for (w in g[v]) {
            if (w != parent[v]) {
                parent[w] = v
                order.add(w)
            }
        }
        head += 1
    }

    let down = Array<Int64>(nn, { _ => 0 })
    let up = Array<Int64>(nn, { _ => 0 })

    var pos = order.size - 1
    while (pos >= 0) {
        let v = order[pos]
        var evenCount: Int64 = 0
        var sum: Int64 = 0
        var evenSum: Int64 = 0
        for (w in g[v]) {
            if (parent[w] == v) {
                sz[v] += sz[w]
                sum += down[w]
                if (sz[w] % 2 == 0) {
                    evenCount += 1
                    evenSum += down[w]
                }
            }
        }
        if (evenCount == 0) {
            down[v] = 1 + sum
        } else if (evenCount == 1) {
            down[v] = evenSum
        } else {
            down[v] = 0
        }
        pos -= 1
    }

    var ordered: Int64 = 0
    var singleton: Int64 = 0
    for (v in order) {
        var evenCount: Int64 = 0
        var sum: Int64 = 0
        var evenSum: Int64 = 0
        for (w in g[v]) {
            var branchSize: Int64 = 0
            var incoming: Int64 = 0
            if (parent[w] == v) {
                branchSize = sz[w]
                incoming = down[w]
            } else {
                branchSize = n - sz[v]
                incoming = up[v]
            }
            sum += incoming
            if (branchSize % 2 == 0) {
                evenCount += 1
                evenSum += incoming
            }
        }
        if (evenCount == 0) {
            ordered += 1 + sum
            singleton += 1
        } else if (evenCount == 1) {
            ordered += evenSum
        }
        for (w in g[v]) {
            if (parent[w] == v) {
                let isEven = sz[w] % 2 == 0
                var remainingEven = evenCount
                if (isEven) {
                    remainingEven -= 1
                }
                if (remainingEven == 0) {
                    up[w] = 1 + sum - down[w]
                } else if (remainingEven == 1) {
                    var sub: Int64 = 0
                    if (isEven) {
                        sub = down[w]
                    }
                    up[w] = evenSum - sub
                } else {
                    up[w] = 0
                }
            }
        }
    }
    println((ordered + singleton) / 2)
}
```

</details>
