---
oj: dmy
pid: '223'
title: '[R37B]生日蛋糕'
difficulty: 普及
tags:
  - 暴力
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> $2 \le n \le 100$，$1 \le a_i \le 10^9$，保证 $a_i$ 互不相同。

## 思路

题目要求选一段长度至少为 $2$ 的连续子数组，使其中 **最大值与次大值之差** 最大化。

直接证明一个很强的结论：**答案等于所有相邻元素差值的绝对值的最大值**，即 $\max_i |a_i - a_{i+1}|$。

- 下界：任意长度为 $2$ 的子数组 $[a_i, a_{i+1}]$ 都是合法选择，此时最大值与次大值之差就是 $|a_i - a_{i+1}|$，所以答案至少为 $\max_i |a_i - a_{i+1}|$。
- 上界：对任意一个长度 $\ge 2$ 的连续子数组 $S$，设其最大值为 $M$（位于位置 $p$）。由于 $a_i$ 互不相同，$M$ 是 $S$ 中唯一的最大值。因为 $S$ 长度至少为 $2$，位置 $p$ 在 $S$ 内必然至少有一个相邻元素 $a_j$（左邻或右邻）。由 $a_j \in S$ 且 $a_j < M$，而次大值 $m_2$ 是 $S$ 中除 $M$ 外的最大元素，故 $a_j \le m_2$。于是

$$
M - m_2 \le M - a_j = |a_p - a_j|,
$$

而 $a_p, a_j$ 是原数组中相邻的两个元素，所以 $M - m_2$ 不超过某个相邻差值的绝对值。上界得证。

因此只需一遍扫描所有相邻对，取绝对值差的最大值即可，**无需暴力枚举所有子数组**。

## 复杂度

时间 $O(n)$，空间 $O(n)$（存输入数组）。$n \le 100$ 远低于上限。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var ans: Int64 = 0
    var i = 1
    while (i < n) {
        let d = a[i] - a[i - 1]
        var absd = d
        if (d < 0) {
            absd = -d
        }
        if (absd > ans) {
            ans = absd
        }
        i += 1
    }
    println(ans)
}
```

</details>
