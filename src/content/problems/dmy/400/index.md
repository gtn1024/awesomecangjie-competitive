---
oj: dmy
pid: '400'
title: '[R64D] 路灯'
difficulty: 普及+/提高
tags:
  - 树状数组
  - 离散化
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le Q \le 2 \times 10^5$，$1 \le x \le 10^9$。

## 思路

黑暗程度只由相邻点亮路灯之间的间隔决定。切换位置 $x$ 时，除 $x$ 附近的前驱 $L$（小于 $x$ 的最大点亮位置）与后继 $R$（大于 $x$ 的最小点亮位置）外，其它相邻关系不变，因此只需维护点亮位置集合与当前答案 $ans$。

设相邻点亮位置 $l < r$ 的贡献为 $f(l, r) = (r - l - 1)^2$：

- **点亮 $x$**：若 $L$、$R$ 均存在，它们原本相邻，先减去 $f(L, R)$；再分别加上 $f(L, x)$、$f(x, R)$（只加存在的部分），最后插入 $x$。
- **熄灭 $x$**：先分别减去 $f(L, x)$、$f(x, R)$（只减存在的部分）；若 $L$、$R$ 均存在，熄灭 $x$ 后它们成为新的相邻对，加上 $f(L, R)$，最后删除 $x$。

每次操作后输出 $ans$ 即可；点亮路灯少于 2 盏时上述维护自然得到 0。

关键是需要一种支持「找前驱 / 后继」的有序结构。这里用**离线离散化 + 树状数组**实现：把所有操作中出现过的位置排序去重（个数不超过 $Q$），树状数组维护每个位置是否点亮的前缀和。设 $x$ 之前点亮的路灯有 `before` 个：

- 点亮 $x$ 前，前驱是第 `before` 个点亮位置，后继是第 `before + 1` 个点亮位置；
- 熄灭 $x$ 前（$x$ 本身点亮），前驱是第 `before` 个点亮位置，后继是第 `before + 2` 个点亮位置。

第 $k$ 个点亮位置可以在树状数组上二分（`kth`）求出：从高位步长往下走，前缀和小于 $k$ 的区间跳过，最终落在第一个前缀和 $\ge k$ 的位置。

## 复杂度

每次操作 $O(\log Q)$（几次前缀和与二分查询），总时间复杂度 $O(Q \log Q)$，空间复杂度 $O(Q)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

// 树状数组：单点加、前缀和、二分找第 k 个 1 的下标（1-based）
class Fenwick {
    var bit: Array<Int64>
    var n: Int64

    init(n: Int64) {
        this.n = n
        this.bit = Array<Int64>(n + 1, { _ => 0 })
    }

    func add(idx: Int64, delta: Int64) {
        var p = idx
        while (p <= n) {
            bit[p] += delta
            p += p & (-p)
        }
    }

    func sum(idx: Int64): Int64 {
        var p = idx
        var s: Int64 = 0
        while (p > 0) {
            s += bit[p]
            p -= p & (-p)
        }
        return s
    }

    // 返回最小的下标 i，使得前缀和 >= k（保证 k 合法）
    func kth(k0: Int64): Int64 {
        var k = k0
        var pos: Int64 = 0
        var step: Int64 = 1
        while (step * 2 <= n) {
            step *= 2
        }
        while (step > 0) {
            if (pos + step <= n && bit[pos + step] < k) {
                pos += step
                k -= bit[pos]
            }
            step /= 2
        }
        return pos + 1
    }
}

// 升序数组中二分第一个 >= x 的下标
func lowerBound(a: Array<Int64>, x: Int64): Int64 {
    var lo: Int64 = 0
    var hi = a.size
    while (lo < hi) {
        let mid = (lo + hi) / 2
        if (a[mid] < x) {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    return lo
}

main() {
    let reader = getStdIn()
    let q = Int64.parse(reader.readln().getOrThrow().split(" ", removeEmpty: true)[0])
    let qq = q
    var xs = Array<Int64>(qq, { _ => 0 })
    var i: Int64 = 0
    while (i < qq) {
        xs[i] = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })[0]
        i += 1
    }
    // 离散化所有出现过的位置
    let xs0 = xs
    let sorted = Array<Int64>(qq, { i2 => xs0[i2] })
    sort(sorted)
    var m: Int64 = 0
    var j: Int64 = 0
    while (j < qq) {
        if (j == 0 || sorted[j] != sorted[j - 1]) {
            sorted[m] = sorted[j]
            m += 1
        }
        j += 1
    }
    let disc = sorted[0..m]
    let nn = m
    let fw = Fenwick(nn)
    var total: Int64 = 0
    var ans: Int64 = 0
    i = 0
    while (i < qq) {
        let x = xs[i]
        let idx = lowerBound(disc, x) + 1
        let before = fw.sum(idx - 1)
        let upto = fw.sum(idx)
        if (upto > before) {
            // 点亮 -> 熄灭：去掉 (L,x)、(x,R)，补上 (L,R)
            if (total >= 2) {
                if (before >= 1) {
                    let L = disc[fw.kth(before) - 1]
                    ans -= (x - L - 1) * (x - L - 1)
                }
                if (upto < total) {
                    let R = disc[fw.kth(upto + 1) - 1]
                    ans -= (R - x - 1) * (R - x - 1)
                }
                if (before >= 1 && upto < total) {
                    let L = disc[fw.kth(before) - 1]
                    let R = disc[fw.kth(upto + 1) - 1]
                    ans += (R - L - 1) * (R - L - 1)
                }
            }
            fw.add(idx, -1)
            total -= 1
        } else {
            // 熄灭 -> 点亮：去掉 (L,R)，补上 (L,x)、(x,R)
            if (total >= 1) {
                if (before >= 1) {
                    let L = disc[fw.kth(before) - 1]
                    ans += (x - L - 1) * (x - L - 1)
                }
                if (before < total) {
                    let R = disc[fw.kth(before + 1) - 1]
                    ans += (R - x - 1) * (R - x - 1)
                }
                if (before >= 1 && before < total) {
                    let L = disc[fw.kth(before) - 1]
                    let R = disc[fw.kth(before + 1) - 1]
                    ans -= (R - L - 1) * (R - L - 1)
                }
            }
            fw.add(idx, 1)
            total += 1
        }
        println(ans)
        i += 1
    }
}
```

要点：

- 答案最大约 $10^{18}$（两盏路灯相距 $10^9$），必须用 `Int64`。
- `kth(k)` 返回 1-based 下标，取离散化数组中的位置时要减 1；`disc` 中存的是原始路灯编号。
- 输出量大，直接用 `println` 输出。
