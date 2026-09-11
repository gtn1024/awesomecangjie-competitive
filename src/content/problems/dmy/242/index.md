---
oj: dmy
pid: '242'
title: '[R39F]相似数组'
difficulty: 提高
tags:
  - 线段树
  - 二分
  - 滑动窗口
timeLimit: 2.5s
memoryLimit: 512m
---

> 数据规模：$n, q \le 10^6$，$1 \le a_i, b_i, k \le n$。

## 思路

先刻画一次交换的影响范围。交换相邻位置 $w, w+1$ 后，长度为 $k$ 的窗口 $[i, i+k-1]$ 内 $a$ 的多重集只有当窗口**恰好包含** $w, w+1$ 中的一个时才会改变：窗口包含 $w$ 当且仅当 $i \in [w-k+1, w]$，包含 $w+1$ 当且仅当 $i \in [w-k+2, w+1]$，二者同时包含当且仅当 $i \in [w-k+2, w]$。因此受影响的窗口至多只有两个：左端点为 $w-k+1$（当 $w \ge k$）和左端点为 $w+1$（当 $w \le n-k$）的窗口。其余窗口要么同时包含两个位置（多重集不变），要么都不包含。

窗口 $[L, R]$ 的权值为 $\sum_v \min(\mathrm{cntA}_v, \mathrm{cntB}_v)$，其中 $\mathrm{cntA}_v, \mathrm{cntB}_v$ 分别是值 $v$ 在该窗口 $a, b$ 中的出现次数。交换 $a_w = x$ 与 $a_{w+1} = y$ 后，受影响窗口内只有 $x, y$ 两个值的计数变化：

- $x$ 的出现次数减 $1$，贡献由 $\min(\mathrm{cntA}_x, \mathrm{cntB}_x)$ 变为 $\min(\mathrm{cntA}_x - 1, \mathrm{cntB}_x)$；
- $y$ 的出现次数加 $1$，贡献由 $\min(\mathrm{cntA}_y, \mathrm{cntB}_y)$ 变为 $\min(\mathrm{cntA}_y + 1, \mathrm{cntB}_y)$。

所以窗口分数可以在常数个 $\min$ 运算内增量更新，前提是能快速查询任意值在任意窗口中的出现次数。

出现次数查询：对每个值维护其出现位置的升序列表，范围计数就是 `upperBound(R) - lowerBound(L)`。$b$ 是静态的，位置表直接建好即可；$a$ 会变，但相邻交换只是把位置 $w$ 从 $x$ 的列表移到 $w+1$、把位置 $w+1$ 从 $y$ 的列表移到 $w$。由于 $x \ne y$，被移动的位置在列表中移动 $\pm 1$ 后依然有序（前驱 $< w < w+1$，后继 $> w+1$ 且不可能等于 $w+1$），因此只需要二分定位后原地改写该元素，列表始终保持有序。位置表用 CSR 结构存储，省内存且支持二分。

最后用线段树维护所有窗口分数的最大值：初始用滑动窗口 $O(n)$ 求出每个窗口的分数，之后每次交换至多 $O(\log n)$ 次点更新两个窗口，答案即线段树根。实现时还做了值域压缩，保证对任意取值都能处理。

## 复杂度

