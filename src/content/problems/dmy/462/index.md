---
oj: dmy
pid: '462'
title: '[R74F] 编号筛选装置'
difficulty: 提高+
tags:
  - 排列
  - 单调性
  - 线段树
timeLimit: 3s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$p$ 是 $1,2,\dots,n$ 的排列。

## 思路

先刻画固定阈值 $t$ 时哪些编号会留在栈里。把 $p_i \le t$ 看成压入、$p_i > t$ 看成弹出，整个过程就是括号匹配：每次弹出会消掉栈顶最近的、尚未被消掉的压入。令 $b_i = -1$（$p_i \le t$）或 $b_i = +1$（$p_i > t$），并从右往左维护「尚未被消掉的弹出个数」

$$c_i = \max(0,\ c_{i+1} + b_i).$$

位置 $i$ 的编号最终留在栈中，当且仅当 $b_i = -1$ 且 $c_{i+1} = 0$。而 $c_{i+1} = 0$ 等价于：后缀 $[i+1, n]$ 的每个前缀中，$\le t$ 的元素个数都不少于 $> t$ 的元素个数。也就是说，位置 $i$ 能否留下只取决于它右侧的后缀。

当 $t$ 从 $1$ 增大到 $n$，把一个位置由弹出变成压入只会让上述条件更宽松，因此每个位置的保留区间都是一段后缀。记 $Q_j$ 为使后缀 $[j, n]$ 合法的**最小**阈值（$Q_{n+1} = 0$，空后缀恒合法），则位置 $i$ 恰在 $t \ge \max(p_i, Q_{i+1})$ 时贡献 $p_i$。于是只要对每个 $i$ 把 $p_i$ 累加到 $\max(p_i, Q_{i+1})$ 上，再求前缀和就得到所有答案。

**求所有 $Q_j$**。定义

$$A_t(x) = 2 \cdot \#\{l \le x : p_l \le t\} - x \qquad (0 \le x \le n).$$

后缀 $[j, n]$ 合法等价于对一切 $r \ge j$ 都有 $A_t(r) \ge A_t(j-1)$，即 $A_t(j-1)$ 是 $A_t$ 在 $[j-1, n]$ 上的（弱）后缀最小值。令 $i = j - 1$，则 $Q_{i+1} \le t$ 当且仅当下标 $i$ 在时刻 $t$ 是 $A_t$ 的弱后缀最小值。

$t$ 增加到 $t+1$ 时，只有 $q = \mathrm{pos}_{t+1}$ 由弹出变成压入，于是 $A(x)$ 对 $x \ge q$ 全体加 $2$（一次后缀加）。后缀最小值的集合只会变大，并且只有 $i < q$ 可能新增下标。记更新后的 $U = \min_{x \ge q} A(x)$，对 $i < q$ 再记 $W_i = \min_{i < r < q} A(r)$（$i = q-1$ 时区间为空，$W_i = +\infty$）。更新前 $i$ 合法当且仅当 $A(i) \le \min(W_i, U - 2)$，更新后当且仅当 $A(i) \le \min(W_i, U)$，相减可知新变为合法的下标恰好满足

$$A(i) \in \{U-1,\ U\} \quad \text{且} \quad A(i) \le W_i .$$

后半句就是说 $i$ 是 $[0, q-1]$ 内部从右往左的（弱）后缀最小值。用支持区间加、区间最小的线段树维护 $A$，再实现「查询 $[0, h]$ 中值 $\le v$ 的最右下标」，就能把新增下标逐个找出来：从 $h = q-1$、$v = U$ 出发，找到最右的 $i$ 后，若 $A(i) < U-1$ 就停止，否则 $Q_{i+1} = t$，并令 $h = i-1$、$v = A(i)$ 继续往左找。由上面的刻画，每次找到的下标都恰好是首次成为后缀最小值的下标，每个下标一辈子只会被找到一次，所以下降总次数不超过 $n$。

处理完 $t = 1 \dots n$ 后，$Q_j$ 至多在 $t = n$ 时全部确定（此时 $A_n(x) = x$ 单调递增，所有下标都是后缀最小值），最后按 $\max(p_i, Q_{i+1})$ 累加并输出前缀和。

## 复杂度

时间 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

