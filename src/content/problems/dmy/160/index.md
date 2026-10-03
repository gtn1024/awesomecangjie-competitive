---
oj: dmy
pid: '160'
title: '[R26G]交换区间'
difficulty: 提高
tags:
  - 莫队
  - 树状数组
  - 逆序对
timeLimit: 3500ms
memoryLimit: 1024m
---

## 题目

给定长度为 $n$ 的排列 $P$，有 $q$ 次独立询问，每次给出两个不相交区间 $[l_1,r_1]$ 和 $[l_2,r_2]$（保证 $r_1<l_2$）。问：若把 $P$ 中 $[l_1,r_1]$ 子段与 $[l_2,r_2]$ 子段整体交换，得到的新排列的逆序对数是多少。每次询问都基于初始排列。

> 对于 $100\%$ 的数据，$2\le n,q\le 10^5$，$1\le l_1\le r_1<l_2\le r_2\le n$。

## 思路

记 $A=[l_1,r_1]$，$B=[l_2,r_2]$，$M=[r_1+1,l_2-1]$（中间段，可能为空），其余部分为左右两侧。交换 $A,B$ 后只有跨越 $\{A,M,B\}$ 这三段的逆序对会发生变化，左右两侧及各自内部的不变。

**关键观察**：交换 $A,B$ 后新排列的逆序对数，可以用「原排列全局逆序对数」加上一个只与 $A,M,B$ 相关的修正量得到。而这个修正量可以通过**容斥**转化为若干个「区间内逆序对数减顺序对数」之差的线性组合。

具体地，对一次询问，构造 $4$ 个区间查询并带上正负号：

| 区间 | 含义 | 符号 |
|------|------|------|
| $[l_1,r_2]$ | $A\cup M\cup B$ 整体 | $-1$ |
| $[l_1,r_1]$ | $A$ | $+1$ |
| $[l_2,r_2]$ | $B$ | $+1$ |
| $[r_1+1,l_2-1]$ | $M$（非空时） | $+1$ |

由容斥原理，$-[A\cup M\cup B]+[A]+[B]+[M]$ 恰好保留了跨段对 $A\leftrightarrow B$、$A\leftrightarrow M$、$M\leftrightarrow B$ 的贡献，抵消了各段内部的贡献。而每个区间查询我们关心的不是单纯的逆序对数 $\mathrm{inv}$，而是

$$
\mathrm{inv}-\mathrm{ord}=2\cdot\mathrm{inv}-\binom{\mathrm{len}}{2},
$$

即「逆序对数 $-$ 顺序对数」（顺序对数 $=\binom{\mathrm{len}}2-\mathrm{inv}$）。最终答案为

$$
\mathrm{ans}_i=\mathrm{inverse}+\sum_{q}\mathrm{sgn}_q\cdot\bigl(\mathrm{inv}_q-\mathrm{ord}_q\bigr),
$$

其中 $\mathrm{inverse}$ 是初始排列的全局逆序对数。

于是问题归约为：**离线回答大量「区间内逆序对数」的查询**，这是经典做法。

### 莫队 + 树状数组

把所有区间查询（共至多 $4q$ 个）用莫队算法离线处理。块大小取 $\lceil\sqrt n\rceil$，查询按 $l$ 所在块为第一关键字、$r$ 为第二关键字排序。维护当前滑动窗口 $[l,r]$ 内的元素，用一个值域 $[1,n]$ 上的树状数组记录窗口中已出现的值。

窗口移动时增量维护窗口内的逆序对数 $\mathrm{sum}$ 与窗口大小 $\mathrm{sz}$：

- 右端点 $r$ 右扩加入 $a[r]$：它作为最右元素，与窗口中已有元素形成的逆序对数为「窗口中值 $>a[r]$ 的个数」$=\mathrm{sz}-\mathrm{query}(a[r])$；
- 左端点 $l$ 左扩加入 $a[l]$：它作为最左元素，形成逆序对数为「窗口中值 $<a[l]$ 的个数」$=\mathrm{query}(a[l]-1)$；
- 收缩时对称地撤销上述贡献。

每次到达一个查询区间时，$\mathrm{sum}$ 即为该区间的逆序对数，$\mathrm{ord}=\binom{r-l+1}{2}-\mathrm{sum}$，按符号累加进对应询问的答案即可。

全局逆序对同样用一次从右向左扫描的树状数组统计。

## 复杂度

- 时间复杂度：莫队指针移动 $O((n+q)\sqrt n)$ 次，每次树状数组操作 $O(\log n)$，总计 $O\bigl((n+q)\sqrt n\log n\bigr)$。
- 空间复杂度：$O(n+q)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

// 树状数组（Fenwick），基于值域 [1..n]，0 基内部下标
// add(x, v)：把下标 x（1 基外部）处累加 v
// sum(x)：前 x 个之和（外部下标 1..x）
var tree: Array<Int64> = Array<Int64>(1, { _ => 0 })
var treeN: Int64 = 0

