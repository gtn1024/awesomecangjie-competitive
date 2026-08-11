---
oj: dmy
pid: '114'
title: '[R19F]操作序列'
difficulty: 提高+/省选-
tags:
  - 线段树
  - 离线
  - 贪心
timeLimit: 2s
memoryLimit: 512m
---

## 题目

给定一个长度为 $n$ 的操作序列，操作有两种：向集合 $S$ 中加入 $x$、删除集合 $S$ 中所有值为 $x$ 的数。$Q$ 次询问 $[l,r]$：依次执行第 $l$ 到第 $r$ 个操作后，可以先在区间内**交换任意两个位置的操作**（也可以不交换），求能得到的集合 $S$ 的 $\text{mex}$（最小未出现的非负整数）的最大值。询问相互独立。

> 对于 $100\%$ 的数据，$1\le n,Q\le 5\times 10^5$，$\sum n,\sum Q\le 5\times 10^5$，$op_i\in\{1,2\}$，$0\le x_i\le n$。

## 思路

**观察 1**：对某个值 $v$，区间 $[l,r]$ 内只有**最后一次碰到 $v$ 的操作**决定 $v$ 是否在 $S$ 中——它是加入操作则 $v\in S$，是删除操作（或从未出现）则 $v\notin S$。

**观察 2**：交换位置 $i<j$ 的两个操作，只会改变值 $x_i$ 与 $x_j$ 的「最后一次操作」，其他值的状态完全不变。因此一次交换至多改变集合中两个值的归属，答案只可能是三种情况之一：设不交换时 $S$ 的三个最小缺失值为 $m<m_1<m_2$（即 $\text{mex}=m$），则答案 $\in\{m,m_1,m_2\}$。

**如何让一个缺失值 $v$ 变为存在**：$v\notin S$ 说明 $v$ 的最后一次操作是删除。若 $v$ 在区间内**至少有一次加入操作**，把最早那次加入与最后一次操作（删除）交换，$v$ 的最后一次操作就变成了加入，$v$ 进入集合，且不影响其他值。反之，$v$ 从未被加入，则任何交换都无法让它出现。于是：

- 若 $m$ 没有加入操作，答案为 $m$；
- 否则可以把 $m$ 变为存在，答案为 $m_1$；
- 若还能用**同一次交换**同时把 $m,m_1$ 都变为存在，答案为 $m_2$。

**同时翻转两个值**只有两种对称的形态（记 $\text{last}(v)$ 为 $v$ 在区间内最后一次操作的位置，$\text{sec}(v)$ 为倒数第二次，$\text{add}(v)$ 为 $v$ 最早一次加入的位置）：

- 形态 A：用 $m$ 的加入操作与 $m_1$ 的最后一次操作交换。需要 $\text{last}(m)<\text{last}(m_1)$，且 $m_1$ 的倒数第二次操作是加入、$\text{add}(m)<\text{sec}(m_1)$（交换后 $m_1$ 的最后一次操作变成这个加入）；
- 形态 B：对称地，用 $m_1$ 的加入操作与 $m$ 的最后一次操作交换。

**离线求解**：把询问按 $r$ 排序，从左到右执行操作。对值域 $[0,n+2]$ 建线段树，叶子 $v$ 存「$v$ 的最后一次加入操作的位置，若当前最后一次操作不是加入则为 $-1$」。执行完前 $r$ 个操作后，$v$ 在 $[l,r]$ 中存在当且仅当叶子的值 $\ge l$，所以 `find_first`（在线段树上二分出第一个值 $<l$ 的叶子）依次给出 $m,m_1,m_2$。

每个值还要维护「最后两次操作的位置」和「最后一次加入的位置」（执行操作时 $O(1)$ 更新），以及「区间内最早的加入位置」——把每个值的加入位置排序存储（CSR 结构），用二分查找第一个 $\ge l$ 的加入位置即可。

## 复杂度

- 时间复杂度：$O((n+Q)\log n)$，每个询问做常数次线段树二分与二分查找。
- 空间复杂度：$O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

