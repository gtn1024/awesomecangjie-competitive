---
oj: dmy
pid: '120'
title: '[R20F]构图判树'
difficulty: 提高+/省选-
tags:
  - 树
  - 排序
  - 平衡树
  - 并查集
timeLimit: 1.5s
memoryLimit: 512m
---

## 题目

有 $n$ 条线段（闭区间 $[l_i,r_i]$，端点可重合），若线段 $i$ 包含线段 $j$（即 $l_i\le l_j$ 且 $r_j\le r_i$），则在点 $i$ 与点 $j$ 之间连一条无向边。判断这样构造出的图是否为一棵树。

> 对于 $100\%$ 的数据，$1\le T\le 100$，$1\le n\le 10^5$，$1\le l_i\le r_i\le 10^9$，$\sum n\le 10^6$。

## 思路

**边数判定**：$n$ 个点的图是一棵树，当且仅当边数恰好为 $n-1$ 且连通。因此先统计边数，若不为 $n-1$ 直接判 `No`；否则枚举出所有边，用并查集检查连通性。

**包含关系的判定**：将线段按 $l$ 升序、$l$ 相同时按 $r$ 降序排序。由于不存在两条完全相同的线段，这个顺序是确定的。排序后，线段 $i$ 包含线段 $j$ 当且仅当 $i$ 排在 $j$ 前面且 $r_i\ge r_j$。于是每条边恰好对应一个「前面元素的 $r$ 不小于当前元素 $r$」的二元组，可以按序扫描统计。

**单趟扫描**：按排序后的顺序处理每条线段 $j$。用一个按 $r$ 为键的平衡树（这里用数组实现 Treap）维护所有已处理的线段。对当前线段 $j$，在 Treap 中找出所有键 $\ge r_j$ 的元素——它们正是包含 $j$ 的线段，每找到一个就累计边数并入并查集；一旦边数超过 $n-1$ 立即判 `No`（提前退出，避免边数极大的情形）。之后再把 $r_j$ 插入 Treap。

由于只在边数不超过 $n-1$ 时才继续枚举，整个过程被枚举的边数不超过 $n$，其余开销为每次查询与插入的 $O(\log n)$。

**实现细节**：

- 用排序后的位置作为顶点编号（重标号不改变图的结构），省去存储原编号。
- 把 $(l,r)$ 打包进一个 `Int64`：$l,r\le 10^9<2^{30}$，令 $\text{key}=(l\ll 30)+(2^{30}-r)$，则 key 按 $l$ 升序、$r$ 降序排列，且 $r=2^{30}-(\text{key}\ \&\ (2^{30}-1))$ 可直接还原。
- 排序用手写的堆排序，避免对 `Int64` 使用泛型比较器排序的开销。
- Treap 中键相同的节点用一个链表保存多个线段下标。

## 复杂度

- 时间复杂度：$O(n\log n)$，排序与 Treap 操作各 $O(n\log n)$，被枚举的边数不超过 $n$。
- 空间复杂度：$O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

const SHIFT: Int64 = 1073741824
const MASK: Int64 = 1073741823

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

// 手写堆排序（Int64 升序）
func siftDown(a: Array<Int64>, ii: Int64, n: Int64): Unit {
    var i = ii
    while (true) {
        let l = 2 * i + 1
        if (l >= n) {
            return
        }
        var mx = l
        let rr = l + 1
        if (rr < n && a[rr] > a[l]) {
            mx = rr
        }
        if (a[mx] <= a[i]) {
            return
        }
        let tmp = a[i]
        a[i] = a[mx]
        a[mx] = tmp
        i = mx
    }
}

func heapSort(a: Array<Int64>, n: Int64): Unit {
    var i = n / 2 - 1
    while (i >= 0) {
        siftDown(a, i, n)
        i -= 1
    }
    var e = n - 1
    while (e > 0) {
        let tmp = a[0]
        a[0] = a[e]
        a[e] = tmp
        siftDown(a, 0, e)
        e -= 1
    }
}

// 数组 Treap：按右端点 r 维护已处理线段
var tkey = Array<Int64>(0, { _ => 0 })
var tpri = Array<Int64>(0, { _ => 0 })
var tL = Array<Int64>(0, { _ => 0 })
var tR = Array<Int64>(0, { _ => 0 })
var thead = Array<Int64>(0, { _ => 0 })
var enext = Array<Int64>(0, { _ => 0 })
var tcnt: Int64 = 0
var seed: Int64 = 88172645463325252