func treeAdd(x0: Int64, v: Int64): Unit {
    var x = x0
    while (x <= treeN) {
        tree[x] += v
        x += x & (-x)
    }
}

func treeSum(x0: Int64): Int64 {
    var s: Int64 = 0
    var x = x0
    while (x > 0) {
        s += tree[x]
        x -= x & (-x)
    }
    return s
}

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line0[0])
    let m = Int64.parse(line0[1])

    let a = Array<Int64>(n + 1, { _ => 0 })
    let row = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    var i = 1
    while (i <= n) {
        a[i] = Int64.parse(row[i - 1])
        i += 1
    }

    treeN = n
    tree = Array<Int64>(n + 2, { _ => 0 })

    // 全局逆序对 inverse
    var inverse: Int64 = 0
    i = n
    while (i >= 1) {
        // a[i] 前面（值 <= a[i]-1）右侧已插入的个数：treeSum(a[i] - 1)
        // 但参考代码用 treeSum(a[i])（值 < a[i]，因排列无相等）统计右侧比它小的
        inverse += treeSum(a[i] - 1)
        treeAdd(a[i], 1)
        i -= 1
    }
    // 清空树状数组
    i = 1
    while (i <= n) {
        tree[i] = 0
        i += 1
    }

    // 莫队块大小 = ceil(sqrt(n))
    var BS: Int64 = 1
    var lo = 1
    var hi = n + 1
    while (lo < hi) {
        let mid = (lo + hi) / 2
        if (mid * mid < n) {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    BS = lo
    if (BS < 1) { BS = 1 }

    // 收集查询（每个原始询问拆 4 段）
    let cap4 = m * 4
    let ql = Array<Int64>(cap4, { _ => 0 })
    let qr = Array<Int64>(cap4, { _ => 0 })
    let qid = Array<Int64>(cap4, { _ => 0 })
    let qsgn = Array<Int64>(cap4, { _ => 0 })
    var nq: Int64 = 0
    let inverse0 = inverse
    let ans = Array<Int64>(m, { _ => inverse0 })

    i = 0
    while (i < m) {
        let qln = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let l1 = Int64.parse(qln[0])
        let r1 = Int64.parse(qln[1])
        let l2 = Int64.parse(qln[2])
        let r2 = Int64.parse(qln[3])
        // [l1,r2] sgn=-1
        ql[nq] = l1; qr[nq] = r2; qid[nq] = i; qsgn[nq] = -1; nq += 1
        // [l1,r1] sgn=+1
        ql[nq] = l1; qr[nq] = r1; qid[nq] = i; qsgn[nq] = 1; nq += 1
        // [l2,r2] sgn=+1
        ql[nq] = l2; qr[nq] = r2; qid[nq] = i; qsgn[nq] = 1; nq += 1
        // [r1+1,l2-1] sgn=+1（若非空）
        if (r1 + 1 <= l2 - 1) {
            ql[nq] = r1 + 1; qr[nq] = l2 - 1; qid[nq] = i; qsgn[nq] = 1; nq += 1
        }
        i += 1
    }

    // 对查询排序：按 l/BS 分块，块内按 r 升序
    let order = Array<Int64>(nq, { k: Int64 => k })
    let nqq = nq
    let nBS = BS
    sort(order, lessThan: { p: Int64, q2: Int64 =>
        let bp = ql[p] / nBS
        let bq = ql[q2] / nBS
        if (bp != bq) {
            bp < bq
        } else {
            qr[p] < qr[q2]
        }
    })

    // 莫队移动指针
    var sum: Int64 = 0
    var sz: Int64 = 0
    var l: Int64 = 1
    var r: Int64 = 0
    var idx = 0
    while (idx < nqq) {
        let q = order[idx]
        let qlv = ql[q]
        let qrv = qr[q]
        // 右扩
        while (r < qrv) {
            r += 1
            // 新元素 a[r] 在最右，与当前窗口形成的逆序对 = 窗口中值 > a[r] 的个数
            sum += sz - treeSum(a[r])
            treeAdd(a[r], 1)
            sz += 1
        }
        // 左扩
        while (l > qlv) {
            l -= 1
            sum += treeSum(a[l] - 1)
            treeAdd(a[l], 1)
            sz += 1
        }
        // 右缩
        while (r > qrv) {
            treeAdd(a[r], -1)
            sz -= 1
            sum -= sz - treeSum(a[r])
            r -= 1
        }
        // 左缩
        while (l < qlv) {
            treeAdd(a[l], -1)
            sz -= 1
            sum -= treeSum(a[l] - 1)
            l += 1
        }
        let pairs = (r - l + 1) * (r - l) / 2
        let other = pairs - sum
        ans[qid[q]] += qsgn[q] * (sum - other)
        idx += 1
    }

    i = 0
    while (i < m) {
        println(ans[i])
        i += 1
    }
}
```

</details>