func lowerBound(arr: Array<Int64>, lo: Int64, hi: Int64, val: Int64): Int64 {
    var a = lo
    var b = hi
    while (a < b) {
        let mid = (a + b) / 2
        if (arr[mid] < val) {
            a = mid + 1
        } else {
            b = mid
        }
    }
    return a
}

func setLeaf(mn: Array<Int64>, size: Int64, idx: Int64, val: Int64): Unit {
    var k = size + idx
    mn[k] = val
    k = k / 2
    while (k >= 1) {
        let lv = mn[2 * k]
        let rv = mn[2 * k + 1]
        mn[k] = if (lv < rv) { lv } else { rv }
        k = k / 2
    }
}

// smallest index in [pos, D) whose leaf value < thresh, or -1
func findFirst(mn: Array<Int64>, size: Int64, D: Int64, buf: Array<Int64>, pos: Int64, thresh: Int64): Int64 {
    if (pos >= D) {
        return -1
    }
    var l = pos + size
    var r = D + size
    var cnt = 0
    while (l < r) {
        if (l % 2 == 1) {
            if (mn[l] < thresh) {
                var k = l
                while (k < size) {
                    k = 2 * k
                    if (mn[k] >= thresh) {
                        k = k + 1
                    }
                }
                return k - size
            }
            l = l + 1
        }
        if (r % 2 == 1) {
            r = r - 1
            buf[cnt] = r
            cnt = cnt + 1
        }
        l = l / 2
        r = r / 2
    }
    var t = cnt - 1
    while (t >= 0) {
        let k0 = buf[t]
        if (mn[k0] < thresh) {
            var k = k0
            while (k < size) {
                k = 2 * k
                if (mn[k] >= thresh) {
                    k = k + 1
                }
            }
            return k - size
        }
        t = t - 1
    }
    return -1
}

