---
oj: dmy
pid: '378'
title: '[R60F] 最短路'
difficulty: 普及+/提高
tags:
  - 最短路
  - 分层图
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2 \times 10^5$，$1 \le m \le 2 \times 10^5$，$1 \le w_i,r_i,b_i \le 10^9$，且对所有边有 $w_i \ge \max(r_i,b_i)$。

## 思路

一条从 $1$ 到 $n$ 的路径 $P$，在染色方案下的权值为

$$\sum_{e \in P} w_e - \max_{e \in P \cap R} r_e - \max_{e \in P \cap B} b_e$$

要让权值尽量小，就要让 $\max r_e + \max b_e$ 尽量大。可以把这两个扣减看成路径上可选的**两张优惠券**：红色优惠券选一条边抵扣 $r_e$，蓝色优惠券选一条边抵扣 $b_e$，同一条边不能同时使用两张券，两种券也都允许不使用。

任意染色方案都能对应一个券方案（用红边中 $r$ 最大的边和蓝边中 $b$ 最大的边来抵扣），且权值相等；反过来，任意券方案按使用券的边染色后，路径权值不会比券方案小。而最短路只关心最小值，所以两者的最优值相同。

于是问题变成分层图最短路：状态 $(u, mask)$ 表示当前在点 $u$，$mask$ 记录两张券的使用情况（第 $0$ 位为红券、第 $1$ 位为蓝券）。对原图每条边 $u \to v$（属性 $w, r, b$）有三种转移：

1. 不用券：$(u, mask) \to (v, mask)$，代价 $w$；
2. 若红券未用（$(mask \mathbin{\&} 1) = 0$）：$(u, mask) \to (v, mask \mathbin{|} 1)$，代价 $w - r$；
3. 若蓝券未用（$(mask \mathbin{\&} 2) = 0$）：$(u, mask) \to (v, mask \mathbin{|} 2)$，代价 $w - b$。

由于 $w_i \ge \max(r_i, b_i)$，分层图中所有边权非负，直接跑 Dijkstra。答案取 $\min_{mask} dist[n][mask]$。最短路允许走环没有问题：所有代价非负，删去环不会让总代价变大，且券是可选用的，因此最优解一定能对应到简单路径。

分层图有 $4n$ 个点，每条原图边对应常数条转移，复杂度 $O(m \log n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

class MinHeap {
    var hd: Array<Int64>
    var hv: Array<Int64>
    var sz: Int64

    init(cap: Int64) {
        let c = cap
        hd = Array<Int64>(c, { _ => 0 })
        hv = Array<Int64>(c, { _ => 0 })
        sz = 0
    }

    func push(d: Int64, v: Int64): Unit {
        sz += 1
        var i = sz
        while (i > 1) {
            let p = i / 2
            if (hd[p] <= d) {
                break
            }
            hd[i] = hd[p]
            hv[i] = hv[p]
            i = p
        }
        hd[i] = d
        hv[i] = v
    }

    func pop(): (Int64, Int64) {
        let topd = hd[1]
        let topv = hv[1]
        let lastd = hd[sz]
        let lastv = hv[sz]
        sz -= 1
        var i = 1
        while (i * 2 <= sz) {
            var c = i * 2
            if (c + 1 <= sz && hd[c + 1] < hd[c]) {
                c += 1
            }
            if (hd[c] < lastd) {
                hd[i] = hd[c]
                hv[i] = hv[c]
                i = c
            } else {
                break
            }
        }
        hd[i] = lastd
        hv[i] = lastv
        return (topd, topv)
    }

    func empty(): Bool {
        return sz == 0
    }
}

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]

    let head = Array<Int64>(n, { _ => -1 })
    let to = Array<Int64>(m, { _ => 0 })
    let nxt = Array<Int64>(m, { _ => 0 })
    let ew = Array<Int64>(m, { _ => 0 })
    let er = Array<Int64>(m, { _ => 0 })
    let eb = Array<Int64>(m, { _ => 0 })
    var cnt = 0
    var i = 0
    while (i < m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = line[0] - 1
        let v = line[1] - 1
        to[cnt] = v
        ew[cnt] = line[2]
        er[cnt] = line[3]
        eb[cnt] = line[4]
        nxt[cnt] = head[u]
        head[u] = cnt
        cnt += 1
        i += 1
    }

    let V = 4 * n
    let INF = 4611686018427387904
    let dist = Array<Int64>(V, { _ => INF })
    let heap = MinHeap(12 * m + 10)

    dist[0] = 0
    heap.push(0, 0)
    while (!heap.empty()) {
        let (d, u) = heap.pop()
        if (d != dist[u]) {
            continue
        }
        let mask = u / n
        let x = u % n
        var e = head[x]
        while (e != -1) {
            let v = to[e]
            let w = ew[e]
            let nd0 = d + w
            let id0 = mask * n + v
            if (nd0 < dist[id0]) {
                dist[id0] = nd0
                heap.push(nd0, id0)
            }
            if ((mask & 1) == 0) {
                let nd1 = d + w - er[e]
                let id1 = (mask | 1) * n + v
                if (nd1 < dist[id1]) {
                    dist[id1] = nd1
                    heap.push(nd1, id1)
                }
            }
            if ((mask & 2) == 0) {
                let nd2 = d + w - eb[e]
                let id2 = (mask | 2) * n + v
                if (nd2 < dist[id2]) {
                    dist[id2] = nd2
                    heap.push(nd2, id2)
                }
            }
            e = nxt[e]
        }
    }

    var ans = INF
    var mask = 0
    while (mask < 4) {
        let d = dist[mask * n + n - 1]
        if (d < ans) {
            ans = d
        }
        mask += 1
    }
    println(ans)
}
```

</details>
