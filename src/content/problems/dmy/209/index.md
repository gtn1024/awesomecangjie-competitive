---
oj: dmy
pid: '209'
title: '[R34F] 子串数量'
difficulty: 提高+
tags:
  - 字符串
  - 线段树
  - 树状数组
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n, q \le 5 \times 10^5$，字符串仅包含小写字母。

## 思路

对固定起点 $i$，设 $p(i)$ 为从 $i$ 起第一个满足 $s[p] \ne t[p]$ 的位置。子串 $s[i..j]$ 与 $t[i..j]$ 在 $j < p(i)$ 时完全相同；当 $j \ge p(i)$ 时，二者首次不同发生在 $p(i)$，所以 $s[i..j] < t[i..j]$ 当且仅当 $s[p(i)] < t[p(i)]$。因此一次查询 $[l, r]$ 的答案是

$$\sum_{i=l}^{r} [s[p(i)] < t[p(i)]\,] \cdot \max(0, r - p(i) + 1)$$

所有「不同位置」把 $[1, n]$ 划分成若干块：每个不同位置 $p$ 对应一个块 $[u+1, p]$，其中 $u$ 是 $p$ 之前最近的不同位置（不存在则为 $0$），块内所有 $i$ 的 $p(i)$ 都等于 $p$。

查询 $[l, r]$ 时：
- 含 $l$ 的块单独计算：设 $p = p(l)$，若 $p > r$ 答案为 $0$；否则贡献为 $dir[p] \cdot (r - p + 1) \cdot (p - l + 1)$，其中 $dir[p] = [s[p] < t[p]]$。
- 其余完整块 $[u+1, p]$（满足 $u \ge l$、$p \le r$）的贡献为 $dir[p] \cdot (r - p + 1) \cdot (p - u)$。

把完整块贡献展开：

$$(r+1)\sum dir[p]\cdot(p-u) - \sum dir[p]\cdot p\cdot(p-u)$$

两项都只与「相邻的不同位置对 $(u, p)$」有关，因此可以用两棵树状数组维护：以 $p$ 为下标存 $dir[p]\cdot(p-u)$ 与 $dir[p]\cdot p\cdot(p-u)$，查询时对 $(p(l), r]$ 区间求和。

修改 $s$ 或 $t$ 的单个字符只会改变该位置是否「不同」（以及不同时的大小关系），相当于往「不同位置集合」中插入或删除一个点，只会影响它与左右邻居组成的两对相邻不同位置，对应树状数组上的 $O(1)$ 次单点修改。查找前驱/后继（前一个/后一个不同位置）用一棵维护 $diff$ 数组的线段树完成。

## 复杂度

