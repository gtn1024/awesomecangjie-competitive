---
oj: dmy
pid: '340'
title: '[R54G]粉刷墙'
difficulty: 提高+
tags:
  - 图论
  - 二分图
  - 网络流
  - 最小割
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n,m,n \times m \le 300$，$0 \le a_{i,j},b_{i,j} \le 10^9$。

## 思路

对每个格子 $v$ 建立两个选择：

- 红色选择 $R_v$，权值为 $a_v$；
- 白色选择 $W_v$，权值为 $b_v$。

一个格子不能同时是红色和白色，因此 $R_v$ 与 $W_v$ 冲突。若两个格子 $u,v$ 相邻，那么选择 $R_u$ 后 $v$ 会变成粉色，不能再选择 $W_v$，所以 $R_u$ 与 $W_v$ 也冲突。

所有冲突都发生在红色选择与白色选择之间。以所有 $R_v$ 为左部、所有 $W_v$ 为右部，按上述冲突关系连边，便得到一张二分图。

任意实际染色方案中，所有获得美观值的红色、白色选择构成这张图的独立集。反过来，对任意独立集，把其中的红色选择对应格子染红；如果某个未染红格子没有红色邻居，却没有选择其白色节点，由于 $b_v\ge 0$，可以把这个白色节点加入独立集而不使答案变差。因此最优染色值恰好等于这张二分图的最大权独立集。

二分图中，最大权独立集的权值等于所有节点权值之和减去最小权点覆盖。最小权点覆盖可以转化成最小割：

- 从源点向每个 $R_v$ 连容量为 $a_v$ 的边；
- 从每个 $W_v$ 向汇点连容量为 $b_v$ 的边；
- 对每对冲突的 $R_u,W_v$，从 $R_u$ 向 $W_v$ 连容量为无穷大的边。

无穷大取所有节点权值之和加一。这样最小割不会割断冲突边，它割掉的有限容量边恰好对应一个点覆盖。用 Dinic 算法求出最小割后，以所有 $a_v,b_v$ 之和减去最小割即为答案。

## 复杂度

记 $N=nm$。网络有 $O(N)$ 个点和 $O(N)$ 条边。使用 Dinic 算法，时间复杂度为 $O(N^3)$，空间复杂度为 $O(N)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

class Dinic {
    var vertexCount: Int64
    var head: Array<Int64>
    var to: Array<Int64>
    var cap: Array<Int64>
    var next: Array<Int64>
    var edgeCount: Int64
    var level: Array<Int64>
    var current: Array<Int64>
    var queue: Array<Int64>

    init(vertexCount: Int64, edgeSlots: Int64) {
        this.vertexCount = vertexCount
        this.head = Array<Int64>(vertexCount, { _ => -1 })
        this.to = Array<Int64>(edgeSlots, { _ => 0 })
        this.cap = Array<Int64>(edgeSlots, { _ => 0 })
        this.next = Array<Int64>(edgeSlots, { _ => -1 })
        this.edgeCount = 0
        this.level = Array<Int64>(vertexCount, { _ => -1 })
        this.current = Array<Int64>(vertexCount, { _ => -1 })
        this.queue = Array<Int64>(vertexCount, { _ => 0 })
    }

    func addEdge(u: Int64, v: Int64, capacity: Int64): Unit {
        this.to[this.edgeCount] = v
        this.cap[this.edgeCount] = capacity
        this.next[this.edgeCount] = this.head[u]
        this.head[u] = this.edgeCount
        this.edgeCount += 1

        this.to[this.edgeCount] = u
        this.cap[this.edgeCount] = 0
        this.next[this.edgeCount] = this.head[v]
        this.head[v] = this.edgeCount
        this.edgeCount += 1
    }

    func bfs(source: Int64, sink: Int64): Bool {
        var i: Int64 = 0
        while (i < this.vertexCount) {
            this.level[i] = -1
            i += 1
        }
        var front: Int64 = 0
        var back: Int64 = 1
        this.queue[0] = source
        this.level[source] = 0
        while (front < back) {
            let u = this.queue[front]
            front += 1
            var e = this.head[u]
            while (e >= 0) {
                let v = this.to[e]
                if (this.cap[e] > 0 && this.level[v] < 0) {
                    this.level[v] = this.level[u] + 1
                    this.queue[back] = v
                    back += 1
                }
                e = this.next[e]
            }
        }
        return this.level[sink] >= 0
    }

    func dfs(u: Int64, sink: Int64, limit: Int64): Int64 {
        if (u == sink) {
            return limit
        }
        var e = this.current[u]
        while (e >= 0) {
            this.current[u] = e
            let v = this.to[e]
            if (this.cap[e] > 0 && this.level[v] == this.level[u] + 1) {
                let available = if (limit < this.cap[e]) { limit } else { this.cap[e] }
                let sent = this.dfs(v, sink, available)
                if (sent > 0) {
                    this.cap[e] -= sent
                    this.cap[e ^ 1] += sent
                    return sent
                }
            }
            e = this.next[e]
            this.current[u] = e
        }
        return 0
    }

    func maxFlow(source: Int64, sink: Int64, infinity: Int64): Int64 {
        var flow: Int64 = 0
        while (this.bfs(source, sink)) {
            var i: Int64 = 0
            while (i < this.vertexCount) {
                this.current[i] = this.head[i]
                i += 1
            }
            while (true) {
                let sent = this.dfs(source, sink, infinity)
                if (sent == 0) {
                    break
                }
                flow += sent
            }
        }
        return flow
    }
}

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let cellCount = n * m
    let a = Array<Int64>(cellCount, { _ => 0 })
    let b = Array<Int64>(cellCount, { _ => 0 })
    var total: Int64 = 0

    var i: Int64 = 0
    while (i < n) {
        let row = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        var j: Int64 = 0
        while (j < m) {
            let id = i * m + j
            a[id] = row[j]
            total += row[j]
            j += 1
        }
        i += 1
    }
    i = 0
    while (i < n) {
        let row = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        var j: Int64 = 0
        while (j < m) {
            let id = i * m + j
            b[id] = row[j]
            total += row[j]
            j += 1
        }
        i += 1
    }

    let source: Int64 = 0
    let redBase: Int64 = 1
    let whiteBase = redBase + cellCount
    let sink = whiteBase + cellCount
    let dinic = Dinic(sink + 1, 14 * cellCount + 10)
    let infinity = total + 1

    var id: Int64 = 0
    while (id < cellCount) {
        dinic.addEdge(source, redBase + id, a[id])
        dinic.addEdge(whiteBase + id, sink, b[id])
        id += 1
    }

    i = 0
    while (i < n) {
        var j: Int64 = 0
        while (j < m) {
            id = i * m + j
            let red = redBase + id
            dinic.addEdge(red, whiteBase + id, infinity)
            if (i > 0) {
                dinic.addEdge(red, whiteBase + id - m, infinity)
            }
            if (i + 1 < n) {
                dinic.addEdge(red, whiteBase + id + m, infinity)
            }
            if (j > 0) {
                dinic.addEdge(red, whiteBase + id - 1, infinity)
            }
            if (j + 1 < m) {
                dinic.addEdge(red, whiteBase + id + 1, infinity)
            }
            j += 1
        }
        i += 1
    }

    let answer = total - dinic.maxFlow(source, sink, infinity)
    println(answer.toString())
    return 0
}
```
