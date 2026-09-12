---
oj: dmy
pid: '359'
title: '[R57F] YourName'
difficulty: 提高
tags:
  - 线段树
  - 贪心
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2 \times 10^5$，$1 \le q \le 2 \times 10^5$，$1 \le W_i, v \le 10^9$，$1 \le P_i \le n$ 且 $P$ 始终为排列。

## 思路

**关键观察**：考虑最终没有被移动过的物品。每个物品的最后一次移动只会把它放到最前或最后，所以最终序列中，「移到最前的物品」占据开头一段，「移到最后的物品」占据末尾一段，从未移动的物品占据正中间一段。由于最终序列必须升序，从未移动的物品集合恰好是标签的连续区间 $[l, r]$；并且它们的相对顺序不变，所以在当前序列中必然满足

$$
pos_l < pos_{l+1} < \cdots < pos_r
$$

其中 $pos_k$ 是标签 $k$ 当前所在的位置。

反过来，任何满足该条件的区间 $[l, r]$ 都能实现：按 $l-1, l-2, \ldots, 1$ 的顺序依次移到最前（后移的会跑到先移的前面），按 $r+1, r+2, \ldots, n$ 的顺序依次移到最后，中间段保持不动。每个物品只需移动一次，总代价为

$$
\sum_{k \notin [l,r]} W_k = \sum_{k=1}^{n} W_k - \sum_{k=l}^{r} W_k
$$

由于所有 $W_k \ge 1$，最优解就是找一个权值和最大的合法区间，答案 = 总权值和 − 最大合法区间权值和。

**转化为连通段**：定义 $b_k = [pos_k < pos_{k+1}]$（$1 \le k < n$）。区间 $[l, r]$ 合法当且仅当 $b_l, b_{l+1}, \ldots, b_{r-1}$ 全为 $1$，即 $[l, r]$ 完全落在 $b$ 的某一段连续 $1$ 之内。因为权值为正，最大合法区间就是某段「连续 $1$ 的极大段」，于是答案 = 总权值和 − $b$ 的连续 $1$ 段的最大权值和。

**修改的影响**：

- 操作 `1 x y` 交换两个位置，只有标签 $i = P_x$ 和 $j = P_y$ 的位置改变，所以 $b$ 只可能在 $i-1, i, j-1, j$ 四处变化（每处重新用 $pos$ 计算后单点更新）；
- 操作 `2 i v` 只改一个叶子 $i$ 的权值。

**线段树维护**：每个叶子 $k$ 存权值 $W_k$ 和右邻边 $b_k$（$k = n$ 时恒为 $0$）。每个节点维护：区间长度与权值和、最长前缀合法段（长度与权值和）、最长后缀合法段、区间内合法段权值和最大值 $mx$、以及区间最右端叶子的 $b$ 值（父节点合并时用它判断左右子区间是否连通）。合并时，跨左右子区间的合法段 = 左子区间后缀 + 右子区间前缀，仅在左子区间最右 $b$ 值为 $1$ 时成立。每次回答 = `sum[1] - mx[1]`。

