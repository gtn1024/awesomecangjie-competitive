---
oj: dmy
pid: '232'
title: '[R38D]MINIMEX'
difficulty: 提高
tags:
  - 稀疏表
  - 线段树
  - 离线
timeLimit: 3s
memoryLimit: 512m
---

> $1 \leq n, q \leq 10^6$，$A$ 中元素两两不同，$0 \le A_i < n$，$1 \leq l < r \leq n$。

## 思路

题目要求每次询问计算 $\min(A_l, \dots, A_{r-1}) \cdot \mathrm{MEX}(A_l, \dots, A_r)$，即两个独立的子问题：区间最小值（左闭右开 $[l, r-1]$）与区间 MEX（闭区间 $[l, r]$）。

注意到 $A$ 中元素两两不同且 $0 \le A_i < n$，所以 $A$ 恰是 $\{0, 1, \dots, n-1\}$ 的一个排列，每个值出现且仅出现一次。

### 第一部分：区间最小 RMQ

用稀疏表（Sparse Table）$O(n \log n)$ 预处理、$O(1)$ 查询即可。值域 $< n$，用 `Int32` 存表项以控制内存。

### 第二部分：离线区间 MEX

由于 $A$ 是排列，值 $v$ 的位置 $\mathrm{pos}[v]$ 是唯一确定的。$v \in [l, r]$ 出现当且仅当 $l \le \mathrm{pos}[v] \le r$，所以：

$$\mathrm{MEX}(l, r) = \min \{\, v \ge 0 \mid \mathrm{pos}[v] < l \text{ 或 } \mathrm{pos}[v] > r \,\}$$

把所有询问**按右端点 $r$ 升序排序**后离线处理。维护一棵关于值域 $v \in [0, n-1]$ 的线段树，其叶子存 $\mathrm{last}[v]$：当 $\mathrm{pos}[v] \le r$（值已在 $\le r$ 处出现）时 $\mathrm{last}[v] = \mathrm{pos}[v]$，否则（尚未激活）$\mathrm{last}[v] = 0$。

随 $r$ 从小到大推进时，依次激活 $A[r]$ 对应的值（把 $\mathrm{last}[v]$ 设为 $r$）。对询问 $(l, r)$：

- $\mathrm{last}[v] < l$ 涵盖了两类值：尚未激活的（$\mathrm{pos}[v] > r$，即 $\mathrm{last}=0 < l$）与已激活但 $\mathrm{pos}[v] < l$ 的。这两类都表示 $v$ 不在 $A[l, r]$ 中。
- 已激活且 $l \le \mathrm{pos}[v] \le r$ 的值，$\mathrm{last}[v] \ge l$，表示 $v$ 出现了。

于是 $\mathrm{MEX}(l, r)$ 就是满足 $\mathrm{last}[v] < l$ 的最小 $v$。线段树维护区间最小值，从根开始**单条路径下降**：若左子树最小值 $< l$ 就走左子树，否则走右子树，$O(\log n)$ 找到答案。

边界：若所有真实值 $\mathrm{last}[v] \ge l$（区间 $[l, r]$ 包含了 $\{0, \dots, n-1\}$ 的一个排列前缀），则 $\mathrm{MEX} = n$。实现时把线段树填充到 $2$ 的幂，超出 $n$ 的填充叶子置为 $n+1$（大于任何 $l$），既不参与最小值比较，也保证下降不会落到非法位置。

### 复杂度

- 稀疏表预处理 $O(n \log n)$，查询 $O(1)$。
- 线段树：$n$ 次激活 + $q$ 次查询，各 $O(\log n)$。

