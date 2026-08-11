---
oj: dmy
pid: '438'
title: '[R70F] 锚点'
difficulty: 普及/提高-
tags:
  - 单调栈
  - 离线
  - 线段树
timeLimit: 1s
memoryLimit: 512m
---

## 思路

对每个位置 $i$，用单调栈求出**以 $a_i$ 为最小值的最大区间** $[l_i, r_i]$：$l_i$ 为左边第一个 $< a_i$ 的位置加 1，$r_i$ 为右边第一个 $\le a_i$ 的位置减 1（一严一松，保证每个子数组的最小值唯一归属到其最靠右的最小值位置）。

记 $\mathrm{len}_i = r_i - l_i + 1$。任意一个长度恰为 $k$、包含 $p$、最小值为 $a_j$ 的窗口，它整体落在 $[l_j, r_j]$ 内（否则会越过一个更小的元素），因此 $p \in [l_j, r_j]$ 且 $\mathrm{len}_j \ge k$。反之，若某个 $i$ 满足 $p \in [l_i, r_i]$ 且 $\mathrm{len}_i \ge k$，则 $[l_i, r_i]$ 内存在长度为 $k$ 且包含 $p$ 的窗口，该窗口内所有元素都 $\ge a_i$，其最小值 $\ge a_i$。于是：

$$
\mathrm{ans}(p, k) = \max \{\, a_i \mid p \in [l_i, r_i],\ \mathrm{len}_i \ge k \,\}
$$

**离线扫描**：把所有区间 $[l_i, r_i]$（附权值 $a_i$、长度 $\mathrm{len}_i$）按长度降序排序，询问按 $k$ 降序排序。扫描询问时，不断加入所有 $\mathrm{len}_i \ge k$ 的区间，对位置区间 $[l_i, r_i]$ 做**区间 chmax 更新** $a_i$，然后对 $p$ 做单点查询。线段树只维护区间覆盖的最大值（不向下传），单点查询沿根到叶子的路径取最大值即可。

## 复杂度

单调栈 $O(n)$，排序与扫描各 $O((n + q) \log (n + q))$，线段树单次操作 $O(\log n)$。总时间复杂度 $O((n + q) \log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*
import std.sort.*

// 每个位置 i 的「以 a_i 为最小值的最大区间」[l, r]，及其长度 len
class Seg {
    let l: Int64
    let r: Int64
    let len: Int64
    let v: Int64
    init(l: Int64, r: Int64, len: Int64, v: Int64) {
        this.l = l
        this.r = r
        this.len = len
        this.v = v
    }
}

// 询问：下标 p、长度 k、原始编号 idx
class Query {
    let p: Int64
    let k: Int64
    let idx: Int64
    init(p: Int64, k: Int64, idx: Int64) {
        this.p = p
        this.k = k
        this.idx = idx
    }
}

// 线段树：区间 chmax 更新（不下传），单点查询（沿路径取 max）
func update(tree: Array<Int64>, size: Int64, ql: Int64, qr: Int64, v: Int64): Unit {
    var l = ql + size
    var r = qr + size + 1
    while (l < r) {
        if (l % 2 == 1) {
            if (v > tree[l]) {
                tree[l] = v
            }
            l += 1
        }
        if (r % 2 == 1) {
            r -= 1
            if (v > tree[r]) {
                tree[r] = v
            }
        }
        l = l / 2
        r = r / 2
    }
}

func query(tree: Array<Int64>, size: Int64, pos: Int64): Int64 {
    var p = pos + size
    var res: Int64 = 0
    while (p > 0) {
        if (tree[p] > res) {
            res = tree[p]
        }
        p = p / 2
    }
    return res
}

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })
    let n = first[0]
    let q = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })

    // 单调栈：lb[i] = 左边第一个 < a[i] 的位置 + 1，rb[i] = 右边第一个 <= a[i] 的位置 - 1
    let lb = Array<Int64>(n, { _ => 0 })
    let rb = Array<Int64>(n, { _ => 0 })
    let stk = Array<Int64>(n, { _ => 0 })
    var top: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        while (top > 0 && a[stk[top - 1]] >= a[i]) {
            top -= 1
        }
        if (top == 0) {
            lb[i] = 0
        } else {
            lb[i] = stk[top - 1] + 1
        }
        stk[top] = i
        top += 1
        i += 1
    }
    top = 0
    i = n - 1
    while (i >= 0) {
        while (top > 0 && a[stk[top - 1]] > a[i]) {
            top -= 1
        }
        if (top == 0) {
            rb[i] = n - 1
        } else {
            rb[i] = stk[top - 1] - 1
        }
        stk[top] = i
        top += 1
        i -= 1
    }

    let segs = ArrayList<Seg>()
    i = 0
    while (i < n) {
        segs.add(Seg(lb[i], rb[i], rb[i] - lb[i] + 1, a[i]))
        i += 1
    }
    sort(segs, key: { s: Seg => s.len }, descending: true)

    let qs = ArrayList<Query>()
    i = 0
    while (i < q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })
        qs.add(Query(line[0] - 1, line[1], i))
        i += 1
    }
    sort(qs, key: { qu: Query => qu.k }, descending: true)

    // 段按 len 降序、询问按 k 降序扫描：加入 len >= k 的段后，点 p 上的最大值即为答案
    var size: Int64 = 1
    while (size < n) {
        size *= 2
    }
    let tree = Array<Int64>(size * 2, { _ => 0 })

    let ans = Array<Int64>(q, { _ => 0 })
    var ptr: Int64 = 0
    for (qu in qs) {
        while (ptr < n && segs[ptr].len >= qu.k) {
            update(tree, size, segs[ptr].l, segs[ptr].r, segs[ptr].v)
            ptr += 1
        }
        ans[qu.idx] = query(tree, size, qu.p)
    }

    let sb = StringBuilder()
    i = 0
    while (i < q) {
        sb.append(ans[i])
        sb.append("\n")
        i += 1
    }
    print(sb.toString())
}
```
