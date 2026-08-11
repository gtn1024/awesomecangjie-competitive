---
oj: dmy
pid: '184'
title: '[R30E] 彩色小球'
difficulty: 普及+/提高
tags:
  - 拓扑排序
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 2 \times 10^5$，$1 \le c_i \le n$。

## 思路

相同颜色必须连续成块，所以任意可行排列都可以看作"颜色块序列"：每个块是该颜色所有球的一个排列，块与块之间不穿插。

把限制按颜色是否相同分成两类：

- **同色限制** $(u, v)$（$c_u = c_v$）：变成块内的有向边 $u \to v$，块内是一个 DAG；
- **异色限制** $(u, v)$（$c_u \ne c_v$）：$u$ 在 $v$ 左边当且仅当颜色块 $c_u$ 整体在块 $c_v$ 之前，变成块级有向边 $c_u \to c_v$。

于是问题变成：确定块级拓扑序 + 每个块内部的排列，使整体字典序最小。

构造采用贪心：

- 若当前存在"打开的块"（上一个球所在的颜色块还没放完），由于连续性约束，下一个球**必须**取该块内部同色入度为 $0$ 的最小球，块内自然形成字典序最小的拓扑序；
- 若当前没有打开的块，则从所有"可打开"的颜色中选一个打开——可打开指所有块级前驱已完成且内部有可用球。选择哪个？排列的下一个位置将出现该块内部的最小可用球，为了让字典序最小，应选择"内部最小可用球最小"的颜色打开；
- 无解的情形：块级 DAG 有环（没有块可打开却有球剩余）、块内部 DAG 有环（块打开后内部堆耗尽但块未放完）。

实现时每个颜色维护一个小根堆（内部入度为 $0$ 的球），另维护一个全局小根堆存放可打开颜色的"当前内部最小球"（配合惰性校验，弹出时核对是否仍有效）。由于块未打开时其内部堆不会变化，全局堆每个颜色至多入堆一次。

复杂度：时间 $O((n + m) \log n)$，空间 $O(n + m)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*
import std.sort.*

var pool = Array<Int64>(0, { _ => 0 })
var hstart = Array<Int64>(0, { _ => 0 })
var hsize = Array<Int64>(0, { _ => 0 })
var gheap = Array<Int64>(0, { _ => 0 })
var gsize: Int64 = 0
var OFFSET: Int64 = 0

func heapPush(col: Int64, x: Int64): Unit {
    let h = hstart[col]
    var i = hsize[col]
    hsize[col] = i + 1
    pool[h + i] = x
    while (i > 0) {
        let p = (i - 1) / 2
        if (pool[h + p] <= pool[h + i]) {
            break
        }
        let t = pool[h + p]
        pool[h + p] = pool[h + i]
        pool[h + i] = t
        i = p
    }
}

func heapPop(col: Int64): Int64 {
    let h = hstart[col]
    let top = pool[h]
    var sz = hsize[col] - 1
    hsize[col] = sz
    if (sz > 0) {
        pool[h] = pool[h + sz]
        var i: Int64 = 0
        while (true) {
            let l = 2 * i + 1
            let r = 2 * i + 2
            var mi = i
            if (l < sz && pool[h + l] < pool[h + mi]) {
                mi = l
            }
            if (r < sz && pool[h + r] < pool[h + mi]) {
                mi = r
            }
            if (mi == i) {
                break
            }
            let t = pool[h + i]
            pool[h + i] = pool[h + mi]
            pool[h + mi] = t
            i = mi
        }
    }
    return top
}

func heapTop(col: Int64): Int64 {
    return pool[hstart[col]]
}

func heapEmpty(col: Int64): Bool {
    return hsize[col] == 0
}

func gPush(key: Int64): Unit {
    var i = gsize
    gsize = i + 1
    gheap[i] = key
    while (i > 0) {
        let p = (i - 1) / 2
        if (gheap[p] <= gheap[i]) {
            break
        }
        let t = gheap[p]
        gheap[p] = gheap[i]
        gheap[i] = t
        i = p
    }
}