总计 $O((n + q) \log n)$，$n, q = 10^6$、$\log n \approx 20$ 时约 $4 \times 10^7$ 次操作，配合迭代式线段树与 `StringBuilder` 批量输出，在 $3\text{s}$ 时限内可过（实测最大点约 $1.3\text{s}$，内存约 $290\text{MB}$）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = first[0]
    let qq = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 读入所有询问
    let queriesL = Array<Int64>(qq, { _ => 0 })
    let queriesR = Array<Int64>(qq, { _ => 0 })
    let qid = Array<Int64>(qq, { i: Int64 => i })
    for (i in 0..qq) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        queriesL[i] = lr[0]
        queriesR[i] = lr[1]
    }

    // -------- 第一部分：稀疏表 RMQ (min) --------
    // 0-based: A[0..n-1]。区间 [l..r-1] (1-based) => A[l-1 .. r-2]
    // 用 Int32 存值节省内存。
    let logN: Int64 = if (nn <= 1) { 0 } else {
        var x: Int64 = 0
        var t: Int64 = 1
        while (t * 2 <= nn) {
            x += 1
            t *= 2
        }
        x
    }
    let levels: Int64 = logN + 1
    // 稀疏表：sp[k*n + i] = min(A[i..i+2^k-1])
    let sp = Array<Int32>(levels * nn, { _ => 0 })
    for (i in 0..nn) {
        sp[i] = Int32(a[i])
    }
    var k: Int64 = 1
    var len: Int64 = 2
    while (k < levels) {
        let prevBase = (k - 1) * nn
        let curBase = k * nn
        let half = len / 2
        var i: Int64 = 0
        let limit = nn - len + 1
        while (i < limit) {
            let x = Int64(sp[prevBase + i])
            let y = Int64(sp[prevBase + i + half])
            sp[curBase + i] = Int32(if (x < y) { x } else { y })
            i += 1
        }
        k += 1
        len *= 2
    }

    // 预处理 log2 表（用于 RMQ 查询）
    let log2 = Array<Int64>(nn + 1, { _ => 0 })
    var j: Int64 = 2
    while (j <= nn) {
        log2[j] = log2[j / 2] + 1
        j += 1
    }

    // -------- 第二部分：离线 MEX（迭代式线段树） --------
    // 把 query 按 r (1-based) 升序排序。
    let cmp = { x: Int64, y: Int64 => queriesR[x].compare(queriesR[y]) }
    sort(qid, by: cmp)

    // 迭代线段树：size 为 >= n 的 2 的幂；叶子在 [size, 2*size)。
    // 值域 v in [0..n-1]。tree[v+size] = last[v]（位置，初始 0）。
    var size: Int64 = 1
    while (size < nn) {
        size *= 2
    }
    // 真实值叶子 [0,n-1] 初始 last=0（未激活）；
    // 填充叶子（v >= n，不是真实值）置为大值(>n)，使其永远不满足 last < l，
    // 也不干扰 tree[1] 的最小值判断。
    let bigSentinel = Int32(nn + 1)
    let tree = Array<Int32>(2 * size, { _ => 0 })
    var pad: Int64 = nn
    while (pad < size) {
        tree[size + pad] = bigSentinel
        pad += 1
    }
    // 自底向上建立内部节点
    var p = size - 1
    while (p >= 1) {
        let lc = p << 1
        let rc = lc + 1
        let x = Int64(tree[lc])
        let y = Int64(tree[rc])
        tree[p] = Int32(if (x < y) { x } else { y })
        p -= 1
    }

    // 点更新 last[v] = pos（迭代）：从叶子向上 push up。
    func update(v: Int64, pos: Int32): Unit {
        var p = v + size
        tree[p] = pos
        p = p >> 1
        while (p >= 1) {
            let lc = p << 1
            let rc = lc + 1
            let x = Int64(tree[lc])
            let y = Int64(tree[rc])
            tree[p] = Int32(if (x < y) { x } else { y })
            p = p >> 1
        }
    }

    // MEX 查询：最小的 v 使 last[v] < l。
    // 从根节点 1 开始单路径下降：左子最小 < l 就走左，否则走右。
    func mexQuery(l: Int32): Int64 {
        if (Int64(tree[1]) >= Int64(l)) {
            // 值域 [0,n-1] 中所有 v 的 last[v] 都 >= l，即都在 [l,r] 内出现。
            // 此时 MEX = n（第一个不在值域内的非负整数）。
            return nn
        }
        var p: Int64 = 1
        while (p < size) {
            let lc = p << 1
            if (Int64(tree[lc]) < Int64(l)) {
                p = lc
            } else {
                p = lc + 1
            }
        }
        return p - size
    }

    // pos[v] = 值 v 在数组中的位置（1-based）。A 是排列，每个值恰好出现一次。
    let pos = Array<Int64>(nn, { _ => 0 })
    for (i in 0..nn) {
        pos[a[i]] = i + 1
    }

    let ans = Array<Int64>(qq, { _ => 0 })
    var curR: Int64 = 0
    for (idx in 0..qq) {
        let i = qid[idx]
        let l = queriesL[i]
        let r = queriesR[i]
        // 激活 pos[v] <= r 的所有 v：推进 curR，把位置 curR 对应的值激活。
        while (curR < r) {
            curR += 1
            let v = a[curR - 1]
            update(v, Int32(curR))
        }
        // RMQ min(A[l..r-1]): 0-based 闭区间 [l-1 .. r-2]
        let ql = l - 1
        let qr = r - 2
        let length = qr - ql + 1
        let kk = log2[length]
        let base = kk * nn
        let x = Int64(sp[base + ql])
        let y = Int64(sp[base + qr - (1 << kk) + 1])
        let mn = if (x < y) { x } else { y }
        // MEX: 最小 v 使 last[v] < l
        let mex = mexQuery(Int32(l))
        ans[i] = mn * mex
    }

    // 输出：用 StringBuilder 一次打印
    let sb = StringBuilder()
    var i = 0
    while (i < qq) {
        sb.append(ans[i])
        sb.append('\n')
        i += 1
    }
    print(sb.toString())
    return 0
}
```
