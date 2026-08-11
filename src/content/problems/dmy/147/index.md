---
oj: dmy
pid: '147'
title: '[R24F]炮台防御'
difficulty: 提高+
tags:
  - 树
  - 重心分解
  - 直径
timeLimit: 1.5s
memoryLimit: 128m
---

> 对于 $100\%$ 的数据，$1 \le n \le 5 \times 10^5$，$0 \le a_i \le 5 \times 10^5$，$0 \le b_i \le 5 \times 10^5 + 1$。

## 思路

先求出初始状态下每个节点被多少座炮台覆盖，记为 $c_v$（节点 $u$ 的炮台覆盖 $v$ 当且仅当 $\operatorname{dist}(u,v) \le a_u$）。

定义需求差 $d_v = b_v - c_v$。每次询问只新增一座炮台，任何一个节点的覆盖数最多增加 $1$，所以**只要存在 $d_v \ge 2$ 的节点，无论新炮台放在哪里、半径多大都无法满足**——此时所有答案都是 $-1$，按题意用节点编号 $i$ 代替答案参与异或与求和。

若所有 $d_v \le 1$，记 $D = \{v \mid d_v = 1\}$，即需要新炮台覆盖的节点。若 $D$ 为空，初始就已全部防御充足，答案全为 $0$。否则在节点 $i$ 放新炮台时，$D$ 中每个点都必须被覆盖，最小半径就是：

$$R_i = \max_{v \in D} \operatorname{dist}(i, v)$$

于是问题拆成两部分：求初始覆盖数 $c_v$，以及求每个点到点集 $D$ 的最远距离。

**求 $c_v$（重心分解）**。对每个重心 $c$，统计路径经过 $c$ 的点对 $(u, v)$。此时 $\operatorname{dist}(u,v) = \operatorname{dist}(u,c) + \operatorname{dist}(c,v)$，$u$ 覆盖 $v$ 当且仅当 $a_u \ge \operatorname{dist}(u,c) + \operatorname{dist}(c,v)$，即

$$\mathrm{key}_u = a_u - \operatorname{dist}(u,c) \ge \operatorname{dist}(c,v)$$

做法：先以 $c$ 为根 DFS 一遍，记录每个点到 $c$ 的距离与先序编号。把整个连通块所有点的 $\mathrm{key}$ 放进桶里做**后缀和**（桶下标是到 $c$ 的距离，$\mathrm{key} > maxd$ 的直接计入大桶），于是 $\mathrm{hist}[t]$ 就是 $\mathrm{key} \ge t$ 的点数，对每个 $v$ 累加 $\mathrm{hist}[\operatorname{dist}(c,v)]$。再对 $c$ 的每个子树单独做一遍同样的统计并**减去**——同子树内的点对路径不经过 $c$，会在更深层的重心处被统计，不能算在这一层。这样每对 $(u, v)$（含 $u = v$）恰好在一个重心处被计入一次，得到的就是 $c_v$。

**求 $R_i$（点集直径）**。树上有经典性质：任意点到点集 $D$ 的最远距离，一定取在 $D$ 的直径端点处。任取 $s_1 \in D$，从 $s_1$ 出发找到 $D$ 中距离最远的点 $s_2$，再从 $s_2$ 出发找到 $D$ 中距离最远的点 $s_3$，则 $(s_2, s_3)$ 就是 $D$ 的一条直径，且 $R_i = \max(\operatorname{dist}(i, s_2), \operatorname{dist}(i, s_3))$。三次 DFS 即可求出。

## 复杂度

重心分解每层对整个连通块做常数遍线性扫描，共 $O(\log n)$ 层，总时间复杂度 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*

// 快速输入：一次性读入字节后逐字符解析
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

func readAll(): Array<Byte> {
    let reader = getStdIn()
    return reader.readToEnd().getOrThrow().toArray()
}

var n: Int64 = 0
var head = Array<Int32>(0, { _ => 0 })
var to = Array<Int32>(0, { _ => 0 })
var nxt = Array<Int32>(0, { _ => 0 })
var a = Array<Int64>(0, { _ => 0 })
var b = Array<Int64>(0, { _ => 0 })
var cover = Array<Int64>(0, { _ => 0 })
var removed = Array<Int64>(0, { _ => 0 })
var dist = Array<Int64>(0, { _ => 0 })
var size = Array<Int64>(0, { _ => 0 })
var parent = Array<Int64>(0, { _ => 0 })
var ent = Array<Int64>(0, { _ => 0 })
var hist = Array<Int64>(0, { _ => 0 })
var stN = Array<Int64>(0, { _ => 0 })
var stP = Array<Int64>(0, { _ => 0 })
var lst = Array<Int64>(0, { _ => 0 })