每次操作 $O(\log n)$，总时间复杂度 $O((n + q)\log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

// 线段树维护 diff 数组（0/1），支持点改、查第一个 >=x 的 1、查最后一个 <=x 的 1
class SegTree {
    var tree: Array<Int64>
    let size: Int64
    init(n: Int64) {
        size = n
        tree = Array<Int64>(4 * n + 5, { _ => 0 })
    }
    func set(pos: Int64, v: Int64, node: Int64, lo: Int64, hi: Int64): Unit {
        if (lo == hi) {
            tree[node] = v
            return
        }
        let mid = (lo + hi) / 2
        if (pos <= mid) {
            set(pos, v, node * 2, lo, mid)
        } else {
            set(pos, v, node * 2 + 1, mid + 1, hi)
        }
        tree[node] = tree[node * 2] + tree[node * 2 + 1]
    }
    // 第一个 >= x 且值为 1 的位置；没有则返回 size
    func findNext(x: Int64, node: Int64, lo: Int64, hi: Int64): Int64 {
        if (hi < x || tree[node] == 0) {
            return size
        }
        if (lo == hi) {
            return lo
        }
        let mid = (lo + hi) / 2
        let lres = findNext(x, node * 2, lo, mid)
        if (lres < size) {
            return lres
        }
        return findNext(x, node * 2 + 1, mid + 1, hi)
    }
    // 最后一个 <= x 且值为 1 的位置；没有则返回 -1
    func findPrev(x: Int64, node: Int64, lo: Int64, hi: Int64): Int64 {
        if (lo > x || tree[node] == 0) {
            return -1
        }
        if (lo == hi) {
            return lo
        }
        let mid = (lo + hi) / 2
        let rres = findPrev(x, node * 2 + 1, mid + 1, hi)
        if (rres >= 0) {
            return rres
        }
        return findPrev(x, node * 2, lo, mid)
    }
}

// 树状数组：单点加，前缀和
class BIT {
    var bit: Array<Int64>
    let size: Int64
    init(n: Int64) {
        size = n
        bit = Array<Int64>(n + 1, { _ => 0 })
    }
    func add(pos: Int64, delta: Int64): Unit {
        var i = pos
        while (i <= size) {
            bit[i] += delta
            i += i & (0 - i)
        }
    }
    func sum(pos: Int64): Int64 {
        var res: Int64 = 0
        var i = pos
        while (i > 0) {
            res += bit[i]
            i -= i & (0 - i)
        }
        return res
    }
}

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(first[0])
    let q = Int64.parse(first[1])
    let sStr = reader.readln().getOrThrow()
    let tStr = reader.readln().getOrThrow()
    let s = Array<UInt8>(n, { i => sStr[i] })
    let t = Array<UInt8>(n, { i => tStr[i] })

    // diff[i]=1 表示 s[i]!=t[i]；dir[i] 在 diff[i]=1 时表示 s[i]<t[i]
    let diff = Array<Int64>(n, { _ => 0 })
    let dir = Array<Int64>(n, { _ => 0 })
    let seg = SegTree(n)
    for (i in 0..n) {
        if (s[i] != t[i]) {
            diff[i] = 1
            dir[i] = if (s[i] < t[i]) { 1 } else { 0 }
            seg.set(i, 1, 1, 0, n - 1)
        }
    }

    // 对每个不同位置 v（其前一个不同位置为 u），维护：
    // bit1: dir[v]*(v-u)；bit2: dir[v]*(v+1)*(v-u)（0 基下标，u=-1 表示没有前驱）
    let bit1 = BIT(n)
    let bit2 = BIT(n)
    for (i in 0..n) {
        if (diff[i] == 1) {
            let u = seg.findPrev(i - 1, 1, 0, n - 1)
            bit1.add(i + 1, dir[i] * (i - u))
            bit2.add(i + 1, dir[i] * (i + 1) * (i - u))
        }
    }

    for (_ in 0..q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let op = Int64.parse(line[0])
        if (op == 3) {
            let l = Int64.parse(line[1]) - 1
            let r = Int64.parse(line[2]) - 1
            let p = seg.findNext(l, 1, 0, n - 1)
            var ans: Int64 = 0
            if (p <= r) {
                // 含 l 的块单独算，其余完整块用两个 BIT 求 (p, r] 区间和
                let partial = dir[p] * (r - p + 1) * (p - l + 1)
                let s1 = bit1.sum(r + 1) - bit1.sum(p + 1)
                let s2 = bit2.sum(r + 1) - bit2.sum(p + 1)
                ans = partial + (r + 2) * s1 - s2
            }
            println(ans.toString())
        } else {
            let pos = Int64.parse(line[1]) - 1
            let ch = line[2][0]
            if (op == 1) {
                s[pos] = ch
            } else {
                t[pos] = ch
            }
            let ndiff: Int64 = if (s[pos] != t[pos]) { 1 } else { 0 }
            if (ndiff == diff[pos]) {
                // 差异状态不变，只可能方向改变
                if (ndiff == 1) {
                    let ndir: Int64 = if (s[pos] < t[pos]) { 1 } else { 0 }
                    if (ndir != dir[pos]) {
                        let u = seg.findPrev(pos - 1, 1, 0, n - 1)
                        let delta = ndir - dir[pos]
                        bit1.add(pos + 1, delta * (pos - u))
                        bit2.add(pos + 1, delta * (pos + 1) * (pos - u))
                        dir[pos] = ndir
                    }
                }
            } else if (ndiff == 1) {
                // pos 加入不同位置集合：拆开 (u, w)，加入 (u, pos) 与 (pos, w)
                let ndir: Int64 = if (s[pos] < t[pos]) { 1 } else { 0 }
                let u = seg.findPrev(pos - 1, 1, 0, n - 1)
                let w = seg.findNext(pos + 1, 1, 0, n - 1)
                if (w < n) {
                    bit1.add(w + 1, dir[w] * (w - pos) - dir[w] * (w - u))
                    bit2.add(w + 1, dir[w] * (w + 1) * (w - pos) - dir[w] * (w + 1) * (w - u))
                }
                bit1.add(pos + 1, ndir * (pos - u))
                bit2.add(pos + 1, ndir * (pos + 1) * (pos - u))
                diff[pos] = 1
                dir[pos] = ndir
                seg.set(pos, 1, 1, 0, n - 1)
            } else {
                // pos 移出不同位置集合：合并 (u, pos) 与 (pos, w) 为 (u, w)
                let u = seg.findPrev(pos - 1, 1, 0, n - 1)
                let w = seg.findNext(pos + 1, 1, 0, n - 1)
                bit1.add(pos + 1, -dir[pos] * (pos - u))
                bit2.add(pos + 1, -dir[pos] * (pos + 1) * (pos - u))
                if (w < n) {
                    bit1.add(w + 1, dir[w] * (w - u) - dir[w] * (w - pos))
                    bit2.add(w + 1, dir[w] * (w + 1) * (w - u) - dir[w] * (w + 1) * (w - pos))
                }
                diff[pos] = 0
                dir[pos] = 0
                seg.set(pos, 0, 1, 0, n - 1)
            }
        }
    }
    return 0
}
```
