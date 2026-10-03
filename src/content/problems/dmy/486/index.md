---
oj: dmy
pid: '486'
title: '[R78F] 归零'
difficulty: 提高+
tags:
  - 前缀和
  - 树状数组
  - 离散化
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$0 \le k \le 10^{14}$，$-10^9 \le a_i \le 10^9$。

## 思路

设前缀和 $s_i = a_1 + a_2 + \cdots + a_i$（$s_0 = 0$）。关键观察：计数器从 $x = 0$ 出发依次读取 $a_l, a_{l+1}, \dots, a_r$ 后，最终读数为

$$x = s_r - \min_{l-1 \le j \le r} s_j.$$

对长度归纳即证：设处理到 $i-1$ 时 $x = s_{i-1} - m_{i-1}$，其中 $m_{i-1} = \min_{l-1 \le j \le i-1} s_j$，则

$$x \gets \max(0,\ x + a_i) = \max(0,\ s_i - m_{i-1}) = s_i - \min(m_{i-1}, s_i),$$

正好是把 $s_i$ 纳入最小值后的结果。

令 $j = l - 1$，问题转化为：统计满足 $0 \le j < r \le n$ 且

$$\min_{t \in [j,\, r]} s_t = s_r - k$$

的下标对 $(j, r)$ 个数。

固定右端点 $r$，记 $m = s_r - k$。区间 $[j, r]$ 上的最小值恰好等于 $m$，当且仅当同时满足：

- 区间内没有小于 $m$ 的值，即 $j$ 要大于最后一个满足 $s_t < m$ 的下标 $q$；
- 区间内有等于 $m$ 的值，即 $j$ 不超过最后一个满足 $s_t = m$ 的下标 $v$。

因此合法的 $j$ 恰好是整数区间

$$q + 1 \le j \le \min(v,\ r - 1),$$

贡献为 $\max(0,\ \min(v, r-1) - q)$ 个。

接下来只需对每个 $r$ 快速求 $q$ 与 $v$。把所有前缀和离散化，扫描 $r$ 的同时维护「每个取值最后一次出现的下标」：

- $q$：值域上小于 $m$ 的所有位置中最后下标的最大值，用树状数组维护下标最大值，做前缀查询；
- $v$：直接用一个数组记录每个离散值最后出现的下标。

实现上先把 $s_r$ 插入数据结构再查询 $r$：由于 $s_r = m + k \ge m$，它不会干扰「小于 $m$」的查询；而 $k = 0$ 时 $s_r = m$，恰好使 $v = r$ 自动成立，无需特判。

## 复杂度

离散化排序 $O(n \log n)$，每个 $r$ 一次树状数组更新、一次前缀查询与常数次二分，共 $O(n \log n)$；空间 $O(n)$。

答案最大为 $n(n+1)/2 \approx 2 \times 10^{10}$，需要用 `Int64` 存放。

## 仓颉实现

```cangjie
import std.env.*
import std.sort.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0
var glen: Int64 = 0

func nextInt(): Int64 {
    while (gpos < glen && Int64(gdata[gpos]) <= 32) {
        gpos += 1
    }
    var sign: Int64 = 1
    if (gpos < glen && Int64(gdata[gpos]) == 45) {
        sign = -1
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < glen && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x * sign
}

func lowerBound(a: Array<Int64>, x: Int64): Int64 {
    var left: Int64 = 0
    var right = a.size
    while (left < right) {
        let mid = (left + right) / 2
        if (a[mid] < x) {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left
}

func bitUpdate(bit: Array<Int64>, size: Int64, pos0: Int64, v: Int64): Unit {
    var pos = pos0
    while (pos <= size) {
        if (v > bit[pos]) {
            bit[pos] = v
        }
        pos += pos & (-pos)
    }
}

func bitQuery(bit: Array<Int64>, pos0: Int64): Int64 {
    var pos = pos0
    var res: Int64 = -1
    while (pos > 0) {
        if (bit[pos] > res) {
            res = bit[pos]
        }
        pos -= pos & (-pos)
    }
    return res
}

main() {
    let reader = getStdIn()
    gdata = reader.readToEnd().getOrThrow().toArray()
    glen = gdata.size

    let n = nextInt()
    let k = nextInt()
    let s = Array<Int64>(n + 1, { _ => 0 })
    for (i in 1..=n) {
        s[i] = s[i - 1] + nextInt()
    }

    let vals = Array<Int64>(n + 1, { i: Int64 => s[i] })
    sort(vals)
    let size = vals.size

    let bit = Array<Int64>(size + 1, { _ => -1 })
    let lastEq = Array<Int64>(size + 1, { _ => -1 })

    var ans: Int64 = 0
    let c0 = lowerBound(vals, s[0]) + 1
    bitUpdate(bit, size, c0, 0)
    lastEq[c0] = 0
    for (r in 1..=n) {
        let c = lowerBound(vals, s[r]) + 1
        bitUpdate(bit, size, c, r)
        lastEq[c] = r
        // 需要 min_{t in [j, r]} s_t = s[r] - k
        let target = s[r] - k
        let lb = lowerBound(vals, target)
        let q = bitQuery(bit, lb)
        var v: Int64 = -1
        if (lb < size && vals[lb] == target) {
            v = lastEq[lb + 1]
        }
        if (v >= 0) {
            var hi = v
            if (hi > r - 1) {
                hi = r - 1
            }
            let lo = q + 1
            if (hi >= lo) {
                ans += hi - lo + 1
            }
        }
    }
    println(ans)
}
```
