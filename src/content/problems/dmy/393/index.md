---
oj: dmy
pid: '393'
title: '[R63C] 这是一个01串题1'
difficulty: 普及
tags:
  - 贪心
  - 差分数组
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$s$ 和 $t$ 仅包含字符 `0` 和 `1`。

## 思路

先构造差异数组：$d_i = 1$ 当且仅当 $s_i \ne t_i$，否则 $d_i = 0$。

原问题等价于：在 $d$ 上每次选择一个区间并把其中的所有值翻转，求把 $d$ 变为全 $0$ 的最少操作次数。

如果某次翻转的区间里含有 `0`，这些 `0` 会被翻成 `1`，相当于凭空创造出新的差异段，不会让总操作数更优。因此每次操作恰好翻转一段连续的 `1` 总是最优的：这样一段连续的 `1` 一次操作就能整体清零。

于是最少操作次数就等于 $d$ 中连续 `1` 的段数。只需遍历一遍，每当遇到一个差异位且它前一位不是差异位时，就开启了一段新的连续 `1`，计数加一即可。

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow().toRuneArray()
    let t = reader.readln().getOrThrow().toRuneArray()
    var ans = 0
    var i = Int64(0)
    while (i < n) {
        if (s[i] != t[i]) {
            // 进入一段新的连续 1，计数一次并跳过整段
            ans = ans + 1
            while (i < n && s[i] != t[i]) {
                i = i + 1
            }
        } else {
            i = i + 1
        }
    }
    println(ans)
}
```

## 要点

- **核心转化**：用差异数组 $d_i = [s_i \ne t_i]$ 把「翻转 $s$ 的区间使 $s=t$」归约为「翻转 $d$ 的区间使 $d$ 清零」。
- **贪心最优**：翻转区间内含 `0` 只会创造新差异段，所以最优操作恰好一段一段地翻转连续的 `1`，答案就是连续 `1` 的段数。
- **计数技巧**：只需统计「当前位是差异位、上一位不是差异位」的位置个数，无需显式建出差分数组。
