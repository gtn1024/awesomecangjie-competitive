---
oj: dmy
pid: '190'
title: '[R31E]翻转'
difficulty: 提高
tags:
  - 图论
  - 最短路
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定一个包含 $n$ 个顶点和 $m$ 条边的简单有向图。每条边 $u \to v$ 都有一个翻转代价 $w$，表示将这条边翻转成 $v \to u$ 所需的代价。保证若存在边 $u \to v$，则一定不存在反向边 $v \to u$。

可以执行任意次翻转操作：每次选择一条边 $u \to v$，支付其翻转代价 $w$，将其方向翻转成 $v \to u$。对于每个顶点 $i$，求最少需要多少代价才能使图中存在一个包含顶点 $i$ 的有向环，不可能则输出 $-1$。

> 对于 $100\%$ 的数据，$1\le n\le 100$，$1\le m\le \frac{n(n-1)}{2}$，$1\le w_i\le 10^9$。附加分 $n\le 200$。

## 思路

把每条物理边 $\{u,v\}$（原方向 $u\to v$，翻转代价 $w$）在一张「代价图」里建成两条弧：沿原方向 $u\to v$ 代价为 $0$，沿翻转方向 $v\to u$ 代价为 $w$。一次翻转操作决定该边的最终方向，因此一个合法方案对应代价图中的一个简单有向环，环上每条弧按其方向付费，且同一物理边至多被环使用一次。

对顶点 $i$ 的回答就是「经过 $i$ 的最小费用简单环」。任意一个这样的环都可拆成

$$
i \xrightarrow{\,} a \longrightarrow \cdots \longrightarrow b \xrightarrow{\,} i,
$$

其中 $a\ne b$。若 $a=b$，则环退化成 $i\to a\to i$，两次使用了同一条物理边 $\{i,a\}$，不合法，这种称为「幻影环」。于是

$$
\text{answer}[i]
=\min_{\substack{a\ne b\\\text{弧 }i\to a,\,b\to i\text{ 存在}}}
\Big(\text{cost}(i\to a)+\text{dist}_{V\setminus i}(a,b)+\text{cost}(b\to i)\Big),
$$

其中 $\text{dist}_{V\setminus i}(a,b)$ 是在去掉顶点 $i$ 的代价图上从 $a$ 到 $b$ 的最短路径。

对每个 $i$ 做一次多源 Dijkstra：把 $i$ 的所有邻居 $a$ 作为源点，初始距离取 $\text{cost}(i\to a)$，并维护每个点「距离最小的两个状态」——分别记录距离和这条路径的 **首个源点**，要求两个状态的首源不同。这样对任意目标 $b$，只要取首源 $\ne b$ 的那个状态，就能自然避开「$a=b$」的幻影环。最终把 $\text{dist}(b)+\text{cost}(b\to i)$ 对所有合法 $b$ 取最小即可。

维护「次优」时按首个源点分类讨论：若新状态的源点等于已有最优状态的源点，只更新最优；否则新状态可能晋升为新的最优、原最优降为次优，或更新次优。

$n\le 200$ 时每个 $i$ 的 Dijkstra 用 $O(n^2)$ 扫描选最小值实现，总复杂度 $O(n^3)$。

## 复杂度

- 时间复杂度：$O(n^3)$。
- 空间复杂度：$O(n^2)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

