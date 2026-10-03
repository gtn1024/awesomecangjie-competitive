---
oj: dmy
pid: '337'
title: '[R54D]取模加和交换'
difficulty: 提高
tags:
  - 排序
  - 双指针
  - 差分
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le n \le 2 \times 10^5$，$1 < m \le 10^9$，$0 \le a_i, b_i < m$。

## 思路

操作 1 代价为 0 且可无限使用，意味着 $a$ 可以 **任意重排**。操作 2 只能让某个 $a_i$ 在模 $m$ 意义下「向前加 1」，无法回退，所以把一个 $a$ 中的元素变成目标值 $b$ 需要 $\langle b - a \rangle_m = (b - a) \bmod m$ 步。

问题等价于：把 $a$ 的多重集和 $b$ 的多重集做一个一一匹配，使每个 $a$ 变到其匹配的 $b$ 的「前向距离」之和最小。

### 化简代价

把 $a$ 和 $b$ 都升序排序后，最优匹配一定是 $a$ 与 $b$ 的某种 **循环移位** 对齐（即存在偏移 $s$，使 $a_i$ 匹配 $b_{(i+s) \bmod n}$）。这是环上最小权匹配的标准结构。

固定一种匹配后，每对代价为：

$$
\langle b_j - a_i \rangle_m =
\begin{cases}
b_j - a_i, & b_j \ge a_i \\
b_j - a_i + m, & b_j < a_i
\end{cases}
$$

把所有对的代价求和：

$$
\sum \langle b_j - a_i \rangle_m = \sum (b_j - a_i) + m \cdot (\text{断点数})
$$

其中「断点」指 $b_j < a_i$ 的对。而 $\sum (b_j - a_i) = \sum b - \sum a$，这是一个与匹配方式无关的常数。所以 **最小化总代价 ⇔ 最小化断点数**。

### 用差分求最小断点数

对固定的下标 $i$，令 $L_i$ 为 $b$ 中严格小于 $a_i$ 的元素个数（升序 $b$ 上二分即可）。那么在偏移 $s$ 下，$a_i$ 匹配 $b_{(i+s) \bmod n}$，发生断点当且仅当 $(i + s) \bmod n \in [0, L_i)$，也就是 $s$ 落在以 $(n - i) \bmod n$ 为起点、长度为 $L_i$ 的 **环形区间** 内。

把每个 $i$ 贡献的环形区间用 **差分数组** 拆成至多两段线性区间加上，最后扫一遍前缀和就能得到每个 $s$ 的断点数，取最小即为答案。由于 $a$ 升序时 $L_i$ 随 $i$ 单调不减，二分也可换成双指针做到 $O(n)$。

## 复杂度

- 时间：$O(n \log n)$，瓶颈在排序；二分 / 差分均为 $O(n \log n)$ / $O(n)$。
- 空间：$O(n)$，存放 $a$、$b$ 与差分数组。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

// 对排序后的 b 二分，返回 b 中严格小于 key 的元素个数（即 lowerBound）。
func countLess(b: Array<Int64>, n: Int64, key: Int64): Int64 {
    var lo = Int64(0)
    var hi = n
    while (lo < hi) {
        let mid = (lo + hi) >> 1
        if (b[mid] < key) {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    return lo
}

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ t: String => Int64.parse(t) })
    let n = first[0]
    let m = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(a)
    sort(b)

    // base = sum(b) - sum(a)，与匹配方式无关
    var sb = Int64(0)
    var sa = Int64(0)
    var i = Int64(0)
    while (i < n) {
        sb += b[i]
        sa += a[i]
        i += 1
    }
    let base = sb - sa

    // 对每个 i，令 Li = b 中严格小于 a[i] 的元素个数。
    // 在偏移 s 下，a[i] 与 b[(i+s) mod n] 配对，断点条件为 b[(i+s) mod n] < a[i]，
    // 即 (i+s) mod n 落在 [0, Li) 内，等价于 s 落在以 (n-i) mod n 为起点、长度 Li 的环形区间。
    // 用环形差分数组统计每个 s 的断点数，取最小值。
    let nn = n
    let diff = Array<Int64>(nn + 1, { _ => 0 })
    i = 0
    while (i < nn) {
        var Li = countLess(b, nn, a[i])
        if (Li > 0) {
            if (Li > nn) {
                Li = nn
            }
            let start = (nn - i) % nn
            let end = start + Li
            if (end <= nn) {
                diff[start] = diff[start] + 1
                diff[end] = diff[end] - 1
            } else {
                diff[start] = diff[start] + 1
                diff[0] = diff[0] + 1
                diff[end - nn] = diff[end - nn] - 1
            }
        }
        i += 1
    }

    var cnt = Int64(0)
    var minBreak = nn
    var s = 0
    while (s < nn) {
        cnt += diff[s]
        if (cnt < minBreak) {
            minBreak = cnt
        }
        s += 1
    }
    println(base + m * minBreak)
}
```

</details>
