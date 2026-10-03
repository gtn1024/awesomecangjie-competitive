---
oj: dmy
pid: '153'
title: '[R25F]树上选链'
difficulty: 提高
tags:
  - 最小费用流
  - 图论
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定一棵以 $1$ 为根、根深度为 $1$ 的有根树，每个节点 $i$ 有权值 $w_i$。选择至多 $k$ 条互不相交的链，每条链的两个端点具有祖先-后代关系（允许单点链），且以深度 $i$ 的节点作为链的下端点的链数不超过 $a_i$、作为上端点的链数不超过 $b_i$，最大化被覆盖节点的权值之和。

> 数据规模：$1 \le n, k, a_i, b_i \le 300$，$1 \le w_i \le 10^9$。

## 思路

每条链都是一条「竖直」路径：上端点为某节点 $u$，下端点为 $u$ 的后代 $v$。链互不相交等价于每个节点至多被一条链覆盖；而端点约束只统计端点所在深度，所以每个深度只需一个容量节点。三者统一用最小费用流建模：

- 源点 $S \to \text{st}_i$（容量 $b_i$，费用 $0$）：深度 $i$ 的上端点配额；
- $\text{en}_i \to T$（容量 $a_i$，费用 $0$）：深度 $i$ 的下端点配额；
- 每个节点 $u$ 拆成 $\text{in}(u) \to \text{out}(u)$（容量 $1$，费用 $-w_u$）：点容量与覆盖收益；
- $\text{st}_{\text{dep}(u)} \to \text{in}(u)$（容量 $1$）：链从 $u$ 开始；
- $\text{out}(u) \to \text{in}(v)$（$v$ 是 $u$ 的儿子，容量 $1$）：链向下延伸；
- $\text{out}(u) \to \text{en}_{\text{dep}(u)}$（容量 $1$）：链在 $u$ 结束。

于是 $S$ 到 $T$ 的一条单位流恰好对应一条合法链，流量即链数，费用为覆盖点权和的相反数，点容量 $1$ 保证链互不相交。「至多 $k$ 条」用连续最短路增广实现：最多增广 $k$ 次，且当增广路的真实费用 $\ge 0$ 时停止（费用函数关于流量凸，边际代价单调不降），答案取总费用的相反数。

费用含负数（$-w_u$），需要用势函数（Johnson）把边权转为非负的约简代价再跑 Dijkstra：初始势取 DAG 上从 $S$ 出发的最短路距离（图按拓扑序递推即可），每次增广后对所有可达点更新 $\text{pot}[v] \mathrel{+}= \text{dist}[v]$。注意 Dijkstra 不能提前在汇点 $T$ 处退出——否则仍有未弹出的可达节点距离未定，势更新后会出现负约简代价边，导致答案错误。

## 复杂度

- 时间复杂度：$O(k \cdot n \log n)$，最多增广 $k$ 次，每次 Dijkstra 在 $O(n)$ 个点、$O(n)$ 条边的图上运行。
- 空间复杂度：$O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

// 最小费用流：Dijkstra + 势（Johnson），点容量、深度上下端点容量均建模为边的容量
class MinCostFlow {
    var V: Int64
    var head: Array<Int64>
    var eTo = ArrayList<Int64>()
    var eCap = ArrayList<Int64>()
    var eCost = ArrayList<Int64>()
    var eNext = ArrayList<Int64>()
    var pot: Array<Int64>

    public init(v: Int64) {
        this.V = v
        this.head = Array<Int64>(v, { _ => -1 })
        this.pot = Array<Int64>(v, { _ => 0 })
    }

    // 加入一条有向边（及其反向边），反向边成对出现，rev = idx ^ 1
    func addEdge(u: Int64, v: Int64, cap: Int64, cost: Int64): Unit {
        let i = this.eTo.size
        this.eTo.add(v)
        this.eCap.add(cap)
        this.eCost.add(cost)
        this.eNext.add(this.head[u])
        this.head[u] = i
        this.eTo.add(u)
        this.eCap.add(0)
        this.eCost.add(-cost)
        this.eNext.add(this.head[v])
        this.head[v] = i + 1
    }

