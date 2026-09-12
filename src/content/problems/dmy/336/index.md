---
oj: dmy
pid: '336'
title: '[R54C]切割圆'
difficulty: 提高
tags:
  - 滑动窗口
  - 位运算
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le n \le 2 \times 10^5$，$0 \le a_i \le 10^9$。

## 思路

环上共 $2n$ 个元素，一条直线切下后两部分各恰为 $n$ 个连续元素，所以所有可能的切法就是枚举一个起点 $s \in [0, 2n)$，取环上从 $s$ 开始的连续 $n$ 个元素作为一部分 $b$，剩余 $n$ 个作为另一部分 $c$。

设起点 $s$ 对应的连续 $n$ 元素之和为 $sum_1$，整环总和为 $total$，则另一部分之和为 $total - sum_1$。目标是最大化：

$$
sum_1 \oplus (total - sum_1)
$$

所有切法只差在 $sum_1$ 上，而 $sum_1$ 随起点 $s$ 每次右移一格，仅发生「减去离开窗口的 $a_{s-1}$、加上进入窗口的 $a_{(s+n-1) \bmod 2n}$」的增量变化。因此用 **滑动窗口** 在 $O(n)$ 内求出全部 $2n$ 个 $sum_1$，逐一计算异或值取最大即可。

## 复杂度

- 时间：$O(n)$，滑动窗口每个元素进出各一次。
- 空间：$O(n)$，存储 $2n$ 个数。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let m = n * 2
    var total: Int64 = 0
    for (i in 0..m) {
        total += a[i]
    }
    // 滑动窗口大小为 n，初始窗口为 a[0..n-1]
    var sum1: Int64 = 0
    for (i in 0..n) {
        sum1 += a[i]
    }
    var ans: Int64 = sum1 ^ (total - sum1)
    var s: Int64 = 1
    while (s < m) {
        // 起点为 s 的窗口：减去 a[s-1]，加上 a[(s+n-1) mod m]
        let outIdx = s - 1
        let inIdx = (s + n - 1) % m
        sum1 = sum1 - a[outIdx] + a[inIdx]
        let cur = sum1 ^ (total - sum1)
        if (cur > ans) {
            ans = cur
        }
        s++
    }
    println(ans)
}
```