func gPop(): Int64 {
    let top = gheap[0]
    var sz = gsize - 1
    gsize = sz
    if (sz > 0) {
        gheap[0] = gheap[sz]
        var i: Int64 = 0
        while (true) {
            let l = 2 * i + 1
            let r = 2 * i + 2
            var mi = i
            if (l < sz && gheap[l] < gheap[mi]) {
                mi = l
            }
            if (r < sz && gheap[r] < gheap[mi]) {
                mi = r
            }
            if (mi == i) {
                break
            }
            let t = gheap[i]
            gheap[i] = gheap[mi]
            gheap[mi] = t
            i = mi
        }
    }
    return top
}

main(): Int64 {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let nn = line0[0]
    let mm = line0[1]
    OFFSET = nn + 1

    var col = Array<Int64>(nn + 1, { _ => 0 })
    let cvals = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    for (i in 0..nn) {
        col[i + 1] = cvals[i]
    }

    var cnt = Array<Int64>(nn + 2, { _ => 0 })
    for (b in 1..=nn) {
        cnt[col[b]] += 1
    }

    var sadj = Array<ArrayList<Int64>>(nn + 1, { _ => ArrayList<Int64>() })
    var sin = Array<Int64>(nn + 1, { _ => 0 })
    var cross = ArrayList<Int64>()
    for (_ in 0..mm) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let u = Int64.parse(line[0])
        let v = Int64.parse(line[1])
        let cu = col[u]
        let cv = col[v]
        if (cu == cv) {
            sadj[u].add(v)
            sin[v] += 1
        } else {
            cross.add(cu * OFFSET + cv)
        }
    }

    sort(cross)
    var cadjs = Array<ArrayList<Int64>>(nn + 1, { _ => ArrayList<Int64>() })
    var cindeg = Array<Int64>(nn + 1, { _ => 0 })
    var prev: Int64 = -1
    for (key in cross) {
        if (key != prev) {
            prev = key
            let cu = key / OFFSET
            let cv = key % OFFSET
            cadjs[cu].add(cv)
            cindeg[cv] += 1
        }
    }

    pool = Array<Int64>(nn + 5, { _ => 0 })
    hstart = Array<Int64>(nn + 2, { _ => 0 })
    hsize = Array<Int64>(nn + 2, { _ => 0 })
    var acc: Int64 = 0
    for (cc in 1..=nn) {
        hstart[cc] = acc
        acc += cnt[cc]
    }
    for (b in 1..=nn) {
        if (sin[b] == 0) {
            heapPush(col[b], b)
        }
    }

    gheap = Array<Int64>(nn + 5, { _ => 0 })
    gsize = 0
    for (cc in 1..=nn) {
        if (cnt[cc] > 0 && cindeg[cc] == 0 && !heapEmpty(cc)) {
            gPush(heapTop(cc) * OFFSET + cc)
        }
    }

    var remaining = Array<Int64>(nn + 2, { _ => 0 })
    for (cc in 1..=nn) {
        remaining[cc] = cnt[cc]
    }

    var openCol: Int64 = -1
    var placed: Int64 = 0
    var sb = StringBuilder()
    while (placed < nn) {
        if (openCol != -1) {
            if (heapEmpty(openCol)) {
                println("-1")
                return 0
            }
            let b = heapPop(openCol)
            sb.append(b.toString())
            if (placed + 1 < nn) {
                sb.append(" ")
            }
            placed += 1
            remaining[openCol] -= 1
            for (w in sadj[b]) {
                sin[w] -= 1
                if (sin[w] == 0) {
                    heapPush(openCol, w)
                }
            }
            if (remaining[openCol] == 0) {
                let oc = openCol
                openCol = -1
                for (nxt in cadjs[oc]) {
                    cindeg[nxt] -= 1
                    if (cindeg[nxt] == 0 && !heapEmpty(nxt)) {
                        gPush(heapTop(nxt) * OFFSET + nxt)
                    }
                }
            }
        } else {
            var found = false
            while (gsize > 0) {
                let key = gPop()
                let b = key / OFFSET
                let cc = key % OFFSET
                if (cindeg[cc] == 0 && !heapEmpty(cc) && heapTop(cc) == b) {
                    openCol = cc
                    found = true
                    break
                }
            }
            if (!found) {
                println("-1")
                return 0
            }
        }
    }
    println(sb.toString())
    return 0
}
```
