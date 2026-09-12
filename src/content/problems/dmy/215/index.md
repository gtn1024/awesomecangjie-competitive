---
oj: dmy
pid: '215'
title: '[R35F]最小逆序对'
difficulty: 提高
tags:
  - 逆序对
  - 树状数组
  - 线段树
  - 贪心
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$n \le 5 \times 10^5$，$a$ 是 $1..n$ 的排列。

## 思路

设原排列的逆序对总数为 $I$。对每个位置 $i$，记：

- $L_i$：$i$ 之前比 $a_i$ 大的元素个数（即包含 $a_i$ 且 $a_i$ 在后的逆序对）；
- $R_i$：$i$ 之后比 $a_i$ 小的元素个数（即包含 $a_i$ 且 $a_i$ 在前的逆序对）。

把 $a_i$ 移出后，剩下的 $n-1$ 个元素保持相对顺序，逆序对数变为 $I - L_i - R_i$。问题转化为：把 $a_i$ 插回某个位置，新增的逆序对数最少是多少。

枚举插入位置：设前缀保留 $p$ 个元素（$0 \le p \le n-1$）。若前缀中比 $a_i$ 大的元素有 $g$ 个、比 $a_i$ 小的有 $s$ 个，则新增逆序对数 = 前缀中大于 $a_i$ 的个数 + 后缀中小于 $a_i$ 的个数 = $g + (a_i - 1 - s)$。由于 $p = g + s$，新增数 = $p + a_i - 1 - 2s$。

从 $p=0$ 开始逐步增大 $p$：越过一个比 $a_i$ 大的元素，新增数加 $1$；越过一个比 $a_i$ 小的元素，新增数减 $1$。因此最小值等于

$$(a_i - 1) + \min_{k} \left(\sum_{j \le k} \operatorname{sgn}(a_j - a_i)\right)$$

其中 $\operatorname{sgn}(x) = +1$（$x > 0$）、$-1$（$x < 0$），且 $j = i$ 处贡献为 $0$；$k$ 取遍 $0..n$。

把「前缀 $k$ 中大于 $a_i$ 的个数」记为 $G_k$，则上式中的符号和等于 $G_k - (k - G_k - [i \le k]) = 2G_k - k + [i \le k]$，即

$$\min\left(0,\ \min_{k<i}(2G_k - k),\ \min_{k \ge i}(2G_k - k + 1)\right)$$

现在按值从大到小扫描 $v = n, n-1, \dots, 1$，用一棵支持「区间加、区间最小值」的线段树维护每个前缀位置 $k$ 上的值 $2G_k - k$：初始时 $G_k = 0$，第 $k$ 个位置为 $-k$；每当扫到一个值 $v$（其位置为 $p$），先把所有大于 $v$ 的元素贡献进去——处理值为 $v$ 的元素时，它对所有 $k \ge p$ 的前缀都使 $G_k$ 加 $1$，即区间 $[p, n]$ 整体加 $2$。查询位置 $i$（$a_i = v$）时，先回答 $\min(0, \text{前缀最小值}, \text{后缀最小值} + 1)$，再把区间 $[p, n]$ 加 $2$。

$L_i$、$R_i$ 与 $I$ 用树状数组两次扫描即可求出（$R_i = (a_i - 1) -$ 之前小于 $a_i$ 的个数）。最终答案为

$$I - L_i - R_i + (a_i - 1) + \min_k \text{符号和}$$

## 复杂度

时间 $O(n \log n)$（树状数组 + 区间加区间最小线段树各 $O(n \log n)$），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

// 树状数组：单点加、前缀和
class BIT {
    var bit: Array<Int64>
    init(n: Int64) {
        bit = Array<Int64>(n + 1, { _ => 0 })
    }
    func add(pos: Int64, d: Int64): Unit {
        var x = pos + 1
        while (x < bit.size) {
            bit[x] += d
            x += x & (-x)
        }
    }
    func sum(pos: Int64): Int64 {
        var x = pos + 1
        var s: Int64 = 0
        while (x > 0) {
            s += bit[x]
            x -= x & (-x)
        }
        return s
    }
}

