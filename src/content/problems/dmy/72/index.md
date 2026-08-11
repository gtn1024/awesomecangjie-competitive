---
oj: dmy
pid: '72'
title: '[R12F] 公交问题'
difficulty: 提高
tags:
  - 最短路
  - 图结构
  - 离散化
timeLimit: 2.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 5\times 10^4$，$1 \le m \le 3\times 10^5$，$1 \le k \le 10^6$，$0 \le a_i < k$，$1 \le t_i \le 10^9$。保证存在从站点 $1$ 到站点 $n$ 的方案，可能有重边或自环。

## 思路

第 $i$ 条公交路线在 $a_i, a_i+k, a_i+2k,\dots$ 发车，所以「在站点 $u_i$ 等到下一班 $i$ 号路线」这件事只取决于到达 $u_i$ 时的时间对 $k$ 取模的余数：若到达余数为 $r$，则需等待 $(a_i - r) \bmod k$。于是可以把状态写成 $(站点, 时间\bmod k)$，对余数这一维压缩。

朴素做法是给每个站点建 $k$ 个余数点（共 $n\times k$ 个点），但 $k$ 可达 $10^6$，规模过大。注意到真正会用到的余数只有每条路线的起点余数 $a_i$、终点余数 $(a_i+t_i)\bmod k$，以及起点 $(1,0)$，总数不超过 $2m+1$。所以只需**离散化**保留这些点。

建图：

- **公交边**：路线 $i$ 从 $(u_i, a_i)$ 到 $(v_i,(a_i+t_i)\bmod k)$，边权为 $0$。因为乘车不增加等待，到达端点余数恰好等于 $(a_i+t_i)\bmod k$；上车前的等待已经在起点站内通过「等待边」走完。
- **站点等待边**：对同一站点保留下的若干余数 $p_1<p_2<\dots<p_c$，相邻余数连 $p_j\to p_{j+1}$ 权值 $p_{j+1}-p_j$，再连一条环绕边 $p_c\to p_1$ 权值 $p_1+k-p_c$，表示在站点等到下一个余数。

答案即从 $(1,0)$ 出发到任意 $(n,\ast)$ 的最短路，用 Dijkstra 求解。离散化后点数约 $2m$，边数约 $3m$，复杂度 $O(m\log m)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*
import std.sort.*

const INF: Int64 = 4000000000000000000

// 小顶堆：元素为 (距离, 节点)
class MinHeap {
    var hd: Array<Int64>
    var hv: Array<Int64>
    var size: Int64 = 0
    public init(cap: Int64) {
        hd = Array<Int64>(cap, { _ => 0 })
        hv = Array<Int64>(cap, { _ => 0 })
    }
    func push(d: Int64, v: Int64): Unit {
        var i = size
        size += 1
        var dd = d
        var vv = v
        while (i > 0) {
            let p = (i - 1) / 2
            if (hd[p] <= dd) {
                break
            }
            hd[i] = hd[p]
            hv[i] = hv[p]
            i = p
        }
        hd[i] = dd
        hv[i] = vv
    }
    func pop(): (Int64, Int64) {
        let rd = hd[0]
        let rv = hv[0]
        size -= 1
        if (size > 0) {
            let ld = hd[size]
            let lv = hv[size]
            var i: Int64 = 0
            while (true) {
                let l = 2 * i + 1
                if (l >= size) {
                    break
                }
                let r = l + 1
                var m = l
                if (r < size && hd[r] < hd[l]) {
                    m = r
                }
                if (hd[m] >= ld) {
                    break
                }
                hd[i] = hd[m]
                hv[i] = hv[m]
                i = m
            }
            hd[i] = ld
            hv[i] = lv
        }
        return (rd, rv)
    }
}

