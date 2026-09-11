---
oj: dmy
pid: '203'
title: '[R33F]最大边权'
difficulty: 提高
tags:
  - 树
  - 最近公共祖先
  - 倍增
  - 稀疏表
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$n, q \le 2 \times 10^5$，$\sum k_i \le 2 \times 10^5$，$w \le 10^9$。

## 思路

所有被染色边的并集，就是**覆盖点集 $V$ 的最小斯坦纳子树**（所有点对路径的并）。答案为这棵子树上的最大边权。

关键转化：设只保留边权 $\le W$ 的边得到的森林为 $G_W$，则**子树上的最大边权 $\le W$，当且仅当 $V$ 中所有点都在 $G_W$ 的同一个连通块内**。因为 $G_W$ 是原树的子图，任意两点的连通路径就是原树路径，所以「$V$ 内所有点对路径上的最大边权 $\le W$」等价于「$V$ 内任意两点在 $G_W$ 中连通」。

于是「$V$ 连通」可以拆成两条，分别用阈值刻画：

1. **区间内部连通**：区间 $[l, r]$ 内的点全部连通，等价于其中所有**相邻编号点对** $(x, x+1)$（$l \le x \le r-1$）都连通。记 $t(x)$ 为树上 $x$ 与 $x+1$ 之间路径的最大边权（即 $x, x+1$ 连通的阈值），则区间内部连通的阈值是 $\max_{l \le x \le r-1} t(x)$，用**稀疏表** $O(1)$ 求区间最大值即可。

2. **区间之间连通**：取第一个区间的左端点 $l_1$ 作为锚点，各区间互相连通当且仅当每个区间的左端点 $l_j$ 与 $l_1$ 连通，阈值即 $\max_j \text{路径最大边权}(l_1, l_j)$，用**二进制倍增**求树上路径最大边权。

答案就是这两个最大值的较大者。$|V| < 2$ 时两者自然都是 $0$，无需特判。

## 复杂度