func rnd(): Int64 {
    var x = seed
    x ^= x << 13
    x ^= x >> 7
    x ^= x << 17
    seed = x
    return x
}

func tNewNode(key: Int64): Int64 {
    let idx = tcnt
    tcnt += 1
    tkey[idx] = key
    tpri[idx] = rnd()
    tL[idx] = -1
    tR[idx] = -1
    thead[idx] = -1
    return idx
}

func tInsert(node: Int64, key: Int64, entry: Int64): Int64 {
    if (node == -1) {
        let idx = tNewNode(key)
        thead[idx] = entry
        enext[entry] = -1
        return idx
    }
    if (key == tkey[node]) {
        enext[entry] = thead[node]
        thead[node] = entry
        return node
    } else if (key < tkey[node]) {
        let nl = tInsert(tL[node], key, entry)
        tL[node] = nl
        if (tpri[nl] < tpri[node]) {
            tL[node] = tR[nl]
            tR[nl] = node
            return nl
        }
        return node
    } else {
        let nr = tInsert(tR[node], key, entry)
        tR[node] = nr
        if (tpri[nr] < tpri[node]) {
            tR[node] = tL[nr]
            tL[nr] = node
            return nr
        }
        return node
    }
}

// 并查集
var parent = Array<Int64>(0, { _ => 0 })

func find(x: Int64): Int64 {
    var cur = x
    while (parent[cur] != cur) {
        cur = parent[cur]
    }
    var y = x
    while (parent[y] != cur) {
        let nxt = parent[y]
        parent[y] = cur
        y = nxt
    }
    return cur
}

// 统计/枚举状态
var curId: Int64 = 0
var cnt: Int64 = 0
var limit: Int64 = 0
var bad = false

// 汇报所有 key >= x 的节点里记录的线段（记录为排序后的位置，顶点编号 = 位置 + 1），
// 逐一与当前线段连边并累计边数
func tReport(node: Int64, x: Int64): Unit {
    if (node == -1 || bad) {
        return
    }
    if (tkey[node] < x) {
        tReport(tR[node], x)
        return
    }
    tReport(tL[node], x)
    if (bad) {
        return
    }
    var e = thead[node]
    while (e != -1) {
        cnt += 1
        if (cnt > limit) {
            bad = true
            return
        }
        let ri = find(curId)
        let rj = find(e + 1)
        if (ri != rj) {
            parent[ri] = rj
        }
        e = enext[e]
    }
    tReport(tR[node], x)
}

func solve(): Unit {
    let nn = nextInt()
    let keys = Array<Int64>(nn, { _ => 0 })
    for (i in 0..nn) {
        let l = nextInt()
        let r = nextInt()
        keys[i] = (l << 30) + (SHIFT - r)
    }
    heapSort(keys, nn)

    tkey = Array<Int64>(nn + 2, { _ => 0 })
    tpri = Array<Int64>(nn + 2, { _ => 0 })
    tL = Array<Int64>(nn + 2, { _ => 0 })
    tR = Array<Int64>(nn + 2, { _ => 0 })
    thead = Array<Int64>(nn + 2, { _ => 0 })
    enext = Array<Int64>(nn, { _ => 0 })
    parent = Array<Int64>(nn + 1, { i => i })
    tcnt = 0
    cnt = 0
    limit = nn - 1
    bad = false
    var troot: Int64 = -1
    for (i in 0..nn) {
        if (bad) {
            break
        }
        let r = SHIFT - (keys[i] & MASK)
        curId = i + 1
        tReport(troot, r)
        if (bad) {
            break
        }
        troot = tInsert(troot, r, i)
    }
    if (bad || cnt != limit) {
        println("No")
        return
    }
    var comps: Int64 = 0
    for (i in 1..=nn) {
        if (find(i) == i) {
            comps += 1
        }
    }
    if (comps == 1) {
        println("Yes")
    } else {
        println("No")
    }
}

main() {
    gdata = readAll()
    glen = gdata.size
    let t = nextInt()
    for (_ in 0..t) {
        solve()
    }
}
```

</details>