func mnOf(a: Int64, b: Int64): Int64 {
    if (a < b) {
        return a
    }
    return b
}

class SegTree {
    var mn: Array<Int64>
    var lz: Array<Int64>

    init(leaves: Int64) {
        mn = Array<Int64>(4 * leaves + 8, { _ => 0 })
        lz = Array<Int64>(4 * leaves + 8, { _ => 0 })
    }

    func build(node: Int64, l: Int64, r: Int64): Unit {
        if (l == r) {
            mn[node] = -l
            return
        }
        let mid = (l + r) / 2
        build(2 * node, l, mid)
        build(2 * node + 1, mid + 1, r)
        mn[node] = mnOf(mn[2 * node], mn[2 * node + 1])
    }

    func push(node: Int64): Unit {
        let d = lz[node]
        if (d != 0) {
            mn[2 * node] += d
            lz[2 * node] += d
            mn[2 * node + 1] += d
            lz[2 * node + 1] += d
            lz[node] = 0
        }
    }

    func update(node: Int64, l: Int64, r: Int64, ql: Int64, qr: Int64, v: Int64): Unit {
        if (qr < l || r < ql) {
            return
        }
        if (ql <= l && r <= qr) {
            mn[node] += v
            lz[node] += v
            return
        }
        push(node)
        let mid = (l + r) / 2
        update(2 * node, l, mid, ql, qr, v)
        update(2 * node + 1, mid + 1, r, ql, qr, v)
        mn[node] = mnOf(mn[2 * node], mn[2 * node + 1])
    }

    func query(node: Int64, l: Int64, r: Int64, ql: Int64, qr: Int64): Int64 {
        if (qr < l || r < ql) {
            return 1000000000000
        }
        if (ql <= l && r <= qr) {
            return mn[node]
        }
        push(node)
        let mid = (l + r) / 2
        return mnOf(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr))
    }

    // 返回 [0, bound] 中值 <= v 的最右下标，不存在返回 -1
    func findRight(node: Int64, l: Int64, r: Int64, bound: Int64, v: Int64): Int64 {
        if (l > bound) {
            return -1
        }
        if (mn[node] > v) {
            return -1
        }
        if (l == r) {
            return l
        }
        push(node)
        let mid = (l + r) / 2
        var res = findRight(2 * node + 1, mid + 1, r, bound, v)
        if (res < 0) {
            res = findRight(2 * node, l, mid, bound, v)
        }
        return res
    }
}

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })

    // pos[v] = 值 v 所在的位置（1..n）
    let pos = Array<Int64>(n + 1, { _ => 0 })
    for (i in 0..n) {
        pos[p[i]] = i + 1
    }

    // A[x] = 2 * #{l <= x : p_l <= t} - x，这里用叶子 0..n 的线段树维护
    let seg = SegTree(n + 1)
    seg.build(1, 0, n)

    // Q[j] = 使后缀 [j, n] 满足「每个前缀的小值不少于大值」的最小阈值 t
    let Q = Array<Int64>(n + 2, { _ => 0 })
    for (t in 1..=n) {
        let q = pos[t]
        seg.update(1, 0, n, q, n, 2)
        let u = seg.query(1, 0, n, q, n)
        let low = u - 1
        var hi = q - 1
        var v = u
        while (hi >= 0) {
            let i = seg.findRight(1, 0, n, hi, v)
            if (i < 0) {
                break
            }
            let ai = seg.query(1, 0, n, i, i)
            if (ai < low) {
                break
            }
            if (Q[i + 1] == 0) {
                Q[i + 1] = t
            }
            hi = i - 1
            v = ai
        }
    }
    for (j in 1..=n) {
        if (Q[j] == 0) {
            Q[j] = n
        }
    }

    // 位置 i 的元素从阈值 max(p_i, Q[i+1]) 起保留
    let bucket = Array<Int64>(n + 2, { _ => 0 })
    for (i in 1..=n) {
        var L = Q[i + 1]
        if (p[i - 1] > L) {
            L = p[i - 1]
        }
        bucket[L] += p[i - 1]
    }

    let sb = StringBuilder()
    var acc: Int64 = 0
    for (t in 1..=n) {
        acc += bucket[t]
        sb.append(acc.toString())
        sb.append("\n")
    }
    print(sb.toString())
    return 0
}
```