main(): Int64 {
    let reader = getStdIn()
    let T = Int64.parse(reader.readln().getOrThrow())
    let sb = StringBuilder()
    for (tt in 0..T) {
        let nq = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let nn = nq[0]
        let q = nq[1]
        let op = Array<Int64>(nn + 1, { _ => 0 })
        let xv = Array<Int64>(nn + 1, { _ => 0 })
        for (i in 1..(nn + 1)) {
            let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
            op[i] = line[0]
            xv[i] = line[1]
        }
        let lq = Array<Int64>(q, { _ => 0 })
        let rq = Array<Int64>(q, { _ => 0 })
        for (i in 0..q) {
            let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
            lq[i] = line[0]
            rq[i] = line[1]
        }

        let D = nn + 3
        // CSR of add positions per value (values in [0, n+2])
        let addCnt = Array<Int64>(D, { _ => 0 })
        for (i in 1..(nn + 1)) {
            if (op[i] == 1) {
                addCnt[xv[i]] = addCnt[xv[i]] + 1
            }
        }
        let aoff = Array<Int64>(D + 1, { _ => 0 })
        var s2: Int64 = 0
        for (v in 0..D) {
            aoff[v] = s2
            s2 = s2 + addCnt[v]
        }
        aoff[D] = s2
        let addData = Array<Int64>(nn, { _ => 0 })
        let curA = Array<Int64>(D, { _ => 0 })
        for (v in 0..D) {
            curA[v] = aoff[v]
        }
        for (i in 1..(nn + 1)) {
            if (op[i] == 1) {
                let v = xv[i]
                addData[curA[v]] = i
                curA[v] = curA[v] + 1
            }
        }

        // segment tree over values [0, D): leaf = last add position if present else -1
        var size = Int64(1)
        while (size < D) {
            size = size * 2
        }
        let INF = 1000000000000000000
        let mn = Array<Int64>(size * 2, { _ => INF })
        for (v in 0..D) {
            mn[size + v] = -1
        }
        var kk = size - 1
        while (kk >= 1) {
            let lv = mn[2 * kk]
            let rv = mn[2 * kk + 1]
            mn[kk] = if (lv < rv) { lv } else { rv }
            kk = kk - 1
        }

        // per value: last two touch positions and last add position (0 = none), as r grows
        let lastT = Array<Int64>(D, { _ => 0 })
        let secondT = Array<Int64>(D, { _ => 0 })
        let lastAdd = Array<Int64>(D, { _ => 0 })

        // counting sort queries by r
        let cntR = Array<Int64>(nn + 1, { _ => 0 })
        for (i in 0..q) {
            cntR[rq[i]] = cntR[rq[i]] + 1
        }
        let startR = Array<Int64>(nn + 1, { _ => 0 })
        var s3: Int64 = 0
        for (r in 1..(nn + 1)) {
            startR[r] = s3
            s3 = s3 + cntR[r]
        }
        let order = Array<Int64>(q, { _ => 0 })
        let curR = Array<Int64>(nn + 1, { _ => 0 })
        for (r in 1..(nn + 1)) {
            curR[r] = startR[r]
        }
        for (i in 0..q) {
            let r = rq[i]
            order[curR[r]] = i
            curR[r] = curR[r] + 1
        }

        let ans = Array<Int64>(q, { _ => 0 })
        let buf = Array<Int64>(64, { _ => 0 })
        var pr: Int64 = 0
        for (t in 0..q) {
            let qi = order[t]
            let l = lq[qi]
            let r = rq[qi]
            while (pr < r) {
                pr = pr + 1
                let v = xv[pr]
                secondT[v] = lastT[v]
                lastT[v] = pr
                if (op[pr] == 1) {
                    lastAdd[v] = pr
                    setLeaf(mn, size, v, pr)
                } else {
                    setLeaf(mn, size, v, -1)
                }
            }
            let m = findFirst(mn, size, D, buf, 0, l)
            // info for value m
            let mHas = lastT[m] >= l
            var mLastT: Int64 = 0
            var mSecondT: Int64 = -1
            var mSecondAdd = false
            var mCnt = false
            var mEarliest: Int64 = -1
            if (mHas) {
                mLastT = lastT[m]
                if (secondT[m] >= l) {
                    mSecondT = secondT[m]
                    mSecondAdd = op[mSecondT] == 1
                }
                mCnt = lastAdd[m] >= l
                let a0 = aoff[m]
                let a1 = aoff[m + 1]
                if (a0 < a1) {
                    let lb = lowerBound(addData, a0, a1, l)
                    if (lb < a1 && addData[lb] <= r) {
                        mEarliest = addData[lb]
                    }
                }
            }
            if (!mHas || !mCnt) {
                ans[qi] = m
            } else {
                let m1 = findFirst(mn, size, D, buf, m + 1, l)
                // info for value m1
                let nHas = lastT[m1] >= l
                var nLastT: Int64 = 0
                var nSecondT: Int64 = -1
                var nSecondAdd = false
                var nEarliest: Int64 = -1
                if (nHas) {
                    nLastT = lastT[m1]
                    if (secondT[m1] >= l) {
                        nSecondT = secondT[m1]
                        nSecondAdd = op[nSecondT] == 1
                    }
                    let a0 = aoff[m1]
                    let a1 = aoff[m1 + 1]
                    if (a0 < a1) {
                        let lb = lowerBound(addData, a0, a1, l)
                        if (lb < a1 && addData[lb] <= r) {
                            nEarliest = addData[lb]
                        }
                    }
                }
                var flipBoth = false
                if (nHas) {
                    // swap earliest add of m with last touch of m1
                    if (mLastT < nLastT) {
                        if (nSecondT != -1 && nSecondAdd && mEarliest != -1 && mEarliest < nSecondT) {
                            flipBoth = true
                        }
                    }
                    // swap earliest add of m1 with last touch of m
                    if (nLastT < mLastT) {
                        if (mSecondT != -1 && mSecondAdd && nEarliest != -1 && nEarliest < mSecondT) {
                            flipBoth = true
                        }
                    }
                }
                if (flipBoth) {
                    let m2 = findFirst(mn, size, D, buf, m1 + 1, l)
                    ans[qi] = m2
                } else {
                    ans[qi] = m1
                }
            }
        }
        for (i in 0..q) {
            sb.append(ans[i])
            sb.append("\n")
        }
    }
    print(sb.toString())
    return 0
}

```
