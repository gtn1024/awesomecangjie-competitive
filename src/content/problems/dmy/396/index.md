---
oj: dmy
pid: '396'
title: '[R63F] 这是一个01串题3'
difficulty: 普及+/提高
tags:
  - 贪心
  - 离线查询
  - 树状数组
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, Q \le 2 \times 10^5$，$s$ 仅包含 `0` 和 `1`。

## 思路

错列串只有两种形态：`0101...` 与 `1010...`。对询问 $[l, r]$，设区间长度为 $len = r - l + 1$，区间内 `0` 的个数为 $c_0$，`1` 的个数为 $c_1 = len - c_0$：

- $len$ 为奇数时，若 $c_0 = (len+1)/2$，则形态 `01...` 可行；若 $c_1 = (len+1)/2$，则形态 `10...` 可行；
- $len$ 为偶数时，必须 $c_0 = c_1$，两种形态均可行。

两种形态都不可行时答案为 $-1$。

相邻交换的最小次数，等于原串中的每个 `0` 与目标形态中按顺序对应的 `0` 的位置差的绝对值之和。设原串中第 $i$ 个 `0` 的位置为 $p_i$，区间 $[l, r]$ 内的 `0` 是原串的第 $L$ 到第 $R$ 个 `0`，则区间内第 $i$ 个 `0` 的位置为 $p_i$（$L \le i \le R$）：

- 形态 `01...`（区间首字符为 `0`）：目标中该 `0` 的位置为 $l + 2(i - L)$，代价为

$$\sum_{i=L}^{R} |p_i - l - 2(i - L)|$$

- 形态 `10...`（区间首字符为 `1`）：目标中该 `0` 的位置为 $l + 2(i - L) + 1$，代价为

$$\sum_{i=L}^{R} |p_i - l - 2(i - L) - 1|$$

令 $w_i = p_i - 2i$，$K_1 = l - 2L$，则两种形态的代价统一为

$$\sum_{i=L}^{R} |w_i - K|$$

其中形态 `01...` 取 $K = K_1$，形态 `10...` 取 $K = K_1 + 1$；两种形态都可行时取较小值。

问题转化为：求区间 $[L, R]$ 内所有 $w_i$ 与常数 $K$ 的差的绝对值之和。设区间内满足 $w_i \le K$ 的元素个数为 $cnt$、和为 $sum_{\le}$，区间内 $w_i$ 的总和为 $sum_{all}$，则

$$\sum_{i=L}^{R} |w_i - K| = K \cdot cnt - sum_{\le} + (sum_{all} - sum_{\le}) - K \cdot (c_0 - cnt)$$

其中 $sum_{all}$ 可用前缀和 $O(1)$ 得到，剩下的问题是求区间内 $w_i \le K$ 的个数与总和，即二维数点：把每个元素看作平面上的点 $(i, w_i)$，询问是统计 $i \in [L, R]$ 且 $w_i \le K$ 的点的个数与 $w_i$ 之和。将询问离线，按 $K$ 升序处理：点按 $w_i$ 升序插入，用两个树状数组（下标为 $i$，分别维护个数与 $w_i$ 之和）支持单点插入与前缀查询，区间 $[L, R]$ 的结果由前缀 $[1, R]$ 减去 $[1, L-1]$ 得到。

## 复杂度

每个询问最多拆成 $4$ 个前缀查询，总时间复杂度 $O((n + Q) \log n)$，空间复杂度 $O(n + Q)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*
import std.sort.*

class Point <: Comparable<Point> {
    var w: Int64
    var j: Int64
    init(w: Int64, j: Int64) {
        this.w = w
        this.j = j
    }
    public func compare(that: Point): Ordering {
        if (this.w < that.w) {
            LT
        } else if (this.w > that.w) {
            GT
        } else {
            EQ
        }
    }
}

class PrefQuery <: Comparable<PrefQuery> {
    var k: Int64
    var idx: Int64
    var subId: Int64
    var sign: Int64
    init(k: Int64, idx: Int64, subId: Int64, sign: Int64) {
        this.k = k
        this.idx = idx
        this.subId = subId
        this.sign = sign
    }
    public func compare(that: PrefQuery): Ordering {
        if (this.k < that.k) {
            LT
        } else if (this.k > that.k) {
            GT
        } else {
            EQ
        }
    }
}

class BIT {
    var n: Int64
    var tree: Array<Int64>

    init(n: Int64) {
        this.n = n
        this.tree = Array<Int64>(n + 1, { _ => 0 })
    }