    // 在残余图上跑 Dijkstra（边权为约简代价 c + pot[u] - pot[v] >= 0）
    func dijkstra(s: Int64, t: Int64, dist: Array<Int64>, prevN: Array<Int64>, prevE: Array<Int64>, INF: Int64): Unit {
        var i: Int64 = 0
        while (i < this.V) {
            dist[i] = INF
            prevN[i] = -1
            prevE[i] = -1
            i += 1
        }
        dist[s] = 0
        // 二叉堆，存打包键 (dist << 12) | node
        let hd = Array<Int64>(this.eTo.size * 2 + 64, { _ => 0 })
        let hv = Array<Int64>(this.eTo.size * 2 + 64, { _ => 0 })
        var hs: Int64 = 0
        hd[0] = 0
        hv[0] = s
        hs = 1
        while (hs > 0) {
            // 弹出堆顶（键为打包值 (dist << 12) | node，需还原出 dist）
            let cd = hd[0] >> 12
            let u = hv[0]
            hs -= 1
            if (hs > 0) {
                let ld = hd[hs]
                let lv = hv[hs]
                var qi: Int64 = 0
                while (true) {
                    let l = 2 * qi + 1
                    if (l >= hs) {
                        break
                    }
                    let r = l + 1
                    var m = l
                    if (r < hs && hd[r] < hd[l]) {
                        m = r
                    }
                    if (hd[m] >= ld) {
                        break
                    }
                    hd[qi] = hd[m]
                    hv[qi] = hv[m]
                    qi = m
                }
                hd[qi] = ld
                hv[qi] = lv
            }
            if (cd != dist[u]) {
                continue
            }
            // 注意：不能在这里提前 break（即使 u == t），否则未弹出的可达节点距离未定，
            // 势更新后会出现负约简代价边，破坏 Dijkstra 的正确性
            var e = this.head[u]
            while (e >= 0) {
                if (this.eCap[e] > 0) {
                    let v = this.eTo[e]
                    let nd = cd + this.eCost[e] + this.pot[u] - this.pot[v]
                    if (nd < dist[v]) {
                        dist[v] = nd
                        prevN[v] = u
                        prevE[v] = e
                        // 插入堆
                        var qi = hs
                        hs += 1
                        let key = (nd << 12) | v
                        while (qi > 0) {
                            let p = (qi - 1) / 2
                            if (hd[p] <= key) {
                                break
                            }
                            hd[qi] = hd[p]
                            hv[qi] = hv[p]
                            qi = p
                        }
                        hd[qi] = key
                        hv[qi] = v
                    }
                }
                e = this.eNext[e]
            }
        }
    }
}

