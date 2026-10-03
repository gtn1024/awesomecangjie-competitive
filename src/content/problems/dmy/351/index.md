---
oj: dmy
pid: '351'
title: '[R56D] 轨道网络'
difficulty: 普及+/提高
tags:
  - 图论
  - BFS
  - 最短路
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2 \times 10^5$，$0 \le m_1, m_2 \le 2 \times 10^5$。

## 思路

A、B 两个网络各自都是边权为 $1$ 的**无向**图，最短路即 BFS 距离。限制是全程至多换乘一次，因此任意合法路径只有三种形态：全程 A、全程 B，以及「先走 A 再换 B」或「先走 B 再换 A」（在换乘点之前只能坐一类车，之后只能坐另一类车，且换乘只发生一次，路径在换乘点处拼接）。

分别对两个图做 BFS：

- $da_1[u]$：A 网络中 $1$ 到 $u$ 的距离；
- $db_1[u]$：B 网络中 $1$ 到 $u$ 的距离；
- $da_n[u]$：A 网络中 $u$ 到 $n$ 的距离（无向图，等价于从 $n$ 出发 BFS）；
- $db_n[u]$：B 网络中 $u$ 到 $n$ 的距离。

答案为

$$
\min\Big(\min_u(db_1[u] + da_n[u]),\ \min_u(da_1[u] + db_n[u]),\ da_1[n],\ db_1[n]\Big)
$$

其中 $db_1[u] + da_n[u]$ 表示从 $1$ 坐 B 到 $u$ 后换乘 A 到达 $n$，$da_1[u] + db_n[u]$ 表示先 A 后 B；$u$ 取 $1$ 或 $n$ 时退化为全程单类车，已由后两项覆盖，故全部取 $\min$ 即可。不可达的点距离记为无穷大，若四项均为无穷大则输出 $-1$。

复杂度：时间 $O(n + m_1 + m_2)$（四趟 BFS），空间 $O(n + m_1 + m_2)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

let INF: Int64 = 1_000_000_000

// 在图 (head/to/nxt) 上从 src 出发 BFS，返回到每个点的最短路
func bfs(n: Int64, head: Array<Int64>, to: Array<Int64>, nxt: Array<Int64>, src: Int64): Array<Int64> {
    let dist = Array<Int64>(n + 1, { _ => INF })
    dist[src] = 0
    let queue = ArrayList<Int64>()
    queue.add(src)
    var qi: Int64 = 0
    while (qi < queue.size) {
        let u = queue[qi]
        qi += 1
        var e = head[u]
        while (e != 0) {
            let v = to[e]
            if (dist[v] == INF) {
                dist[v] = dist[u] + 1
                queue.add(v)
            }
            e = nxt[e]
        }
    }
    return dist
}

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m1 = nm[1]
    let m2 = nm[2]

    // 建 A 网络
    let headA = Array<Int64>(n + 1, { _ => 0 })
    let toA = Array<Int64>(2 * m1 + 1, { _ => 0 })
    let nxtA = Array<Int64>(2 * m1 + 1, { _ => 0 })
    var ecA: Int64 = 0
    for (i in 0..m1) {
        let uv = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = uv[0]
        let v = uv[1]
        ecA += 1
        toA[ecA] = v
        nxtA[ecA] = headA[u]
        headA[u] = ecA
        ecA += 1
        toA[ecA] = u
        nxtA[ecA] = headA[v]
        headA[v] = ecA
    }

    // 建 B 网络
    let headB = Array<Int64>(n + 1, { _ => 0 })
    let toB = Array<Int64>(2 * m2 + 1, { _ => 0 })
    let nxtB = Array<Int64>(2 * m2 + 1, { _ => 0 })
    var ecB: Int64 = 0
    for (i in 0..m2) {
        let uv = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = uv[0]
        let v = uv[1]
        ecB += 1
        toB[ecB] = v
        nxtB[ecB] = headB[u]
        headB[u] = ecB
        ecB += 1
        toB[ecB] = u
        nxtB[ecB] = headB[v]
        headB[v] = ecB
    }

    let da1 = bfs(n, headA, toA, nxtA, 1)  // A 网络中从 1 出发
    let db1 = bfs(n, headB, toB, nxtB, 1)  // B 网络中从 1 出发
    let dan = bfs(n, headA, toA, nxtA, n)  // A 网络中从 n 出发
    let dbn = bfs(n, headB, toB, nxtB, n)  // B 网络中从 n 出发

    var ans = INF
    if (da1[n] < ans) { ans = da1[n] }
    if (db1[n] < ans) { ans = db1[n] }
    for (u in 1..n + 1) {
        if (db1[u] < INF && dan[u] < INF) {
            let c = db1[u] + dan[u]
            if (c < ans) { ans = c }
        }
        if (da1[u] < INF && dbn[u] < INF) {
            let c = da1[u] + dbn[u]
            if (c < ans) { ans = c }
        }
    }
    if (ans >= INF) { println(-1) } else { println(ans) }
}
```

</details>

要点：

- 换乘最多一次，等价于路径由「一类车的一段」和「另一类车的一段」拼接而成，因此两个「从 1 出发」和两个「从 $n$ 出发」的 BFS 距离即可覆盖所有情况，无需建四层分层图。
- 图是无向的，从 $n$ 出发的 BFS 直接得到各点到 $n$ 的最短路。
