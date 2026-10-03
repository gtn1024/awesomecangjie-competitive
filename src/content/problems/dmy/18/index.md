---
oj: dmy
pid: '18'
title: '[R3F] 平均数和'
difficulty: 提高
tags:
  - 树状数组
  - 离散化
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 5 \times 10^5$，$1 \le A_i,x \le 2 \times 10^6$。

## 思路

令 $B_i = A_i - x$，则 $avg(l,r) \ge x \iff \sum_{i=l}^r B_i \ge 0$。设 $SB$、$SA$ 分别为 $B$、$A$ 的前缀和，条件等价于 $SB(r) \ge SB(l-1)$。

枚举右端点 $r$，满足条件的左端点 $l$ 对应 $j = l-1 \in [0, r-1]$ 且 $SB(j) \le SB(r)$。区间和 $SA(r) - SA(j)$ 对答案的总贡献为：

$$\sum_{j} (SA(r) - SA(j)) = SA(r) \times cnt - \sum_j SA(j)$$

其中 $cnt$ 与 $\sum_j SA(j)$ 分别是满足 $SB(j) \le SB(r)$ 的 $j$ 的数量与 $SA$ 之和。把 $SB$ 值离散化后用两棵 **树状数组** 分别维护这两个量，每步先插入 $j = r-1$ 再查询。

复杂度：时间 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

const MOD = 998244353

func bitAdd(bit: Array<Int64>, pos: Int64, delta: Int64, size: Int64) {
    var i = pos
    while (i <= size) {
        bit[i] += delta
        i += i & (-i)
    }
}

func bitSum(bit: Array<Int64>, pos: Int64): Int64 {
    var s: Int64 = 0
    var i = pos
    while (i > 0) {
        s += bit[i]
        i -= i & (-i)
    }
    return s
}

// 在已排序 vals 中找第一个 >= v 的位置（1-based）
func lowerBound(vals: Array<Int64>, v: Int64): Int64 {
    var lo: Int64 = 0
    var hi: Int64 = vals.size
    while (lo < hi) {
        let mid = (lo + hi) / 2
        if (vals[mid] < v) {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    return lo + 1
}

main() {
    let reader = getStdIn()
    let nx = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nx[0]
    let x = nx[1]
    let nn = n
    let arr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var sa = Array<Int64>(nn + 1, { _ => 0 })
    var sb = Array<Int64>(nn + 1, { _ => 0 })
    var accA: Int64 = 0
    var accB: Int64 = 0
    for (i in 1..=nn) {
        let v = arr[i - 1]
        accA += v
        accB += v - x
        sa[i] = accA
        sb[i] = accB
    }
    // 离散化 SB
    var vals = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 0..=nn) {
        vals[i] = sb[i]
    }
    sort(vals)
    var rank = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 0..=nn) {
        rank[i] = lowerBound(vals, sb[i])
    }
    let m = nn + 1
    var cntBit = Array<Int64>(m + 1, { _ => 0 })
    var sumBit = Array<Int64>(m + 1, { _ => 0 })
    var ans: Int64 = 0
    for (r in 1..=nn) {
        let j = r - 1
        bitAdd(cntBit, rank[j], 1, m)
        bitAdd(sumBit, rank[j], sa[j] % MOD, m)
        let c = bitSum(cntBit, rank[r])
        let s = bitSum(sumBit, rank[r])
        ans = (ans + (sa[r] % MOD) * (c % MOD) - s) % MOD
        if (ans < 0) {
            ans += MOD
        }
    }
    println(ans)
}
```

</details>

要点：

- $SA(r)$ 可达 $10^{12}$，前缀和数组用 `Int64`；答案按模 $998244353$ 计算，树状数组里存 $SA(j) \bmod MOD$ 即可。
- 比较 $avg \ge x$ 用 $SB(r) \ge SB(j)$ 的整数比较，避免浮点。
- 每轮先插入 $j = r-1$ 再查询，保证只统计 $j \le r-1$（即非空区间）。