    func add(i: Int64, v: Int64) {
        var x = i
        while (x <= n) {
            tree[x] += v
            x += x & (-x)
        }
    }

    func query(i: Int64): Int64 {
        var x = i
        var res = 0
        while (x > 0) {
            res += tree[x]
            x -= x & (-x)
        }
        res
    }
}

func solve() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let qn = nm[1]
    let s = reader.readln().getOrThrow()

    let zeroCh = UInt8(48)
    var c0 = 0
    for (ch in s) {
        if (ch == zeroCh) {
            c0 += 1
        }
    }
    let c0n = c0

    let preZeros = Array<Int64>(n + 1, { _ => 0 })
    let preW = Array<Int64>(n + 1, { _ => 0 })
    let points = Array<Point>(c0n, { _ => Point(0, 0) })
    var zi = 1
    var idx = 1
    for (ch in s) {
        preZeros[zi] = preZeros[zi - 1]
        if (ch == zeroCh) {
            preZeros[zi] += 1
            let w = zi - 2 * idx
            points[idx - 1] = Point(w, idx)
            preW[idx] = preW[idx - 1] + w
            idx += 1
        }
        zi += 1
    }

    let queries = ArrayList<PrefQuery>()
    let flag1 = Array<Bool>(qn, { _ => false })
    let flag2 = Array<Bool>(qn, { _ => false })
    let k1 = Array<Int64>(qn, { _ => 0 })
    let Ls = Array<Int64>(qn, { _ => 0 })
    let Rs = Array<Int64>(qn, { _ => 0 })
    let totals = Array<Int64>(qn, { _ => 0 })

    for (qi in 0..qn) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = lr[0]
        let r = lr[1]
        let len = r - l + 1
        let cz = preZeros[r] - preZeros[l - 1]
        let co = len - cz
        let L = preZeros[l - 1] + 1
        let R = preZeros[r]
        let kk = l - 2 * L
        Ls[qi] = L
        Rs[qi] = R
        k1[qi] = kk
        totals[qi] = preW[R] - preW[L - 1]

        var f1 = false
        var f2 = false
        if (len % 2 == 1) {
            if (cz == (len + 1) / 2) {
                f1 = true
            }
            if (co == (len + 1) / 2) {
                f2 = true
            }
        } else {
            if (cz == co) {
                f1 = true
                f2 = true
            }
        }
        flag1[qi] = f1
        flag2[qi] = f2
        if (f1) {
            let sid = 2 * qi
            queries.add(PrefQuery(kk, R, sid, 1))
            queries.add(PrefQuery(kk, L - 1, sid, -1))
        }
        if (f2) {
            let sid = 2 * qi + 1
            queries.add(PrefQuery(kk + 1, R, sid, 1))
            queries.add(PrefQuery(kk + 1, L - 1, sid, -1))
        }
    }

    sort(points)
    sort(queries)

    let bitCnt = BIT(n)
    let bitSum = BIT(n)
    let resCnt = Array<Int64>(2 * qn, { _ => 0 })
    let resSum = Array<Int64>(2 * qn, { _ => 0 })

    var ptr = 0
    for (q in queries) {
        while (ptr < c0n && points[ptr].w <= q.k) {
            bitCnt.add(points[ptr].j, 1)
            bitSum.add(points[ptr].j, points[ptr].w)
            ptr += 1
        }
        resCnt[q.subId] += q.sign * bitCnt.query(q.idx)
        resSum[q.subId] += q.sign * bitSum.query(q.idx)
    }

    let INF: Int64 = 1000000000000000000
    for (qi in 0..qn) {
        var ans: Int64 = -1
        if (flag1[qi] || flag2[qi]) {
            let c0i = Rs[qi] - Ls[qi] + 1
            let total = totals[qi]
            var best = INF
            if (flag1[qi]) {
                let sid = 2 * qi
                let cnt = resCnt[sid]
                let sm = resSum[sid]
                best = 2 * k1[qi] * cnt - 2 * sm + total - k1[qi] * c0i
            }
            if (flag2[qi]) {
                let sid = 2 * qi + 1
                let cnt = resCnt[sid]
                let sm = resSum[sid]
                let v = 2 * (k1[qi] + 1) * cnt - 2 * sm + total - (k1[qi] + 1) * c0i
                if (v < best) {
                    best = v
                }
            }
            ans = best
        }
        println(ans)
    }
}

main() {
    solve()
}
```