// 重心分解：处理以 start 为根的当前连通块
func decompose(start: Int64): Unit {
    // 第一次 DFS：求子树大小 size、父节点 parent（以 start 为根）
    var top = 0
    stN[0] = start
    stP[0] = 0
    top = 1
    var k = 0
    while (top > 0) {
        top -= 1
        let v = stN[top]
        let p = stP[top]
        parent[v] = p
        size[v] = 1
        lst[k] = v
        k += 1
        var e = Int64(head[v])
        while (e != 0) {
            let w = Int64(to[e])
            if (w != p && removed[w] == 0) {
                stN[top] = w
                stP[top] = v
                top += 1
            }
            e = Int64(nxt[e])
        }
    }
    var i = k - 1
    while (i >= 1) {
        let v = lst[i]
        size[parent[v]] += size[v]
        i -= 1
    }
    // 找重心
    var cur = start
    var done = false
    while (!done) {
        done = true
        var e = Int64(head[cur])
        while (e != 0) {
            let w = Int64(to[e])
            if (removed[w] == 0) {
                var cs: Int64 = 0
                if (parent[w] == cur) {
                    cs = size[w]
                } else if (w == parent[cur]) {
                    cs = k - size[cur]
                }
                if (cs * 2 > k) {
                    cur = w
                    done = false
                    break
                }
            }
            e = Int64(nxt[e])
        }
    }
    let c = cur
    removed[c] = 1
    // 以 c 为根的第二次 DFS：记录到 c 的距离 dist、先序编号 ent、子树大小 size、父节点 parent
    var top2 = 0
    stN[0] = c
    stP[0] = 0
    top2 = 1
    var L = 0
    var maxd: Int64 = 0
    dist[c] = 0
    while (top2 > 0) {
        top2 -= 1
        let v = stN[top2]
        let p = stP[top2]
        let d = dist[v]
        parent[v] = p
        size[v] = 1
        ent[v] = L
        lst[L] = v
        L += 1
        if (d > maxd) {
            maxd = d
        }
        var e = Int64(head[v])
        while (e != 0) {
            let w = Int64(to[e])
            if (w != p && removed[w] == 0) {
                dist[w] = d + 1
                stN[top2] = w
                stP[top2] = v
                top2 += 1
            }
            e = Int64(nxt[e])
        }
    }
    var j = L - 1
    while (j >= 1) {
        let v = lst[j]
        size[parent[v]] += size[v]
        j -= 1
    }
    // 全块统计：对每个 u 记 key = a[u] - dist(c, u)，
    // 节点 v 被（路径经过 c 的）u 覆盖当且仅当 key >= dist(c, v)
    var big = 0
    var i2 = 0
    while (i2 < L) {
        let v = lst[i2]
        let key = a[v] - dist[v]
        if (key >= 0) {
            if (key > maxd) {
                big += 1
            } else {
                hist[key] += 1
            }
        }
        i2 += 1
    }
    var run = 0
    var t = maxd
    while (t >= 0) {
        run += hist[t]
        hist[t] = run
        t -= 1
    }
    var i3 = 0
    while (i3 < L) {
        let v = lst[i3]
        cover[v] += big + hist[dist[v]]
        i3 += 1
    }
    var t2 = 0
    while (t2 <= maxd) {
        hist[t2] = 0
        t2 += 1
    }
    // 对 c 的每个子树，减去同子树内的 (u, v) 对（其路径不经过 c）
    var e = Int64(head[c])
    while (e != 0) {
        let w = Int64(to[e])
        if (removed[w] == 0) {
            let lo = ent[w]
            let hi = lo + size[w]
            var submaxd: Int64 = 0
            var i4 = lo
            while (i4 < hi) {
                let d = dist[lst[i4]]
                if (d > submaxd) {
                    submaxd = d
                }
                i4 += 1
            }
            var big2 = 0
            var i5 = lo
            while (i5 < hi) {
                let v = lst[i5]
                let key = a[v] - dist[v]
                if (key >= 0) {
                    if (key > submaxd) {
                        big2 += 1
                    } else {
                        hist[key] += 1
                    }
                }
                i5 += 1
            }
            var run2 = 0
            var t3 = submaxd
            while (t3 >= 0) {
                run2 += hist[t3]
                hist[t3] = run2
                t3 -= 1
            }
            var i6 = lo
            while (i6 < hi) {
                let v = lst[i6]
                cover[v] -= big2 + hist[dist[v]]
                i6 += 1
            }
            var t4 = 0
            while (t4 <= submaxd) {
                hist[t4] = 0
                t4 += 1
            }
        }
        e = Int64(nxt[e])
    }
    // 递归处理各子树
    var e2 = Int64(head[c])
    while (e2 != 0) {
        let w = Int64(to[e2])
        if (removed[w] == 0) {
            decompose(w)
        }
        e2 = Int64(nxt[e2])
    }
}

