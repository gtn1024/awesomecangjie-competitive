---
oj: dmy
pid: '221'
title: '[R36F]运输线路'
difficulty: 提高+
tags:
  - 树
  - 树形 DP
  - 路径打包
  - 树状数组
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$n \le 2 \times 10^5$，$m \le 10^5$，$1 \le a_i, b_i \le 10^9$，$w_i$ 恰好在 $u_i, v_i$ 的路径上。

## 思路

每条线路有 3 种选择：双向（占用整个路径 $u_i \to v_i$，价值 $b_i$）、单向运到 $u_i$（占用 $w_i \to u_i$，价值 $a_i$）、单向运到 $v_i$（占用 $w_i \to v_i$，价值 $a_i$）。因为 $w_i$ 位于 $u_i, v_i$ 的路径上，这三个选项**都包含 $w_i$**，所以同一线路的选项天然互斥——「每个点最多被一条线路占用」的约束自动保证每条线路至多选一个选项。问题于是变成：**树上选若干条带权路径，顶点两两不相交，最大化总价值**。

### 正确 DP：必须精确追踪路径端点

朴素想法是给每个节点设「向上开口」的状态，但这是错的：父节点用它拼接路径时并不知道子树的路径终点在哪里，会把同一个点算进两条路径（例如一条线路只占用点 $x$，另一条线路的路径终点恰为 $x$，两者都被选中）。

正确做法是让路径的贡献精确落在其顶端（LCA）节点上。把树以 $1$ 为根。对每条线路的每个选项，设其顶端为 $t = \operatorname{lca}$（两个端点中较浅者，或就是 $t$ 本身），把选项挂在 $t$ 上。选项分三类：

- 无分支：路径就是单点 $t$（$w = u$ 或 $w = v$ 时的单向选项）；
- 单分支：$t$ 是端点，另一端 $x$ 在 $t$ 的某个儿子子树里；
- 双分支：两端 $x, y$ 分别在 $t$ 的两个不同儿子子树里。

记 $T[u] = \sum g[\text{son}]$，$g[u]$ 为「子树 $u$ 内、没有路径越过 $u$ 向上的最优值」。核心量是

$$F(c, x) = \text{子树 } c \text{ 中保留路径 } c \to x \text{（整条路径被占用）时其余部分的最优打包值}.$$

沿路径递推：在路径节点 $z$ 上，$z$ 被保留路径占用，$z$ 的其它儿子子树自由打包，于是

$$F(c, x) = g[c] + \sum_{z \in \operatorname{path}(c, x)} E[z], \qquad E[z] = T[z] - g[z] \le 0.$$

挂在 $u$ 上的选项（双分支 $(x,y)$，分支儿子 $c_1, c_2$）贡献

$$\text{value} = w + F(c_1, x) + F(c_2, y) + (T[u] - g[c_1] - g[c_2]) = w + T[u] + \sum_{z \in \operatorname{path}(c_1, x)} E[z] + \sum_{z \in \operatorname{path}(c_2, y)} E[z].$$

单分支、无分支同理。于是

$$g[u] = T[u] + \max\Big(0,\ \max_{\text{选项}} \text{rawGain}\Big), \qquad \text{rawGain} = w + \sum \text{分支路径上的 } E \text{ 之和}.$$

选完 $g[u]$ 后把 $E[u] = T[u] - g[u]$ 插入数据结构，供祖先查询。

### 路径上 $E$ 之和的快速查询

$E[z]$ 自底向上确定，查询 $\sum_{z \in \operatorname{path}(c,x)} E[z]$ 时路径上的点已全部确定（都在 $u$ 的子树内）。用树状数组做**子树区间加 + 单点查**：把 $E[z]$ 加到欧拉序区间 $[\operatorname{tin}[z], \operatorname{tout}[z]]$ 上，则单点查 $\operatorname{tin}[x]$ 恰好得到「$x$ 的所有已确定祖先的 $E$ 之和」，即 $\sum_{z \in \operatorname{path}(c,x)} E[z]$（$c$ 的父亲 $u$ 尚未入树，贡献自动为 $0$）。

## 复杂度

