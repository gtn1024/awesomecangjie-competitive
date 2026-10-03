---
oj: dmy
pid: '453'
title: '[R73C] 贴纸机'
difficulty: 简单
tags:
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 2 \times 10^5$，$2 \le k \le 10^9$，$1 \le s, a_i \le k$。

## 思路

贴纸机只在**制作成功**时切换颜色，且切换方向固定为循环递增 $1 \to 2 \to \dots \to k \to 1$。因此所有成功贴纸的目标颜色，按照被处理的先后顺序，只能依次是

$$s,\ s+1,\ \dots,\ k,\ 1,\ 2,\ \dots$$

失败的贴纸可以任意穿插在成功贴纸之间，且不会改变贴纸机当前颜色，所以问题转化为：**最多能顺着这条固定循环序列走多远**。

记 $cnt[c]$ 为颜色 $c$ 在输入中出现的次数，$offset(c) = (c - s) \bmod k$ 为从颜色 $s$ 沿循环走到颜色 $c$ 的步数。颜色 $c$ 在成功序列中的第 $L$ 次出现，位于序列的第 $offset(c) + (L-1)k$ 个位置（下标从 $0$ 开始）。序列合法当且仅当每种颜色的出现次数不超过 $cnt[c]$，因此颜色 $c$ 的第 $cnt[c]+1$ 次出现（第一次越界）位置为

$$t(c) = offset(c) + cnt[c] \cdot k$$

在第一个越界位置 $t_0 = \min_c t(c)$ 之前的每个位置，对应颜色的余量都还够用；而一旦越界，之后任何包含该位置的序列都不合法（该颜色此后每次出现都会再次越界）。故最大成功数

$$\text{ans} = \min\left(n,\ \min_{1 \le c \le k} t(c)\right)$$

## 实现要点

- 若 $k \le n$，则 $k \le 2 \times 10^5$，可以直接开数组统计每种颜色的出现次数，再枚举所有颜色求 $t(c)$ 的最小值。
- 若 $k > n$，则必然存在未出现的颜色。未出现颜色的 $t(c) = offset(c) \in [0, k-1]$，而所有出现过的颜色 $t(c) \ge k$，所以答案完全由**从 $s$ 出发第一个没出现过的颜色**决定。用哈希集合记录出现过的颜色，从 $s$ 开始沿循环逐格前进，直到遇到未出现的颜色为止；由于不同的出现颜色至多 $n$ 个，最多前进 $n+1$ 格必然停下。

## 复杂度

时间 $O(n)$，空间 $O(\min(n, k))$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({
        p: String => Int64.parse(p)
    })
    let n = first[0]
    let k = first[1]
    let s = first[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({
        p: String => Int64.parse(p)
    })
    let t0: Int64
    if (k <= n) {
        // k 小（k <= n <= 2e5），每种颜色都能枚举
        let cnt = Array<Int64>(k, { _ => 0 })
        for (x in a) {
            cnt[x - 1] = cnt[x - 1] + 1
        }
        let s0 = s - 1
        var best: Int64 = 1000000000000000000
        for (c in 0..k) {
            let offset = (c - s0 + k) % k
            // 颜色 c 的第 cnt[c]+1 次出现位置，第一次越界即失败
            let bad = offset + cnt[c] * k
            if (bad < best) {
                best = bad
            }
        }
        t0 = best
    } else {
        // k > n 时必有未出现的颜色，答案取决于从 s 向后第一个未出现颜色
        let seen = HashSet<Int64>()
        for (x in a) {
            seen.add(x - 1)
        }
        let s0 = s - 1
        var d: Int64 = 0
        while (seen.contains((s0 + d) % k)) {
            d = d + 1
        }
        t0 = d
    }
    let ans = if (t0 < n) { t0 } else { n }
    println(ans)
}
```

</details>