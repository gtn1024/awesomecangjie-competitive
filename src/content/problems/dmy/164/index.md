---
oj: dmy
pid: '164'
title: '[R27D]骑行挑战赛'
difficulty: 提高
tags:
  - 最短路
  - 分层图
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2 \times 10^5$，$1 \le m \le 2 \times 10^5$，$1 \le w \le 10^9$，保证从 $1$ 号点至少存在一条路径可以到达 $n$ 号点。

## 思路

「蓄力冲刺」是一个跨越**连续两条边**的技巧：第一条边时间翻倍（蓄力），到达后下一条边免费（冲刺），然后恢复正常。技巧可以无限次发动，且两次发动之间可以穿插普通骑行。

把骑行时的「瞬时状态」提取出来作为分层图的层数。一个技巧跨越两条边，但中间到达城市后状态会从「蓄力中」变为「冲刺中」，而「冲刺中」又必然紧接一条边并马上变回「正常」。注意到从「正常」出发的下一阶段只有两类：

- 普通骑行一条边，回到「正常」；
- 蓄力骑行一条边（时间 $\times 2$），到达对面城市后进入「冲刺待发」状态。

而「冲刺待发」状态只会走一条边（时间为 $0$）就回到「正常」。因此只有**两个有效状态**：

- 状态 $0$：正常状态，在当前城市，可任意发动技巧；
- 状态 $1$：刚蓄力到达当前城市，下一条边免费冲刺，之后恢复正常。

把图复制成两层，节点为 $(u, s)$，其中 $s \in \{0, 1\}$。对原图每条边 $u \leftrightarrow v$（权 $w$），有三种转移：

1. 普通骑行：$(u, 0) \to (v, 0)$，代价 $w$；
2. 蓄力骑行：$(u, 0) \to (v, 1)$，代价 $2w$（蓄力使本边翻倍，到达 $v$ 后获得冲刺待发状态）；
3. 冲刺骑行：$(u, 1) \to (v, 0)$，代价 $0$（冲刺免费），到达后恢复正常。

所有边权（$w$、$2w$、$0$）非负，直接对分层图跑 Dijkstra。答案取 $\min(dist[n][0], dist[n][1])$。

「冲刺必须立刻使用」的约束已被自然建模：状态 $1$ 只能通过代价 $0$ 的冲刺边离开，不会有「蓄力后攒着不冲刺」的非法状态。又因为每条转移非负，最优解中走环不会更优，所以答案一定对应合法的骑行序列。

分层图共 $2n$ 个点、$O(m)$ 条转移边，复杂度 $O(m \log n)$。

以样例验证：最优方案为「$1$ 蓄力走 $1 \to 2$（$20$）到达 $2$（状态 $1$）→ 冲刺走 $2 \to 3$（$0$）到达 $3$（状态 $0$）→ 普通走 $3 \to 4$（$10$）」，总时间 $20 + 0 + 10 = 30$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

// 最小堆，按距离 d 排序，值是分层图节点编号 v
class MinHeap {
    let hd: Array<Int64>
    let hv: Array<Int64>
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

main(): Int64 {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]

    // 链式前向星存图，双向边各存一份
    let em = 2 * m
    let head = Array<Int64>(n, { _ => -1 })
    let to = Array<Int64>(em, { _ => 0 })
    let w = Array<Int64>(em, { _ => 0 })
    let nxt = Array<Int64>(em, { _ => 0 })
    var cnt = 0
    var i = 0
    while (i < m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = line[0] - 1
        let v = line[1] - 1
        let ww = line[2]
        to[cnt] = v
        w[cnt] = ww
        nxt[cnt] = head[u]
        head[u] = cnt
        cnt += 1
        to[cnt] = u
        w[cnt] = ww
        nxt[cnt] = head[v]
        head[v] = cnt
        cnt += 1
        i += 1
    }

    // 分层图：状态 0 = 正常，状态 1 = 蓄力后待冲刺（下一条边免费）
    // 节点编号 = state * n + x
    let INF = 4611686018427387904
    let dist0 = Array<Int64>(n, { _ => INF }) // state 0
    let dist1 = Array<Int64>(n, { _ => INF }) // state 1
    let heap = MinHeap(6 * m + 16)

    dist0[0] = 0
    heap.push(0, 0) // (d, state*n+x)；state 0，x=0
    while (!heap.empty()) {
        let (d, node) = heap.pop()
        let state = node / n
        let x = node % n
        var cur: Int64
        if (state == 0) {
            cur = dist0[x]
        } else {
            cur = dist1[x]
        }
        if (d != cur) {
            continue
        }
        var e = head[x]
        while (e != -1) {
            let y = to[e]
            let ww = w[e]
            if (state == 0) {
                // 普通骑行：(x,0) -> (y,0)，花费 ww
                let nd0 = d + ww
                if (nd0 < dist0[y]) {
                    dist0[y] = nd0
                    heap.push(nd0, y)
                }
                // 蓄力骑行：(x,0) -> (y,1)，花费 2*ww
                let nd1 = d + ww + ww
                if (nd1 < dist1[y]) {
                    dist1[y] = nd1
                    heap.push(nd1, n + y)
                }
            } else {
                // 冲刺骑行：(x,1) -> (y,0)，花费 0
                let nd0 = d
                if (nd0 < dist0[y]) {
                    dist0[y] = nd0
                    heap.push(nd0, y)
                }
            }
            e = nxt[e]
        }
    }

    var ans = dist0[n - 1]
    if (dist1[n - 1] < ans) {
        ans = dist1[n - 1]
    }
    println(ans)
    return 0
}
```