// 区间加、区间最小值（迭代式懒标记线段树，半开区间 [l, r)）
class SegTree {
    var seg: Array<Int64>
    var laz: Array<Int64>
    var size: Int64
    var lg: Int64
    init(n: Int64) {
        var s: Int64 = 1
        var l: Int64 = 0
        while (s < n) {
            s *= 2
            l += 1
        }
        size = s
        lg = l
        let INF: Int64 = 4611686018427387904
        seg = Array<Int64>(2 * s, { _ => INF })
        laz = Array<Int64>(s, { _ => 0 })
        for (k in 0..n) {
            seg[s + k] = -(k + 1)
        }
        var k = s - 1
        while (k >= 1) {
            let lv = seg[2 * k]
            let rv = seg[2 * k + 1]
            seg[k] = if (lv < rv) { lv } else { rv }
            k -= 1
        }
    }
    func applyNode(k: Int64, f: Int64): Unit {
        seg[k] += f
        if (k < size) {
            laz[k] += f
        }
    }
    func pushNode(k: Int64): Unit {
        if (laz[k] != 0) {
            let f = laz[k]
            applyNode(2 * k, f)
            applyNode(2 * k + 1, f)
            laz[k] = 0
        }
    }
    func rangeAdd(l: Int64, r: Int64, f: Int64): Unit {
        if (l >= r) {
            return
        }
        let l0 = l + size
        let r0 = r + size
        var i = lg
        while (i >= 1) {
            if (((l0 >> i) << i) != l0) {
                pushNode(l0 >> i)
            }
            if (((r0 >> i) << i) != r0) {
                pushNode((r0 - 1) >> i)
            }
            i -= 1
        }
        var l2 = l0
        var r2 = r0
        while (l2 < r2) {
            if ((l2 & 1) == 1) {
                applyNode(l2, f)
                l2 += 1
            }
            if ((r2 & 1) == 1) {
                r2 -= 1
                applyNode(r2, f)
            }
            l2 >>= 1
            r2 >>= 1
        }
        var i2 = 1
        while (i2 <= lg) {
            if (((l0 >> i2) << i2) != l0) {
                let k2 = l0 >> i2
                let lv = seg[2 * k2]
                let rv = seg[2 * k2 + 1]
                seg[k2] = (if (lv < rv) { lv } else { rv }) + laz[k2]
            }
            if (((r0 >> i2) << i2) != r0) {
                let k2 = (r0 - 1) >> i2
                let lv = seg[2 * k2]
                let rv = seg[2 * k2 + 1]
                seg[k2] = (if (lv < rv) { lv } else { rv }) + laz[k2]
            }
            i2 += 1
        }
    }
    func rangeMin(l: Int64, r: Int64): Int64 {
        if (l >= r) {
            return 4611686018427387904
        }
        let l0 = l + size
        let r0 = r + size
        var i = lg
        while (i >= 1) {
            if (((l0 >> i) << i) != l0) {
                pushNode(l0 >> i)
            }
            if (((r0 >> i) << i) != r0) {
                pushNode((r0 - 1) >> i)
            }
            i -= 1
        }
        var res: Int64 = 4611686018427387904
        var l2 = l0
        var r2 = r0
        while (l2 < r2) {
            if ((l2 & 1) == 1) {
                let v = seg[l2]
                if (v < res) {
                    res = v
                }
                l2 += 1
            }
            if ((r2 & 1) == 1) {
                r2 -= 1
                let v = seg[r2]
                if (v < res) {
                    res = v
                }
            }
            l2 >>= 1
            r2 >>= 1
        }
        return res
    }
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // L[i] = 位置 i 之前比 a[i] 大的元素个数；I 为总逆序对数
    let L = Array<Int64>(n, { _ => 0 })
    var bit = BIT(n)
    var I: Int64 = 0
    for (i in 0..n) {
        let less = bit.sum(a[i] - 1)
        L[i] = i - less
        I += L[i]
        bit.add(a[i], 1)
    }

    // R[i] = 位置 i 之后比 a[i] 小的元素个数 = (a[i]-1) - 之前比 a[i] 小的个数
    let R = Array<Int64>(n, { _ => 0 })
    bit = BIT(n)
    for (i in 0..n) {
        let less = bit.sum(a[i] - 1)
        R[i] = (a[i] - 1) - less
        bit.add(a[i], 1)
    }

    // 线段树按值从大到小扫描：处理到值 v 时，位置 k 上的值为 2*(前缀 k 中大于 v 的个数) - (k+1)
    // 对值 a[i] 在位置 i：minPrefix[i] = min(0, 位置 [0,i) 最小值, 位置 [i,n) 最小值 + 1)
    let seg = SegTree(n)
    let pos = Array<Int64>(n + 1, { _ => 0 })
    for (i in 0..n) {
        pos[a[i]] = i
    }
    let minPrefix = Array<Int64>(n, { _ => 0 })
    var v = n
    while (v >= 1) {
        let p = pos[v]
        let leftMin = seg.rangeMin(0, p)
        let rightMin = seg.rangeMin(p, n)
        var m: Int64 = 0
        if (leftMin < m) {
            m = leftMin
        }
        if (rightMin + 1 < m) {
            m = rightMin + 1
        }
        minPrefix[p] = m
        seg.rangeAdd(p, n, 2)
        v -= 1
    }

    // 答案 = 不含 a[i] 的逆序对数 + 最优插入新增数 = I - L[i] - R[i] + (a[i]-1) + minPrefix[i]
    for (i in 0..n) {
        let ans = I - L[i] - R[i] + (a[i] - 1) + minPrefix[i]
        if (i > 0) {
            print(" ")
        }
        print(ans)
    }
    println()
}
```