时间 $O((n + q) \log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

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

// [lo, hi) 内第一个 >= val 的下标
func lowerBound(arr: Array<Int64>, lo: Int64, hi: Int64, val: Int64): Int64 {
    var l = lo
    var h = hi
    while (l < h) {
        let m = (l + h) / 2
        if (arr[m] < val) {
            l = m + 1
        } else {
            h = m
        }
    }
    return l
}

// [lo, hi) 内第一个 > val 的下标
func upperBound(arr: Array<Int64>, lo: Int64, hi: Int64, val: Int64): Int64 {
    var l = lo
    var h = hi
    while (l < h) {
        let m = (l + h) / 2
        if (arr[m] <= val) {
            l = m + 1
        } else {
            h = m
        }
    }
    return l
}


func minOf(x: Int64, y: Int64): Int64 {
    if (x < y) {
        return x
    }
    return y
}

func maxOf(x: Int64, y: Int64): Int64 {
    if (x > y) {
        return x
    }
    return y
}

main(): Int64 {
    let reader = getStdIn()
    gdata = reader.readToEnd().getOrThrow().toArray()
    glen = gdata.size

    let n = nextInt()
    let q = nextInt()
    let k = nextInt()
    let a = Array<Int64>(n + 1, { _ => 0 })
    let b = Array<Int64>(n + 1, { _ => 0 })
    for (i in 1..=n) {
        a[i] = nextInt()
    }
    for (i in 1..=n) {
        b[i] = nextInt()
    }

    // 值域压缩：所有 a_i, b_i 映射到 1..D
    let vals = Array<Int64>(2 * n, { _ => 0 })
    for (i in 1..=n) {
        vals[i - 1] = a[i]
        vals[n + i - 1] = b[i]
    }
    sort(vals)
    var D: Int64 = 0
    var j: Int64 = 0
    while (j < 2 * n) {
        if (j == 0 || vals[j] != vals[D - 1]) {
            vals[D] = vals[j]
            D += 1
        }
        j += 1
    }
    for (i in 1..=n) {
        a[i] = lowerBound(vals, 0, D, a[i]) + 1
        b[i] = lowerBound(vals, 0, D, b[i]) + 1
    }

    // a 的 CSR 位置表（动态维护，交换相邻元素时位置表保持有序）
    let cntA = Array<Int64>(D + 2, { _ => 0 })
    for (i in 1..=n) {
        cntA[a[i]] += 1
    }
    let offA = Array<Int64>(D + 2, { _ => 0 })
    for (v in 1..=D) {
        offA[v + 1] = offA[v] + cntA[v]
    }
    let posA = Array<Int64>(n, { _ => 0 })
    for (v in 1..=D) {
        cntA[v] = offA[v]
    }
    for (i in 1..=n) {
        let v = a[i]
        posA[cntA[v]] = i
        cntA[v] += 1
    }

    // b 的 CSR 位置表（静态）
    let cntB = Array<Int64>(D + 2, { _ => 0 })
    for (i in 1..=n) {
        cntB[b[i]] += 1
    }
    let offB = Array<Int64>(D + 2, { _ => 0 })
    for (v in 1..=D) {
        offB[v + 1] = offB[v] + cntB[v]
    }
    let posB = Array<Int64>(n, { _ => 0 })
    for (v in 1..=D) {
        cntB[v] = offB[v]
    }
    for (i in 1..=n) {
        let v = b[i]
        posB[cntB[v]] = i
        cntB[v] += 1
    }

    // 滑动窗口初始化所有窗口的相似度分数
    let m = n - k + 1
    let freqA = Array<Int64>(D + 1, { _ => 0 })
    let freqB = Array<Int64>(D + 1, { _ => 0 })
    for (j in 1..=k) {
        freqA[a[j]] += 1
        freqB[b[j]] += 1
    }
    var cur: Int64 = 0
    for (v in 1..=D) {
        let fA = freqA[v]
        let fB = freqB[v]
        cur += minOf(fA, fB)
    }
    let sArr = Array<Int64>(m, { _ => 0 })
    sArr[0] = cur
    var i: Int64 = 1
    while (i <= n - k) {
        let va = a[i]
        if (freqA[va] <= freqB[va]) {
            cur -= 1
        }
        freqA[va] -= 1
        let vb = b[i]
        if (freqB[vb] <= freqA[vb]) {
            cur -= 1
        }
        freqB[vb] -= 1
        let ua = a[i + k]
        if (freqA[ua] < freqB[ua]) {
            cur += 1
        }
        freqA[ua] += 1
        let ub = b[i + k]
        if (freqB[ub] < freqA[ub]) {
            cur += 1
        }
        freqB[ub] += 1
        sArr[i] = cur
        i += 1
    }

    // 线段树维护所有窗口分数的最大值
    var sz: Int64 = 1
    while (sz < m) {
        sz *= 2
    }
    let tree = Array<Int64>(2 * sz, { _ => 0 })
    for (j in 0..m) {
        tree[sz + j] = sArr[j]
    }
    var idx: Int64 = sz - 1
    while (idx >= 1) {
        let l = tree[2 * idx]
        let r = tree[2 * idx + 1]
        tree[idx] = maxOf(l, r)
        idx -= 1
    }

    println(tree[1])
    for (_ in 0..q) {
        let w = nextInt()
        let x = a[w]
        let y = a[w + 1]
        if (x != y) {
            // 受影响的窗口：左端点 w-k+1 与 w+1（若存在）
            if (w >= k) {
                let L = w - k + 1
                let loAx = offA[x]
                let hiAx = offA[x + 1]
                let loBx = offB[x]
                let hiBx = offB[x + 1]
                let loAy = offA[y]
                let hiAy = offA[y + 1]
                let loBy = offB[y]
                let hiBy = offB[y + 1]
                let ca_x = upperBound(posA, loAx, hiAx, w) - lowerBound(posA, loAx, hiAx, L)
                let cb_x = upperBound(posB, loBx, hiBx, w) - lowerBound(posB, loBx, hiBx, L)
                let ca_y = upperBound(posA, loAy, hiAy, w) - lowerBound(posA, loAy, hiAy, L)
                let cb_y = upperBound(posB, loBy, hiBy, w) - lowerBound(posB, loBy, hiBy, L)
                let bx = minOf(ca_x, cb_x)
                let ax = minOf(ca_x - 1, cb_x)
                let by = minOf(ca_y, cb_y)
                let ay = minOf(ca_y + 1, cb_y)
                let d = (ax - bx) + (ay - by)
                if (d != 0) {
                    var p = sz + (w - k)
                    tree[p] += d
                    p = p / 2
                    while (p >= 1) {
                        let l2 = tree[2 * p]
                        let r2 = tree[2 * p + 1]
                        tree[p] = maxOf(l2, r2)
                        p = p / 2
                    }
                }
            }
            if (w <= n - k) {
                let L = w + 1
                let loAy2 = offA[y]
                let hiAy2 = offA[y + 1]
                let loBy2 = offB[y]
                let hiBy2 = offB[y + 1]
                let loAx2 = offA[x]
                let hiAx2 = offA[x + 1]
                let loBx2 = offB[x]
                let hiBx2 = offB[x + 1]
                let ca_y = upperBound(posA, loAy2, hiAy2, w + k) - lowerBound(posA, loAy2, hiAy2, L)
                let cb_y = upperBound(posB, loBy2, hiBy2, w + k) - lowerBound(posB, loBy2, hiBy2, L)
                let ca_x = upperBound(posA, loAx2, hiAx2, w + k) - lowerBound(posA, loAx2, hiAx2, L)
                let cb_x = upperBound(posB, loBx2, hiBx2, w + k) - lowerBound(posB, loBx2, hiBx2, L)
                let by = minOf(ca_y, cb_y)
                let ay = minOf(ca_y - 1, cb_y)
                let bx = minOf(ca_x, cb_x)
                let ax = minOf(ca_x + 1, cb_x)
                let d = (ay - by) + (ax - bx)
                if (d != 0) {
                    var p = sz + w
                    tree[p] += d
                    p = p / 2
                    while (p >= 1) {
                        let l2 = tree[2 * p]
                        let r2 = tree[2 * p + 1]
                        tree[p] = maxOf(l2, r2)
                        p = p / 2
                    }
                }
            }
            // 更新 a 的位置表与数组本身
            let lox = offA[x]
            let hix = offA[x + 1]
            let px = lowerBound(posA, lox, hix, w)
            posA[px] = w + 1
            let loy = offA[y]
            let hiy = offA[y + 1]
            let py = lowerBound(posA, loy, hiy, w + 1)
            posA[py] = w
            a[w] = y
            a[w + 1] = x
        }
        println(tree[1])
    }
    return 0
}
```
