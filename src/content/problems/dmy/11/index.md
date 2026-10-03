---
oj: dmy
pid: '11'
title: '[R2E] 路线规划'
difficulty: 提高
tags:
  - 最短路
  - 状态压缩
  - 图结构
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le m \le 2 \times 10^5$，$1 \le k \le \min(10,n)$，$1 \le w_i \le 10^9$。

## 思路

路线必然只由「点 $1$ 与 $k$ 个必经点之间」的最短路拼接而成，所以：

1. 分别以点 $1$ 和每个 $a_i$ 为源点跑 $k+1$ 次 Dijkstra，得到 $(k+1) \times (k+1)$ 的距离矩阵 $d$（不可达记为 $-1$）。
2. 用 **状压 DP** 求经过所有点的最短闭合路线（TSP 变形）：$dp[mask][i]$ 表示已访问集合 $mask$（包含起点 $0$）且最后位于 $i$ 的最短距离，转移枚举下一个未访问点 $j$：
   $$dp[mask \cup \{j\}][j] = \min(dp[mask][i] + d[i][j])$$
3. 答案 $\min_i dp[full][i] + d[i][0]$，无解输出 $-1$。

复杂度：时间 $O(k m \log n + 2^k k^2)$，空间 $O(n + 2^k k)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

class MinHeap {
    var d = Array<Int64>(300000, { _ => 0 })
    var v = Array<Int64>(300000, { _ => 0 })
    var size: Int64 = 0
    func push(pd: Int64, pv: Int64) {
        var i = size
        size += 1
        while (i > 0) {
            let p = (i - 1) / 2
            if (d[p] <= pd) {
                break
            }
            d[i] = d[p]
            v[i] = v[p]
            i = p
        }
        d[i] = pd
        v[i] = pv
    }
    func pop(): (Int64, Int64) {
        let res = (d[0], v[0])
        size -= 1
        let lastD = d[size]
        let lastV = v[size]
        var i: Int64 = 0
        while (true) {
            let l = 2 * i + 1
            if (l >= size) {
                break
            }
            let r = l + 1
            var m = l
            if (r < size && d[r] < d[l]) {
                m = r
            }
            if (d[m] >= lastD) {
                break
            }
            d[i] = d[m]
            v[i] = v[m]
            i = m
        }
        d[i] = lastD
        v[i] = lastV
        return res
    }
}

func dijkstra(s: Int64, n: Int64, adj: Array<ArrayList<Int64>>, heap: MinHeap): Array<Int64> {
    var dist = Array<Int64>(n + 1, { _ => -1 })
    dist[s] = 0
    heap.size = 0
    heap.push(0, s)
    while (heap.size > 0) {
        let (d, u) = heap.pop()
        if (d != dist[u]) {
            continue
        }
        let edges = adj[u]
        var i: Int64 = 0
        while (i < edges.size) {
            let v = edges[i]
            let w = edges[i + 1]
            if (dist[v] < 0 || d + w < dist[v]) {
                dist[v] = d + w
                heap.push(dist[v], v)
            }
            i += 2
        }
    }
    return dist
}

main() {
    let reader = getStdIn()
    let nmk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nmk[0]
    let m = nmk[1]
    let k = nmk[2]
    let kk = k
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var adj = Array<ArrayList<Int64>>(nn + 1, { _ => ArrayList<Int64>() })
    for (_ in 0..m) {
        let uvw = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let u = uvw[0]
        let v = uvw[1]
        let w = uvw[2]
        adj[u].add(v)
        adj[u].add(w)
    }
    // 源点：0 号是点 1，1..k 是 a_i
    var srcs = Array<Int64>(kk + 1, { _ => 0 })
    srcs[0] = 1
    for (i in 0..kk) {
        srcs[i + 1] = a[i]
    }
    var dmat = Array<Array<Int64>>(kk + 1, { _ => Array<Int64>(kk + 1, { _ => 0 }) })
    var heap = MinHeap()
    for (s in 0..=kk) {
        let dist = dijkstra(srcs[s], nn, adj, heap)
        for (t in 0..=kk) {
            dmat[s][t] = dist[srcs[t]]
        }
    }
    // 状压 DP
    let full = 1 << (kk + 1)
    var dp = Array<Array<Int64>>(full, { _ => Array<Int64>(kk + 1, { _ => -1 }) })
    dp[1][0] = 0
    for (mask in 1..full) {
        for (i in 0..=kk) {
            if ((mask & (1 << i)) == 0) {
                continue
            }
            let cur = dp[mask][i]
            if (cur < 0) {
                continue
            }
            for (j in 0..=kk) {
                if ((mask & (1 << j)) != 0) {
                    continue
                }
                let dd = dmat[i][j]
                if (dd < 0) {
                    continue
                }
                let nm = mask | (1 << j)
                let nd = cur + dd
                if (dp[nm][j] < 0 || nd < dp[nm][j]) {
                    dp[nm][j] = nd
                }
            }
        }
    }
    var ans: Int64 = -1
    for (i in 0..=kk) {
        let cur = dp[full - 1][i]
        if (cur < 0) {
            continue
        }
        let back = dmat[i][0]
        if (back < 0) {
            continue
        }
        let nd = cur + back
        if (ans < 0 || nd < ans) {
            ans = nd
        }
    }
    println(ans)
}
```

</details>

要点：

- `std.collection` 没有优先队列，Dijkstra 用 **手写二叉堆**（小顶堆），每个堆元素是（距离，节点）二元组，重复的旧距离出堆后直接跳过。
- 距离和用 `Int64`（$w_i$ 可达 $10^9$，路径总长可达 $10^{14}$）；不可达用 $-1$ 标记，转移时跳过。
- 边以「点 → `ArrayList` 中连续存放的 `(v, w)`」的邻接表保存。
