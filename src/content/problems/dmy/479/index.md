---
oj: dmy
pid: '479'
title: '[R77E] 联络'
difficulty: 提高+
tags:
  - 图论
  - BFS
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$0 \le m \le \min\left(\frac{n(n-1)}{2}, 10^6\right)$。

## 思路

把「当前站点 + 下一次必须走哪类边」作为状态，建一张分层图：

- $(u,0)$：消息在站点 $u$，下一次必须经过一条**已铺设**的线路；
- $(u,1)$：消息在站点 $u$，下一次必须经过一条**不存在**的线路，即目标站点与 $u$ 之间没有线路，且目标不能是 $u$ 自己。

每传递一次就把层号取反，于是原问题就是在这张 $2n$ 个状态的无权图上求从 $(1,0)$ 出发的最短路，答案是 $(n,0)$ 与 $(n,1)$ 中较近者的距离，$n=1$ 时为 $0$。

在 BFS 中：

- $(u,0)$ 的邻居是所有与 $u$ 之间有线路的站点，直接遍历原图邻接表，总量 $O(m)$；
- $(u,1)$ 的邻居是所有与 $u$ 之间**没有**线路的站点，也就是补图上的边，穷举的话数量可达 $O(n^2)$，这是唯一的瓶颈。

由于 BFS 中每个状态只会被访问一次，扩展 $(u,1)$ 时只需要关心「第 $0$ 层还没有被访问过」的站点。维护集合 $S$ 表示所有第 $0$ 层尚未到达的站点，扩展 $(u,1)$ 时：

1. 标记 $u$ 以及 $u$ 的所有邻点：它们与 $u$ 之间有线路，本次不能到达；$u$ 自己也不能作为目标；
2. 扫描 $S$，未被标记的站点本次全部可达，把它们从 $S$ 中删掉并以距离 $+1$ 加入第 $0$ 层的队列，被标记的站点继续留在 $S$ 里。

关键在于这次扫描的代价可以摊还。设扫描时集合大小为 $|S|$，则

$$|S| = \text{本次删除的站点数} + \text{本次保留的站点数},$$

而本次保留的站点一定是 $u$ 的邻点或 $u$ 本身。

- 每个站点至多被删除一次，所以「删除」的总量是 $O(n)$；
- 被保留的邻点不超过 $\deg(u)$ 个，而每个站点的第 $1$ 层状态至多出队一次，所以「保留」的总量是 $O(n+m)$；
- 出队的第 $1$ 层状态本身也只有 $O(n)$ 个。

再加上遍历原图邻接表的总量 $O(m)$，整个过程就是线性的。

实现上用带哨兵的双向链表维护 $S$，可以 $O(1)$ 删除任意元素，扫描时沿后继指针走；标记写在全局数组里，值取「时间戳」以便省去每次清空。$n=1$ 时起点即终点，BFS 一开始就会弹出目标，自然得到 $0$。

## 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

## 仓颉实现

$n,m$ 都到 $10^6$，读入必须一次性读入所有字节后手写扫描解析，逐行读会超时。为压住内存，站点编号与距离都用 `UInt32` 存储，邻接表用 CSR 结构（先统计度数并原地做前缀和，再用位置指针填边）；集合 $S$ 用双向链表，标记数组用时间戳复用。距离数组把两层状态压在一起，`vis[2u+t]` 存距离 $+1$，为 $0$ 表示未访问。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0
var glen: Int64 = 0

