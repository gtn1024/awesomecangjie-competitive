---
oj: dmy
pid: '24'
title: '[R4F] 交通问题'
difficulty: 入门
tags:
  - 图论
  - 最短路
timeLimit: 2s
memoryLimit: 512m
---

## 思路

$n$ 可达 $10^9$，不能建全图。路径只可能在起点、终点和可转向的路口改变方向，因此只保留这些点：同一条马路（同行或同列）上的相邻保留点之间连边，边权为坐标差；起点到终点直行（同行或同列）时，它们也是相邻保留点，会被自然覆盖。

$k = 0$ 时转向免费，方向无关紧要，直接在保留点上跑 Dijkstra 即可。

$k > 0$ 时每个路口拆成 4 个状态（对应四个行驶方向），边分为两类：

- 直线边：同一条马路上相邻的两个保留点，对应方向的 4 个状态之间连边（如 $(x_a, y)$ 与 $(x_b, y)$ 之间连「向右」和「向左」两个状态），边权为坐标差；
- 转向边：可转向路口拆出的 4 个状态两两连边，边权为 $k$。

起点 4 个状态的距离都初始化为 0（出发方向不限），终点取 4 个状态距离的最小值。不可达输出 $-1$。

每条马路只需连接相邻的保留点，边数 $O(m)$；总复杂度 $O(m \log m)$。

## 仓颉实现