// 从 root 出发求全树距离（存入 darr），返回 S 中距离 root 最远的节点
// （S 由 removed[v] == 1 标记）
func dfsDist(root: Int64, darr: Array<Int64>): Int64 {
    var top = 0
    stN[0] = root
    stP[0] = 0
    top = 1
    darr[root] = 0
    var fn = root
    var fd: Int64 = 0
    while (top > 0) {
        top -= 1
        let v = stN[top]
        let p = stP[top]
        let d = darr[v]
        if (removed[v] == 1 && d > fd) {
            fd = d
            fn = v
        }
        var e = Int64(head[v])
        while (e != 0) {
            let w = Int64(to[e])
            if (w != p) {
                darr[w] = d + 1
                stN[top] = w
                stP[top] = v
                top += 1
            }
            e = Int64(nxt[e])
        }
    }
    return fn
}

main(): Int64 {
    gdata = readAll()
    glen = gdata.size
    n = nextInt()
    a = Array<Int64>(n + 1, { _ => 0 })
    b = Array<Int64>(n + 1, { _ => 0 })
    for (i in 1..=n) {
        a[i] = nextInt()
    }
    for (i in 1..=n) {
        b[i] = nextInt()
    }
    head = Array<Int32>(n + 1, { _ => 0 })
    to = Array<Int32>(2 * n, { _ => 0 })
    nxt = Array<Int32>(2 * n, { _ => 0 })
    var ec: Int64 = 1
    for (_ in 1..n) {
        let u = nextInt()
        let v = nextInt()
        to[ec] = Int32(v)
        nxt[ec] = head[u]
        head[u] = Int32(ec)
        ec += 1
        to[ec] = Int32(u)
        nxt[ec] = head[v]
        head[v] = Int32(ec)
        ec += 1
    }
    cover = Array<Int64>(n + 1, { _ => 0 })
    removed = Array<Int64>(n + 1, { _ => 0 })
    dist = Array<Int64>(n + 1, { _ => 0 })
    size = Array<Int64>(n + 1, { _ => 0 })
    parent = Array<Int64>(n + 1, { _ => 0 })
    ent = Array<Int64>(n + 1, { _ => 0 })
    hist = Array<Int64>(n + 2, { _ => 0 })
    stN = Array<Int64>(n + 1, { _ => 0 })
    stP = Array<Int64>(n + 1, { _ => 0 })
    lst = Array<Int64>(n + 1, { _ => 0 })
    gdata = Array<Byte>(0, { _ => 0 })
    glen = 0
    decompose(1)

    // 需求差 def = b[v] - cover[v]
    var bad = false
    var s1: Int64 = 0
    for (v in 1..=n) {
        removed[v] = 0
    }
    for (v in 1..=n) {
        let def = b[v] - cover[v]
        if (def >= 2) {
            bad = true
        } else if (def == 1) {
            removed[v] = 1
            s1 = v
        }
    }
    if (bad) {
        // 所有答案都是 -1，用 i 代替
        var xr: Int64 = 0
        var sm: Int64 = 0
        for (i in 1..=n) {
            xr ^= i
            sm += i
        }
        println("${xr} ${sm}")
        return 0
    }
    if (s1 == 0) {
        // 所有节点已防御充足
        println("0 0")
        return 0
    }
    // S 的直径端点 s2, s3；answer_i = max(dist(i, s2), dist(i, s3))
    let s2 = dfsDist(s1, dist)
    let s3 = dfsDist(s2, size)
    dfsDist(s3, dist)
    var xr: Int64 = 0
    var sm: Int64 = 0
    for (i in 1..=n) {
        let d1 = dist[i]
        let d2 = size[i]
        let ans = if (d1 > d2) { d1 } else { d2 }
        xr ^= ans
        sm += ans
    }
    println("${xr} ${sm}")
    return 0
}
```