func nextInt(): Int64 {
    while (gpos < glen) {
        if (Int64(gdata[gpos]) > 32) {
            break
        }
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < glen) {
        let b = Int64(gdata[gpos])
        if (b <= 32) {
            break
        }
        x = x * 10 + b - 48
        gpos += 1
    }
    return x
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    glen = gdata.size
    let n = nextInt()
    let m = nextInt()

    // 读边，统计度数
    var eu = Array<UInt32>(m, { _ => UInt32(0) })
    var ev = Array<UInt32>(m, { _ => UInt32(0) })
    var deg = Array<UInt32>(n + 1, { _ => UInt32(0) })
    var i: Int64 = 0
    while (i < m) {
        let a = nextInt() - 1
        let b = nextInt() - 1
        eu[i] = UInt32(a)
        ev[i] = UInt32(b)
        deg[a + 1] += UInt32(1)
        deg[b + 1] += UInt32(1)
        i += 1
    }
    // deg 原地转前缀和，成为 CSR 的块起点数组
    var v: Int64 = 1
    while (v <= n) {
        deg[v] += deg[v - 1]
        v += 1
    }
    var cur = Array<UInt32>(n + 1, { _ => UInt32(0) })
    v = 0
    while (v <= n) {
        cur[v] = deg[v]
        v += 1
    }
    // 建 CSR 邻接表
    var adj = Array<UInt32>(2 * m, { _ => UInt32(0) })
    i = 0
    while (i < m) {
        let a = Int64(eu[i])
        let b = Int64(ev[i])
        adj[Int64(cur[a])] = UInt32(b)
        cur[a] += UInt32(1)
        adj[Int64(cur[b])] = UInt32(a)
        cur[b] += UInt32(1)
        i += 1
    }
    eu = Array<UInt32>(0, { _ => UInt32(0) })
    ev = Array<UInt32>(0, { _ => UInt32(0) })
    cur = Array<UInt32>(0, { _ => UInt32(0) })
    gdata = Array<Byte>(0, { _ => 0 })
    glen = 0

    // 未访问的第 0 层站点集合 S，用带哨兵 n 的双向链表维护
    let sent = n
    var nxt = Array<UInt32>(n + 1, { _ => UInt32(0) })
    var prv = Array<UInt32>(n + 1, { _ => UInt32(0) })
    v = 0
    while (v < n) {
        nxt[v] = UInt32(v + 1)
        v += 1
    }
    prv[0] = UInt32(n)
    v = 1
    while (v < n) {
        prv[v] = UInt32(v - 1)
        v += 1
    }
    nxt[sent] = UInt32(sent)
    prv[sent] = UInt32(n - 1)
    // 起点 1 号站点的第 0 层状态初始距离为 0，先从 S 中摘掉
    let p0 = Int64(prv[0])
    let n0 = Int64(nxt[0])
    nxt[p0] = UInt32(n0)
    prv[n0] = UInt32(p0)

    let target = n - 1
    // vis[2u+t] = 状态 (u,t) 的距离 + 1，0 表示未访问
    var vis = Array<UInt32>(2 * n, { _ => UInt32(0) })
    var q = Array<UInt32>(2 * n + 1, { _ => UInt32(0) })
    var mark = Array<UInt32>(n, { _ => UInt32(0) })
    var stamp: UInt32 = 0
    vis[0] = UInt32(1)
    var qh: Int64 = 0
    var qt: Int64 = 1
    var ans: Int64 = -1
    while (qh < qt) {
        let s = Int64(q[qh])
        qh += 1
        let u = s >> 1
        if (u == target) {
            ans = Int64(vis[s]) - 1
            qh = qt
        } else if (s % 2 == 0) {
            // 状态 (u,0)：沿已有线路走到 (v,1)
            let nd = vis[s] + UInt32(1)
            var p = Int64(deg[u])
            let pe = Int64(deg[u + 1])
            while (p < pe) {
                let ns = Int64(adj[p]) * 2 + 1
                if (vis[ns] == UInt32(0)) {
                    vis[ns] = nd
                    q[qt] = UInt32(ns)
                    qt += 1
                }
                p += 1
            }
        } else {
            // 状态 (u,1)：走到所有与 u 没有线路且不是 u 的站点，取到其第 0 层状态
            stamp += UInt32(1)
            mark[u] = stamp
            var p = Int64(deg[u])
            let pe = Int64(deg[u + 1])
            while (p < pe) {
                mark[Int64(adj[p])] = stamp
                p += 1
            }
            let nd = vis[s] + UInt32(1)
            var x = Int64(nxt[sent])
            while (x != sent) {
                let y = Int64(nxt[x])
                if (mark[x] != stamp) {
                    let px = Int64(prv[x])
                    nxt[px] = UInt32(y)
                    prv[y] = UInt32(px)
                    vis[x * 2] = nd
                    q[qt] = UInt32(x * 2)
                    qt += 1
                }
                x = y
            }
        }
    }
    println(ans)
}
```

</details>