时间 $O((n + m) \log n)$（每条线路 3 个选项，每个选项 $O(\log n)$ 次 LCA 与树状数组操作），空间 $O(n \log n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

// 树上带权顶点不相交路径打包。
// 每条线路三个选项：双向 (u,v) 权 b；单向 (w,u) 权 a；(w,v) 权 a。
// 因 w 在 u-v 路径上，三个选项都含 w，同线路选项互斥由顶点不相交自然保证。
//
// 正确 DP（端点必须精确追踪，简单 h 态会重复占用）：
//   选项按 LCA（路径顶端）分组。F(c,x) = 子树 c 中"保留路径 c..x"的最优打包
//   F(c,x) = g[c] + sumE(c..x)，其中 E[z] = T[z] - g[z]，T[z] = Σ g[孩子]
//   对 LCA 为 u 的选项：rawGain = w + Σ sumE(分支..端点)
//   g[u] = T[u] + max(0, 选项 rawGain 最大值)；E[u] = T[u] - g[u]
//   sumE(c..x) 用 Fenwick 子树区间加 + 单点查（E[z] 插入 [tin[z], tout[z]]）。

let LOG = 19

var gUp: Array<Array<Int64>> = Array<Array<Int64>>(1, { _ => Array<Int64>(1, { _ => 0 }) })
var gDepth: Array<Int64> = Array<Int64>(1, { _ => 0 })

var gHead: Array<Int64> = Array<Int64>(1, { _ => -1 })
var gTyp = ArrayList<Int64>()
var gW = ArrayList<Int64>()
var gC1 = ArrayList<Int64>()
var gX1 = ArrayList<Int64>()
var gC2 = ArrayList<Int64>()
var gX2 = ArrayList<Int64>()
var gNxt = ArrayList<Int64>()

var gBit: Array<Int64> = Array<Int64>(1, { _ => 0 })
var gTin: Array<Int64> = Array<Int64>(1, { _ => 0 })
var gN: Int64 = 0

func jump(v: Int64, steps: Int64): Int64 {
    var x = v
    var s = steps
    var k: Int64 = 0
    while (s > 0) {
        if ((s % 2) == 1) {
            x = gUp[k][x]
        }
        s = s / 2
        k += 1
    }
    return x
}

func lca(x0: Int64, y0: Int64): Int64 {
    var x = x0
    var y = y0
    if (gDepth[x] < gDepth[y]) {
        let t = x
        x = y
        y = t
    }
    x = jump(x, gDepth[x] - gDepth[y])
    if (x == y) {
        return x
    }
    var k: Int64 = LOG - 1
    while (k >= 0) {
        if (gUp[k][x] != gUp[k][y]) {
            x = gUp[k][x]
            y = gUp[k][y]
        }
        k -= 1
    }
    return gUp[0][x]
}

// top 是 x 的祖先且 x != top，返回路径 top->x 上 top 之下的那个孩子
func childBelow(top: Int64, x: Int64): Int64 {
    return jump(x, gDepth[x] - gDepth[top] - 1)
}

// typ: 0=无分支(单点) 1=单分支(top 为端点) 2=双分支；分支数据 (child, endpoint)
func addOpt(node: Int64, typ: Int64, w: Int64, c1: Int64, x1: Int64, c2: Int64, x2: Int64): Unit {
    gTyp.add(typ)
    gW.add(w)
    gC1.add(c1)
    gX1.add(x1)
    gC2.add(c2)
    gX2.add(x2)
    gNxt.add(gHead[node])
    gHead[node] = gTyp.size - 1
}

func bitAdd(i0: Int64, delta: Int64): Unit {
    var i = i0
    while (i <= gN) {
        gBit[i] += delta
        i += i & (-i)
    }
}

func bitRangeAdd(l: Int64, r: Int64, delta: Int64): Unit {
    if (l > r) {
        return
    }
    bitAdd(l, delta)
    bitAdd(r + 1, -delta)
}

func bitQuery(i0: Int64): Int64 {
    var i = i0
    var s: Int64 = 0
    while (i > 0) {
        s += gBit[i]
        i -= i & (-i)
    }
    return s
}

// sumE(c..x)：c 是 x 的祖先，路径上 E 之和（两端含）
func sumE(c: Int64, x: Int64): Int64 {
    return bitQuery(gTin[x]) - bitQuery(gTin[gUp[0][c]])
}

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line0[0])
    let m = Int64.parse(line0[1])
    let nn = n
    gN = nn

    let adj = ArrayList<ArrayList<Int64>>()
    for (_ in 0..(nn + 1)) {
        adj.add(ArrayList<Int64>())
    }
    for (_ in 0..(nn - 1)) {
        let l = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let x = Int64.parse(l[0])
        let y = Int64.parse(l[1])
        adj[x].add(y)
        adj[y].add(x)
    }

    gUp = Array<Array<Int64>>(LOG, { _ => Array<Int64>(nn + 1, { _ => 0 }) })
    gDepth = Array<Int64>(nn + 1, { _ => 0 })
    gHead = Array<Int64>(nn + 1, { _ => -1 })
    gBit = Array<Int64>(nn + 2, { _ => 0 })
    gTin = Array<Int64>(nn + 1, { _ => 0 })

    // BFS 建 parent/depth/order（父先于子）
    let order = ArrayList<Int64>()
    let queue = ArrayList<Int64>()
    queue.add(1)
    gUp[0][1] = 1
    gDepth[1] = 0
    var qh: Int64 = 0
    while (qh < queue.size) {
        let u = queue[qh]
        qh += 1
        order.add(u)
        for (v in adj[u]) {
            if (v == gUp[0][u]) {
                continue
            }
            gUp[0][v] = u
            gDepth[v] = gDepth[u] + 1
            queue.add(v)
        }
    }
    for (k in 1..LOG) {
        for (v in 1..(nn + 1)) {
            gUp[k][v] = gUp[k - 1][gUp[k - 1][v]]
        }
    }

    // 迭代 DFS 求 Euler 序 tin/tout
    let tout = Array<Int64>(nn + 1, { _ => 0 })
    let ci = Array<Int64>(nn + 1, { _ => 0 })
    let stk = ArrayList<Int64>()
    stk.add(1)
    var timer: Int64 = 1
    while (stk.size > 0) {
        let u = stk[stk.size - 1]
        if (ci[u] == 0) {
            gTin[u] = timer
            timer += 1
        }
        var advanced = false
        while (ci[u] < adj[u].size) {
            let c = adj[u][ci[u]]
            ci[u] += 1
            if (c == gUp[0][u]) {
                continue
            }
            stk.add(c)
            advanced = true
            break
        }
        if (!advanced) {
            tout[u] = timer - 1
            stk.remove(at: stk.size - 1)
        }
    }

    // 读线路，生成选项
    for (_ in 0..m) {
        let l = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let u = Int64.parse(l[0])
        let v = Int64.parse(l[1])
        let w = Int64.parse(l[2])
        let a = Int64.parse(l[3])
        let b = Int64.parse(l[4])

        // 双向：路径 u-v，权 b
        let t1 = lca(u, v)
        if (u == t1) {
            addOpt(t1, 1, b, childBelow(t1, v), v, 0, 0)
        } else if (v == t1) {
            addOpt(t1, 1, b, childBelow(t1, u), u, 0, 0)
        } else {
            addOpt(t1, 2, b, childBelow(t1, u), u, childBelow(t1, v), v)
        }

        // 单向到 u：路径 w-u，权 a
        if (w == u) {
            addOpt(w, 0, a, 0, 0, 0, 0)
        } else {
            let t2 = lca(w, u)
            if (t2 == w) {
                addOpt(t2, 1, a, childBelow(t2, u), u, 0, 0)
            } else if (t2 == u) {
                addOpt(t2, 1, a, childBelow(t2, w), w, 0, 0)
            } else {
                addOpt(t2, 2, a, childBelow(t2, w), w, childBelow(t2, u), u)
            }
        }

        // 单向到 v：路径 w-v，权 a
        if (w == v) {
            addOpt(w, 0, a, 0, 0, 0, 0)
        } else {
            let t3 = lca(w, v)
            if (t3 == w) {
                addOpt(t3, 1, a, childBelow(t3, v), v, 0, 0)
            } else if (t3 == v) {
                addOpt(t3, 1, a, childBelow(t3, w), w, 0, 0)
            } else {
                addOpt(t3, 2, a, childBelow(t3, w), w, childBelow(t3, v), v)
            }
        }
    }

    // DP：逆 BFS 序（子先于父）
    let g = Array<Int64>(nn + 1, { _ => 0 })
    var idx: Int64 = order.size - 1
    while (idx >= 0) {
        let u = order[idx]
        idx -= 1
        var S: Int64 = 0
        for (c in adj[u]) {
            if (c == gUp[0][u]) {
                continue
            }
            S += g[c]
        }
        var best: Int64 = 0
        var oi = gHead[u]
        while (oi != -1) {
            var raw: Int64 = 0
            let t = gTyp[oi]
            if (t == 0) {
                raw = gW[oi]
            } else if (t == 1) {
                raw = gW[oi] + sumE(gC1[oi], gX1[oi])
            } else {
                raw = gW[oi] + sumE(gC1[oi], gX1[oi]) + sumE(gC2[oi], gX2[oi])
            }
            if (raw > best) {
                best = raw
            }
            oi = gNxt[oi]
        }
        g[u] = S + best
        // E[u] = T[u] - g[u] = -best，插入 Fenwick
        bitRangeAdd(gTin[u], tout[u], -best)
    }

    println(g[1])
}
```