main() {
    let reader = getStdIn()
    let parts0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = parts0[0]
    let k = parts0[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let w = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // 树的邻接表（节点编号 0..n-1，根为 0）
    var adj = ArrayList<ArrayList<Int64>>()
    var i0: Int64 = 0
    while (i0 < n) {
        adj.add(ArrayList<Int64>())
        i0 += 1
    }
    var ei: Int64 = 0
    while (ei < n - 1) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = parts[0] - 1
        let v = parts[1] - 1
        adj[u].add(v)
        adj[v].add(u)
        ei += 1
    }
    // BFS 求深度（根深度 1）与父节点，得到父先于子的遍历顺序
    let depth = Array<Int64>(n, { _ => 0 })
    let parent = Array<Int64>(n, { _ => -1 })
    let order = ArrayList<Int64>()
    let queue = ArrayList<Int64>()
    depth[0] = 1
    queue.add(0)
    var qh: Int64 = 0
    while (qh < queue.size) {
        let u = queue[qh]
        qh += 1
        order.add(u)
        var it: Int64 = 0
        while (it < adj[u].size) {
            let v = adj[u][it]
            if (v != parent[u]) {
                parent[v] = u
                depth[v] = depth[u] + 1
                queue.add(v)
            }
            it += 1
        }
    }
    // 费用流建图：
    // S=0, T=1, st(i)=2+i-1, en(i)=2+n+i-1, in(u)=2+2n+u-1, out(u)=2+3n+u-1
    let S: Int64 = 0
    let T: Int64 = 1
    let stBase: Int64 = 2
    let enBase: Int64 = 2 + n
    let inBase: Int64 = 2 + 2 * n
    let outBase: Int64 = 2 + 3 * n
    let V: Int64 = 4 * n + 2
    let mcf = MinCostFlow(V)
    var d: Int64 = 0
    while (d < n) {
        mcf.addEdge(S, stBase + d, b[d], 0)
        mcf.addEdge(enBase + d, T, a[d], 0)
        d += 1
    }
    var oi: Int64 = 0
    while (oi < n) {
        let u = order[oi]
        let dep = depth[u]
        mcf.addEdge(stBase + (dep - 1), inBase + u, 1, 0)
        mcf.addEdge(inBase + u, outBase + u, 1, -w[u])
        mcf.addEdge(outBase + u, enBase + (dep - 1), 1, 0)
        var it: Int64 = 0
        while (it < adj[u].size) {
            let v = adj[u][it]
            if (parent[v] == u) {
                mcf.addEdge(outBase + u, inBase + v, 1, 0)
            }
            it += 1
        }
        oi += 1
    }
    // 初始势：DAG 上从 S 的最短路距离（负权边无负环，按拓扑序递推）
    let INF: Int64 = 1 << 62
    mcf.pot[S] = 0
    d = 0
    while (d < n) {
        mcf.pot[stBase + d] = 0
        d += 1
    }
    oi = 0
    while (oi < n) {
        let u = order[oi]
        let pu = parent[u]
        let pin: Int64 = if (pu < 0) { 0 } else { mcf.pot[outBase + pu] }
        mcf.pot[inBase + u] = pin
        mcf.pot[outBase + u] = pin - w[u]
        oi += 1
    }
    d = 0
    while (d < n) {
        mcf.pot[enBase + d] = INF
        d += 1
    }
    oi = 0
    while (oi < n) {
        let u = order[oi]
        let dep = depth[u]
        let vv = mcf.pot[outBase + u]
        if (vv < mcf.pot[enBase + (dep - 1)]) {
            mcf.pot[enBase + (dep - 1)] = vv
        }
        oi += 1
    }
    mcf.pot[T] = INF
    d = 0
    while (d < n) {
        if (mcf.pot[enBase + d] < mcf.pot[T]) {
            mcf.pot[T] = mcf.pot[enBase + d]
        }
        d += 1
    }
    // 连续最短路，最多增广 k 次；增广路真实代价 >= 0 时停止（至多 k 条链）
    let dist = Array<Int64>(V, { _ => 0 })
    let prevN = Array<Int64>(V, { _ => -1 })
    let prevE = Array<Int64>(V, { _ => -1 })
    var flow: Int64 = 0
    var totalCost: Int64 = 0
    while (flow < k) {
        mcf.dijkstra(S, T, dist, prevN, prevE, INF)
        if (dist[T] >= INF) {
            break
        }
        let realCost = dist[T] + mcf.pot[T] - mcf.pot[S]
        if (realCost >= 0) {
            break
        }
        var v: Int64 = 0
        while (v < V) {
            if (dist[v] < INF) {
                mcf.pot[v] += dist[v]
            }
            v += 1
        }
        var x = T
        while (x != S) {
            let e = prevE[x]
            mcf.eCap[e] -= 1
            mcf.eCap[e ^ 1] += 1
            x = prevN[x]
        }
        totalCost += realCost
        flow += 1
    }
    println((-totalCost).toString())
}
```

</details>