预处理：定根 + 倍增表 $O(n \log n)$，$t$ 数组 $O(n \log n)$，稀疏表 $O(n \log n)$。
每次询问：$O(k \log n)$。
总复杂度 $O((n + \sum k) \log n)$，空间 $O(n \log n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

// 树上两点间路径的最大边权（二进制倍增）
func pathMax(up: Array<Array<Int64>>, mx: Array<Array<Int64>>, dep: Array<Int64>, LOG: Int64, u0: Int64, v0: Int64): Int64 {
    var u = u0
    var v = v0
    var ans: Int64 = 0
    if (dep[u] < dep[v]) {
        let t = u
        u = v
        v = t
    }
    var d = dep[u] - dep[v]
    var k: Int64 = 0
    while (d > 0) {
        if (d % 2 == 1) {
            let a = mx[k][u]
            if (a > ans) {
                ans = a
            }
            u = up[k][u]
        }
        d = d / 2
        k = k + 1
    }
    if (u == v) {
        return ans
    }
    var k2 = LOG - 1
    while (k2 >= 0) {
        if (up[k2][u] != up[k2][v]) {
            let a = mx[k2][u]
            let b = mx[k2][v]
            if (a > ans) {
                ans = a
            }
            if (b > ans) {
                ans = b
            }
            u = up[k2][u]
            v = up[k2][v]
        }
        k2 = k2 - 1
    }
    let a = mx[0][u]
    let b = mx[0][v]
    if (a > ans) {
        ans = a
    }
    if (b > ans) {
        ans = b
    }
    return ans
}

main(): Int64 {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = l1[0]
    let q = l1[1]
    let nn = n
    let m = nn - 1

    // 先读所有边
    let eu = Array<Int64>(m, { _ => 0 })
    let ev = Array<Int64>(m, { _ => 0 })
    let ew = Array<Int64>(m, { _ => 0 })
    let deg = Array<Int64>(nn + 2, { _ => 0 })
    for (i in 0..m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = line[0]
        let v = line[1]
        let w = line[2]
        eu[i] = u
        ev[i] = v
        ew[i] = w
        deg[u] = deg[u] + 1
        deg[v] = deg[v] + 1
    }

    // CSR 邻接表
    let adjStart = Array<Int64>(nn + 2, { _ => 0 })
    var acc: Int64 = 0
    for (i in 1..=nn + 1) {
        adjStart[i] = acc
        acc = acc + deg[i]
    }
    let total = acc
    let adjTo = Array<Int64>(total, { _ => 0 })
    let adjWt = Array<Int64>(total, { _ => 0 })
    let cur = Array<Int64>(nn + 2, { _ => 0 })
    for (i in 0..m) {
        let u = eu[i]
        let v = ev[i]
        let w = ew[i]
        let pu = adjStart[u] + cur[u]
        adjTo[pu] = v
        adjWt[pu] = w
        cur[u] = cur[u] + 1
        let pv = adjStart[v] + cur[v]
        adjTo[pv] = u
        adjWt[pv] = w
        cur[v] = cur[v] + 1
    }

    // 迭代 DFS，以 1 为根
    let parent = Array<Int64>(nn + 1, { _ => 0 })
    let depth = Array<Int64>(nn + 1, { _ => 0 })
    let eMax = Array<Int64>(nn + 1, { _ => 0 })
    parent[1] = -1
    let stackNode = Array<Int64>(nn + 2, { _ => 0 })
    var sp: Int64 = 0
    sp = sp + 1
    stackNode[sp] = 1
    while (sp > 0) {
        let u = stackNode[sp]
        sp = sp - 1
        var i = adjStart[u]
        let en = adjStart[u + 1]
        while (i < en) {
            let v = adjTo[i]
            if (parent[v] == 0) {
                parent[v] = u
                depth[v] = depth[u] + 1
                eMax[v] = adjWt[i]
                sp = sp + 1
                stackNode[sp] = v
            }
            i = i + 1
        }
    }

    // 二进制倍增表：up[k][v]、mx[k][v]（向上 2^k 步的祖先及路径最大边权）
    var LOG: Int64 = 1
    while ((1 << LOG) <= nn) {
        LOG = LOG + 1
    }
    let up = Array<Array<Int64>>(LOG, { _ => Array<Int64>(nn + 1, { _ => 0 }) })
    let mx = Array<Array<Int64>>(LOG, { _ => Array<Int64>(nn + 1, { _ => 0 }) })
    var vv: Int64 = 1
    while (vv <= nn) {
        if (parent[vv] > 0) {
            up[0][vv] = parent[vv]
            mx[0][vv] = eMax[vv]
        }
        vv = vv + 1
    }
    var kk: Int64 = 1
    while (kk < LOG) {
        var vv2: Int64 = 1
        while (vv2 <= nn) {
            let mid = up[kk - 1][vv2]
            up[kk][vv2] = up[kk - 1][mid]
            let a = mx[kk - 1][vv2]
            let b = mx[kk - 1][mid]
            mx[kk][vv2] = if (a > b) { a } else { b }
            vv2 = vv2 + 1
        }
        kk = kk + 1
    }

    // t[x] = 节点 x 与 x+1 之间路径的最大边权（x in 1..n-1）
    let t = Array<Int64>(nn + 1, { _ => 0 })
    var xx: Int64 = 1
    while (xx < nn) {
        t[xx] = pathMax(up, mx, depth, LOG, xx, xx + 1)
        xx = xx + 1
    }

    // 稀疏表：st[k][i] = max(t[i .. i+2^k-1])，下标从 1 开始
    let m2 = nn - 1
    let lg = Array<Int64>(m2 + 2, { _ => 0 })
    var li: Int64 = 2
    while (li <= m2) {
        lg[li] = lg[li / 2] + 1
        li = li + 1
    }
    var K2: Int64 = 1
    while ((1 << K2) <= m2) {
        K2 = K2 + 1
    }
    let st = Array<Array<Int64>>(K2, { _ => Array<Int64>(m2 + 1, { _ => 0 }) })
    var ii: Int64 = 1
    while (ii <= m2) {
        st[0][ii] = t[ii]
        ii = ii + 1
    }
    var kk2: Int64 = 1
    while (kk2 < K2) {
        let half = 1 << (kk2 - 1)
        var ii2: Int64 = 1
        while (ii2 + (1 << kk2) - 1 <= m2) {
            let a = st[kk2 - 1][ii2]
            let b = st[kk2 - 1][ii2 + half]
            st[kk2][ii2] = if (a > b) { a } else { b }
            ii2 = ii2 + 1
        }
        kk2 = kk2 + 1
    }

    // 回答询问
    var qi: Int64 = 0
    while (qi < q) {
        let k = Int64.parse(reader.readln().getOrThrow())
        var ans: Int64 = 0
        var anchor: Int64 = 0
        var j: Int64 = 0
        while (j < k) {
            let seg = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
            let l = seg[0]
            let r = seg[1]
            if (j == 0) {
                anchor = l
            }
            if (l < r) {
                // 区间内部相邻点对 (x, x+1)（x in [l, r-1]）的 t 最大值
                let len = r - l
                let lk = lg[len]
                let a = st[lk][l]
                let b = st[lk][r - (1 << lk)]
                let mm = if (a > b) { a } else { b }
                if (mm > ans) {
                    ans = mm
                }
            }
            // 锚点 l_1 到各区间左端点的路径最大边权
            let pm = pathMax(up, mx, depth, LOG, anchor, l)
            if (pm > ans) {
                ans = pm
            }
            j = j + 1
        }
        println(ans)
        qi = qi + 1
    }
    return 0
}

```

## 备注

树上任意两点间路径的最大边权用二进制倍增在 $O(\log n)$ 内回答；区间内部相邻点对的最大阈值用稀疏表 $O(1)$ 回答，两者配合即可在线处理全部询问，无需离线。