main(): Int64 {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = line0[0]
    let m = line0[1]
    let k = line0[2]

    var aa = Array<Int64>(m, { _ => 0 })
    var uu = Array<Int64>(m, { _ => 0 })
    var vv = Array<Int64>(m, { _ => 0 })
    var tt = Array<Int64>(m, { _ => 0 })
    for (i in 0..m) {
        let row = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        aa[i] = row[0]
        uu[i] = row[1]
        vv[i] = row[2]
        tt[i] = row[3]
    }

    // 离散化 (站点, 余数)：pair = 站点 * MULT + 余数，余数范围 0..k-1
    let MULT = k + 1
    let pairs = ArrayList<Int64>()
    for (i in 0..m) {
        pairs.add(uu[i] * MULT + aa[i])
        pairs.add(vv[i] * MULT + ((aa[i] + tt[i]) % k))
    }
    pairs.add(1 * MULT + 0) // 起点 (1, 0)
    // 去重排序
    var arr = Array<Int64>(pairs.size, { i => pairs[i] })
    sort(arr)
    let uniq = ArrayList<Int64>()
    var prev: Int64 = -1
    for (x in arr) {
        if (x != prev) {
            uniq.add(x)
            prev = x
        }
    }
    let tot = uniq.size
    var pidArr = Array<Int64>(tot, { i => uniq[i] })

    // 二分查找节点 id（pair -> id）
    func findId(target: Int64): Int64 {
        var lo: Int64 = 0
        var hi: Int64 = tot - 1
        while (lo <= hi) {
            let mid = (lo + hi) / 2
            if (pidArr[mid] == target) {
                return mid
            } else if (pidArr[mid] < target) {
                lo = mid + 1
            } else {
                hi = mid - 1
            }
        }
        return -1
    }

    // 邻接表：每个节点存连续的 (to, w)
    var adj = Array<ArrayList<Int64>>(tot, { _ => ArrayList<Int64>() })

    // 公交边：权重 0
    for (i in 0..m) {
        let fp = uu[i] * MULT + aa[i]
        let tp = vv[i] * MULT + ((aa[i] + tt[i]) % k)
        let f = findId(fp)
        let t = findId(tp)
        adj[f].add(t)
        adj[f].add(0)
    }

    // 站点内等待边：相邻余数 p_j -> p_{j+1 mod c}，边权 = p_next - p_j（含环绕 p_1 + k - p_c）
    // pidArr 已按站点再按余数排序，按连续段处理
    var s: Int64 = 0
    while (s < tot) {
        let site = pidArr[s] / MULT
        var e = s
        while (e + 1 < tot && pidArr[e + 1] / MULT == site) {
            e += 1
        }
        // s..e 为同一站点的所有余数（升序）
        var j = s
        while (j <= e) {
            let nj = if (j == e) { s } else { j + 1 }
            let pr = pidArr[j] % MULT
            let npr = pidArr[nj] % MULT
            var w = npr - pr
            if (nj == s && j != s) {
                // 环绕：p_1 + k - p_c
                w = npr + k - pr
            }
            adj[j].add(nj)
            adj[j].add(w)
            j += 1
        }
        s = e + 1
    }

    // Dijkstra：起点 (1, 0)
    let startId = findId(1 * MULT + 0)
    var dist = Array<Int64>(tot, { _ => INF })
    dist[startId] = 0
    var heap = MinHeap(tot + 4)
    heap.push(0, startId)
    while (heap.size > 0) {
        let (d, u) = heap.pop()
        if (d != dist[u]) {
            continue
        }
        let edges = adj[u]
        var idx: Int64 = 0
        let esz = edges.size
        while (idx < esz) {
            let to = edges[idx]
            let w = edges[idx + 1]
            idx += 2
            let nd = d + w
            if (nd < dist[to]) {
                dist[to] = nd
                heap.push(nd, to)
            }
        }
    }

    // 答案：到达任意 (n, *) 的最短距离
    var ans: Int64 = INF
    var idx2: Int64 = 0
    while (idx2 < tot) {
        if (pidArr[idx2] / MULT == n) {
            if (dist[idx2] < ans) {
                ans = dist[idx2]
            }
        }
        idx2 += 1
    }
    println(ans)
    return 0
}
```

要点：

- 等待时间只与到达时的余数有关，所以状态设为 $(站点, 余数)$；$k$ 很大，不能给每个站点建满 $k$ 个点，只保留路线端点和起点对应的余数做**离散化**。
- 用一个编码 `pair = 站点 * (k+1) + 余数` 收集所有点，排序去重后即得编号；由于按 `pair` 升序排，同一站点的余数自然升序，便于连等待边。查找节点用二分。
- 公交边权为 $0$：上车前的等待由起点站内的等待边负责，乘车本身不增加等待。
- 等待边在相邻余数间相连，末位向首位环绕（权值 $p_1+k-p_c$），覆盖「跨过一轮 $k$」的情形。
- Dijkstra 用**手写小顶堆**（`std.collection` 没有优先队列），出堆时若距离已被更新则跳过。