// P190 [R31E]翻转
//
// 每条物理边 {u,v}（原方向 u->v，翻转代价 w）在"代价图"中有两条弧：
//   u->v 代价 0，v->u 代价 w。
// 一次翻转决定该边最终方向，因此一个可行方案 = 一个简单有向环，环上每条边按
// 其使用方向付费，且同一物理边至多被环使用一次。
//
// 对顶点 i 的回答：最小费用简单环（经过 i）。
// 环 = i -> a -> (不经过 i 的路径) -> b -> i，其中 a != b（a == b 会两次使用
// 物理边 {i,a}，不可行，即"幻影环" i->v->i）。
// 故 answer[i] = min_{a != b, 弧 i->a、b->i 存在} cost(i->a) + dist_{V\i}(a,b) + cost(b->i)。
//
// 对每个 i 做一次多源 Dijkstra（图去掉顶点 i）：源点 a 的初始距离 = cost(i->a)，
// 并记录每个点两条最优状态（距离, 首个源点），首源不同。对目标 b 取"首源 != b"
// 的最优距离，避免幻影环。
//
// n <= 200，每个 i 的 Dijkstra 用 O(n^2) 扫描实现，总 O(n^3)。

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let INF = Int64(1) << 60

    // cost[x][y]：把物理边 {x,y} 以 x->y 方向使用的代价（原方向 0，翻转 w），无边为 INF
    let cost = Array<Array<Int64>>(n, { _ => Array<Int64>(n, { _ => INF }) })
    for (i in 0..m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = line[0] - 1
        let v = line[1] - 1
        let w = line[2]
        cost[u][v] = 0
        cost[v][u] = w
    }

    for (i in 0..n) {
        var ans = INF
        let dist1 = Array<Int64>(n, { _ => INF })   // 到 v 的最优距离及其首个源点
        let src1 = Array<Int64>(n, { _ => -1 })
        let dist2 = Array<Int64>(n, { _ => INF })   // 首源与 src1 不同的次优
        let src2 = Array<Int64>(n, { _ => -1 })
        let done1 = Array<Bool>(n, { _ => false })
        let done2 = Array<Bool>(n, { _ => false })

        // 源点：i 的所有邻居 a，初始距离 cost(i->a)
        for (a in 0..n) {
            if (cost[i][a] < INF) {
                dist1[a] = cost[i][a]
                src1[a] = a
            }
        }

        // 扫描式 Dijkstra：每次取未完成状态中距离最小者
        while (true) {
            var bv = -1
            var bsecond = false
            var bd = INF
            for (v in 0..n) {
                if (!done1[v] && dist1[v] < bd) {
                    bd = dist1[v]
                    bv = v
                    bsecond = false
                }
                if (!done2[v] && dist2[v] < bd) {
                    bd = dist2[v]
                    bv = v
                    bsecond = true
                }
            }
            if (bv < 0) {
                break
            }
            let d = bd
            var s = src1[bv]
            if (bsecond) {
                s = src2[bv]
            }
            if (bsecond) {
                done2[bv] = true
            } else {
                done1[bv] = true
            }
            // 松弛
            for (to in 0..n) {
                if (to == i) {
                    continue
                }
                let c = cost[bv][to]
                if (c >= INF) {
                    continue
                }
                let nd = d + c
                if (s == src1[to]) {
                    if (nd < dist1[to]) {
                        dist1[to] = nd
                    }
                } else if (s == src2[to]) {
                    if (nd < dist1[to]) {
                        // 比当前最优还优：晋升为第一优，原第一优降为第二优
                        dist2[to] = dist1[to]
                        src2[to] = src1[to]
                        dist1[to] = nd
                        src1[to] = s
                    } else if (nd < dist2[to]) {
                        dist2[to] = nd
                    }
                } else {
                    if (nd < dist1[to]) {
                        dist2[to] = dist1[to]
                        src2[to] = src1[to]
                        dist1[to] = nd
                        src1[to] = s
                    } else if (nd < dist2[to]) {
                        dist2[to] = nd
                        src2[to] = s
                    }
                }
            }
        }

        // 目标 b：弧 b->i，取"首源 != b"的最优距离
        for (b in 0..n) {
            if (cost[b][i] >= INF) {
                continue
            }
            var cand = INF
            if (src1[b] != b) {
                cand = dist1[b]
            } else if (dist2[b] < INF) {
                cand = dist2[b]
            }
            if (cand >= INF) {
                continue
            }
            let tot = cand + cost[b][i]
            if (tot < ans) {
                ans = tot
            }
        }

        if (i > 0) {
            print(" ")
        }
        if (ans >= INF) {
            print(-1)
        } else {
            print(ans)
        }
    }
    println()
}
```

</details>
