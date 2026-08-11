---
oj: dmy
pid: '270'
title: '[R44B]任务处理'
difficulty: 普及
tags:
  - 模拟
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le x \le 10^9$，$0 \le a_i \le 10^9$。

## 思路

用一个变量 $q$ 维护当前待处理队列中的任务数，初始为 $0$。每一天先累加当天新下发的任务 $a_i$，即 $q \leftarrow q + a_i$；当天最多处理 $x$ 个任务，所以处理完后 $q \leftarrow \max(0,\ q - x)$（队列不足 $x$ 时直接清空，不会处理成负数）。

为什么这样是 **最少** 剩余：每天的处理量上限固定为 $x$，且积压的任务无法跨天「补回」当天的时间，所以贪心地每天把可用时间用满，自然得到剩余量的最小值。

$n$ 天后输出 $q$ 即可。累加上界为 $n \cdot x \approx 2 \times 10^{14}$，需要用 `Int64` 存储。

## 复杂度

- 时间：$O(n)$，一次遍历。
- 空间：$O(n)$，存储输入数组。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let x = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var q: Int64 = 0
    for (i in 0..n) {
        q = q + a[i]
        q = q - x
        if (q < 0) {
            q = 0
        }
    }
    println(q)
    return 0
}
```

要点：

- 每天的状态转移等价于 $q \leftarrow \max(0,\ q + a_i - x)$，用 `if` 把负值钳到 $0$。
- $a_i$、$x$ 与累加后的 $q$ 均可能达到 $10^{14}$ 量级，全程使用 `Int64`。