```cangjie
import std.collection.*
import std.convert.*
import std.env.*
import std.sort.*

const SHIFT: Int64 = 30
const INF: Int64 = 4000000000000000000

func bsearch(a: Array<Int64>, n: Int64, v: Int64): Int64 {
    var lo: Int64 = 0
    var hi: Int64 = n - 1
    while (lo <= hi) {
        let mid = (lo + hi) / 2
        if (a[mid] == v) {
            return mid
        } else if (a[mid] < v) {
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return -1
}

func addEdge(to: Array<Array<Int64>>, w: Array<Array<Int64>>, deg: Array<Int64>, u: Int64, v: Int64, c: Int64) {
    to[u][deg[u]] = v
    w[u][deg[u]] = c
    deg[u] += 1
}

func heapPush(hd: Array<Int64>, hn: Array<Int64>, hs: Int64, d: Int64, u: Int64): Int64 {
    hd[hs] = d
    hn[hs] = u
    var i = hs
    while (i > 0) {
        let p = (i - 1) / 2
        if (hd[p] <= hd[i]) {
            break
        }
        let td = hd[p]
        hd[p] = hd[i]
        hd[i] = td
        let tn = hn[p]
        hn[p] = hn[i]
        hn[i] = tn
        i = p
    }
    return hs + 1
}

func heapPop(hd: Array<Int64>, hn: Array<Int64>, hs: Int64): (Int64, Int64, Int64) {
    let d = hd[0]
    let u = hn[0]
    let ns = hs - 1
    hd[0] = hd[ns]
    hn[0] = hn[ns]
    var i: Int64 = 0
    while (true) {
        let l = i * 2 + 1
        let r = i * 2 + 2
        var m = i
        if (l < ns && hd[l] < hd[m]) {
            m = l
        }
        if (r < ns && hd[r] < hd[m]) {
            m = r
        }
        if (m == i) {
            break
        }
        let td = hd[m]
        hd[m] = hd[i]
        hd[i] = td
        let tn = hn[m]
        hn[m] = hn[i]
        hn[i] = tn
        i = m
    }
    return (d, u, ns)
}

main() {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let m = l1[1]
    let k = l1[2]
    let mask = (Int64(1) << SHIFT) - 1
    let l2 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let sx = l2[0]
    let sy = l2[1]
    let tx = l2[2]
    let ty = l2[3]
    let allX = ArrayList<Int64>()
    let allY = ArrayList<Int64>()
    allX.add(sx)
    allY.add(sy)
    allX.add(tx)
    allY.add(ty)
    let turnE = ArrayList<Int64>()
    for (_ in 0..m) {
        let l = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        allX.add(l[0])
        allY.add(l[1])
        turnE.add((l[0] << SHIFT) | l[1])
    }
    let tAll = Int64(allX.size)
    let encs = Array<Int64>(tAll, { i => (allX[i] << SHIFT) | allY[i] })
    sort(encs)
    let uniq = Array<Int64>(tAll, { _ => 0 })
    var nNode: Int64 = 0
    for (i in 0..tAll) {
        if (nNode == 0 || encs[i] != uniq[nNode - 1]) {
            uniq[nNode] = encs[i]
            nNode += 1
        }
    }
    let sid = bsearch(uniq, nNode, (sx << SHIFT) | sy)
    let tid = bsearch(uniq, nNode, (tx << SHIFT) | ty)

    if (k == 0) {
        let adjTo = Array<Array<Int64>>(nNode, { _ => Array<Int64>(4, { _ => 0 }) })
        let adjW = Array<Array<Int64>>(nNode, { _ => Array<Int64>(4, { _ => 0 }) })
        let deg = Array<Int64>(nNode, { _ => 0 })
        var eCount: Int64 = 0
        var i: Int64 = 0
        while (i < nNode) {
            let x = uniq[i] >> SHIFT
            var j = i + 1
            while (j < nNode && (uniq[j] >> SHIFT) == x) {
                j += 1
            }
            for (t in i..(j - 1)) {
                let c = (uniq[t + 1] & mask) - (uniq[t] & mask)
                addEdge(adjTo, adjW, deg, t, t + 1, c)
                addEdge(adjTo, adjW, deg, t + 1, t, c)
                eCount += 2
            }
            i = j
        }
        let idx = Array<Int64>(nNode, { t => t })
        sort(idx, key: { t => (uniq[t] & mask) << SHIFT | (uniq[t] >> SHIFT) })
        i = 0
        while (i < nNode) {
            let y = uniq[idx[i]] & mask
            var j = i + 1
            while (j < nNode && (uniq[idx[j]] & mask) == y) {
                j += 1
            }
            for (t in i..(j - 1)) {
                let c = (uniq[idx[t + 1]] >> SHIFT) - (uniq[idx[t]] >> SHIFT)
                addEdge(adjTo, adjW, deg, idx[t], idx[t + 1], c)
                addEdge(adjTo, adjW, deg, idx[t + 1], idx[t], c)
                eCount += 2
            }
            i = j
        }
        let dist = Array<Int64>(nNode, { _ => INF })
        dist[sid] = 0
        let hd = Array<Int64>(eCount + 8, { _ => 0 })
        let hn = Array<Int64>(eCount + 8, { _ => 0 })
        var hs = heapPush(hd, hn, 0, 0, sid)
        var ans: Int64 = -1
        while (hs > 0) {
            let (d, u, hs2) = heapPop(hd, hn, hs)
            hs = hs2
            if (d != dist[u]) {
                continue
            }
            if (u == tid) {
                ans = d
                break
            }
            for (q in 0..deg[u]) {
                let v = adjTo[u][q]
                let nd = d + adjW[u][q]
                if (nd < dist[v]) {
                    dist[v] = nd
                    hs = heapPush(hd, hn, hs, nd, v)
                }
            }
        }
        println(ans)
    } else {
        let nState = nNode * 4
        let adjTo = Array<Array<Int64>>(nState, { _ => Array<Int64>(4, { _ => 0 }) })
        let adjW = Array<Array<Int64>>(nState, { _ => Array<Int64>(4, { _ => 0 }) })
        let deg = Array<Int64>(nState, { _ => 0 })
        var eCount: Int64 = 0
        var i: Int64 = 0
        while (i < nNode) {
            let x = uniq[i] >> SHIFT
            var j = i + 1
            while (j < nNode && (uniq[j] >> SHIFT) == x) {
                j += 1
            }
            for (t in i..(j - 1)) {
                let c = (uniq[t + 1] & mask) - (uniq[t] & mask)
                addEdge(adjTo, adjW, deg, t * 4 + 2, (t + 1) * 4 + 2, c)
                addEdge(adjTo, adjW, deg, (t + 1) * 4 + 3, t * 4 + 3, c)
                eCount += 2
            }
            i = j
        }
        let idx = Array<Int64>(nNode, { t => t })
        sort(idx, key: { t => (uniq[t] & mask) << SHIFT | (uniq[t] >> SHIFT) })
        i = 0
        while (i < nNode) {
            let y = uniq[idx[i]] & mask
            var j = i + 1
            while (j < nNode && (uniq[idx[j]] & mask) == y) {
                j += 1
            }
            for (t in i..(j - 1)) {
                let c = (uniq[idx[t + 1]] >> SHIFT) - (uniq[idx[t]] >> SHIFT)
                addEdge(adjTo, adjW, deg, idx[t] * 4, idx[t + 1] * 4, c)
                addEdge(adjTo, adjW, deg, idx[t + 1] * 4 + 1, idx[t] * 4 + 1, c)
                eCount += 2
            }
            i = j
        }
        for (e in turnE) {
            let t = bsearch(uniq, nNode, e) * 4
            for (p in 0..4) {
                for (q in (p + 1)..4) {
                    addEdge(adjTo, adjW, deg, t + p, t + q, k)
                    addEdge(adjTo, adjW, deg, t + q, t + p, k)
                    eCount += 2
                }
            }
        }
        let dist = Array<Int64>(nState, { _ => INF })
        let st = sid * 4
        for (p in 0..4) {
            dist[st + p] = 0
        }
        let hd = Array<Int64>(eCount + 8, { _ => 0 })
        let hn = Array<Int64>(eCount + 8, { _ => 0 })
        var hs: Int64 = 0
        for (p in 0..4) {
            hs = heapPush(hd, hn, hs, 0, st + p)
        }
        let tg = tid * 4
        var ans: Int64 = -1
        while (hs > 0) {
            let (d, u, hs2) = heapPop(hd, hn, hs)
            hs = hs2
            if (d != dist[u]) {
                continue
            }
            if (u >= tg && u < tg + 4) {
                ans = d
                break
            }
            for (q in 0..deg[u]) {
                let v = adjTo[u][q]
                let nd = d + adjW[u][q]
                if (nd < dist[v]) {
                    dist[v] = nd
                    hs = heapPush(hd, hn, hs, nd, v)
                }
            }
        }
        println(ans)
    }
}
```