复杂度：每次修改 $O(\log n)$，总时间复杂度 $O((n + q) \log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

// 线段树维护：标签区间 [l, r] 合法（pos[l] < pos[l+1] < ... < pos[r]）当且仅当
// 相邻边 b[k] = [pos[k] < pos[k+1]] 全为 1。维护每个节点的：
// len/sum（区间长度与权值和）、preLen/preSum（最长前缀合法段）、
// sufLen/sufSum（最长后缀合法段）、mx（区间内合法段权值和最大值）、
// edge（区间最右端叶子的 b 值，供父节点合并判断跨区间连通性）。
class SegTree {
    var sz: Int64
    var len: Array<Int64>
    var sum: Array<Int64>
    var preLen: Array<Int64>
    var preSum: Array<Int64>
    var sufLen: Array<Int64>
    var sufSum: Array<Int64>
    var mx: Array<Int64>
    var edge: Array<Int64>

    init(n: Int64) {
        var N = 1
        while (N < n) {
            N = N * 2
        }
        sz = N
        let size = N * 2
        len = Array<Int64>(size, { _ => 0 })
        sum = Array<Int64>(size, { _ => 0 })
        preLen = Array<Int64>(size, { _ => 0 })
        preSum = Array<Int64>(size, { _ => 0 })
        sufLen = Array<Int64>(size, { _ => 0 })
        sufSum = Array<Int64>(size, { _ => 0 })
        mx = Array<Int64>(size, { _ => 0 })
        edge = Array<Int64>(size, { _ => 0 })
    }

    func pull(p: Int64): Unit {
        let l = p * 2
        let r = p * 2 + 1
        let lLen = len[l]
        let rLen = len[r]
        len[p] = lLen + rLen
        sum[p] = sum[l] + sum[r]
        edge[p] = edge[r]
        if (preLen[l] == lLen) {
            if (edge[l] == 1) {
                preLen[p] = lLen + preLen[r]
                preSum[p] = sum[l] + preSum[r]
            } else {
                preLen[p] = lLen
                preSum[p] = sum[l]
            }
        } else {
            preLen[p] = preLen[l]
            preSum[p] = preSum[l]
        }
        if (sufLen[r] == rLen) {
            if (edge[l] == 1) {
                sufLen[p] = sufLen[l] + rLen
                sufSum[p] = sufSum[l] + sum[r]
            } else {
                sufLen[p] = rLen
                sufSum[p] = sum[r]
            }
        } else {
            sufLen[p] = sufLen[r]
            sufSum[p] = sufSum[r]
        }
        var m = mx[l]
        if (mx[r] > m) {
            m = mx[r]
        }
        if (edge[l] == 1) {
            let c = sufSum[l] + preSum[r]
            if (c > m) {
                m = c
            }
        }
        mx[p] = m
    }

    func setLeaf(k: Int64, w: Int64, e: Int64): Unit {
        let p = sz + k - 1
        len[p] = 1
        sum[p] = w
        preLen[p] = 1
        preSum[p] = w
        sufLen[p] = 1
        sufSum[p] = w
        mx[p] = w
        edge[p] = e
    }

    func climb(p0: Int64): Unit {
        var p = p0 / 2
        while (p >= 1) {
            pull(p)
            p = p / 2
        }
    }

    func updateWeight(i: Int64, v: Int64): Unit {
        let p = sz + i - 1
        sum[p] = v
        preSum[p] = v
        sufSum[p] = v
        mx[p] = v
        climb(p)
    }

    func updateEdge(k: Int64, b: Int64): Unit {
        let p = sz + k - 1
        edge[p] = b
        climb(p)
    }
}

func fixEdge(st: SegTree, pos: Array<Int64>, n: Int64, k: Int64): Unit {
    if (k < 1 || k >= n) {
        return
    }
    var b: Int64 = 0
    if (pos[k] < pos[k + 1]) {
        b = 1
    }
    st.updateEdge(k, b)
}

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    let n = line0[0]
    let q = line0[1]
    let P = Array<Int64>(n + 1, { _ => 0 })
    let pos = Array<Int64>(n + 1, { _ => 0 })
    let pLine = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    for (i in 0..n) {
        P[i + 1] = pLine[i]
        pos[pLine[i]] = i + 1
    }
    let st = SegTree(n)
    let wLine = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    for (i in 1..=n) {
        var e: Int64 = 0
        if (i < n && pos[i] < pos[i + 1]) {
            e = 1
        }
        st.setLeaf(i, wLine[i - 1], e)
    }
    var p = st.sz - 1
    while (p >= 1) {
        st.pull(p)
        p = p - 1
    }
    println(st.sum[1] - st.mx[1])
    for (qi in 1..=q) {
        let op = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
        if (op[0] == 1) {
            let x = op[1]
            let y = op[2]
            let i = P[x]
            let j = P[y]
            P[x] = j
            P[y] = i
            pos[i] = y
            pos[j] = x
            fixEdge(st, pos, n, i - 1)
            fixEdge(st, pos, n, i)
            fixEdge(st, pos, n, j - 1)
            fixEdge(st, pos, n, j)
        } else {
            st.updateWeight(op[1], op[2])
        }
        println(st.sum[1] - st.mx[1])
    }
}
```

## 要点

- 交换操作 `1 x y` 只影响标签 $i = P_x$、$j = P_y$ 两侧共四处 $b$ 值，其余边的状态不变，这是每次修改只有 $O(\log n)$ 的关键。
- 合并节点时，前缀/后缀段的延伸与跨区间合法段的拼接都必须检查左子区间最右叶子的 $b$ 值是否为 $1$；节点记录的 `edge` 是区间最右端叶子的 $b$ 值。
- 叶子 $k = n$ 的右邻边不存在，恒置 $0$，保证合法段不会越过序列末尾。
