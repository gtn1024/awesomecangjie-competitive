---
oj: dmy
pid: '112'
title: '[R19D]构造序列'
difficulty: 提高
tags:
  - 动态规划
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$1 \le A, B, c_i \le 10^9$。

## 思路

把目标序列切成若干段，每段恰好由一次操作生成。一次操作要么生成「若干个相同的数」（操作 1，花费 $A$），要么生成「连续递增的数」（操作 2，花费 $B$），段内所有相邻对必须满足同一种规律。

关键观察：每个位置 $i$ 和它的前一个位置 $i-1$ 之间，只可能是以下三种关系之一：

- $c_i = c_{i-1}$：这一对可以用操作 1（同值段）延续；
- $c_i = c_{i-1} + 1$：这一对可以用操作 2（递增段）延续；
- 其他：与前一个位置无法延续，必须新开一段。

用两状态 DP（只保留「上一位置的最小代价」，滚动掉下标）：

- `f`：当前处理到的位置，它所在段是 **同值段**（对应操作 1）时的最小花费；
- `g`：当前处理到的位置，它所在段是 **递增段**（对应操作 2）时的最小花费。

初值 `f = A`，`g = B`（第一个元素单独成段，两种操作都能用）。从左到右扫描，设当前位置与前一个的关系为 `cur` 与 `prev`：

- `nf = (cur == prev) ? f : min(f, g) + A`。能延续同值段就免费延续，否则在前面的最优解基础上新开一个同值段。
- `ng = (cur == prev + 1) ? g : min(f, g) + B`。同理处理递增段。

答案为 `min(f, g)`。

每个位置只做常数次比较和加法，整体 $O(n)$，空间 $O(1)$（除保存数组外）；其中数组只在前一轮比较时用到，可以直接读入后顺序访问。

## 复杂度

时间 $O(n)$，空间 $O(n)$（存目标序列）。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let header = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = header[0]
    let a = header[1]
    let b = header[2]
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // f = 当前位置所在段为「同值」（操作 1）时的最小花费
    // g = 当前位置所在段为「递增」（操作 2）时的最小花费
    var f = a
    var g = b
    for (i in 1..n) {
        let prev = c[i - 1]
        let cur = c[i]
        let nf = if (cur == prev) { f } else { (if (f < g) { f } else { g }) + a }
        let ng = if (cur == prev + 1) { g } else { (if (f < g) { f } else { g }) + b }
        f = nf
        g = ng
    }
    let ans = if (f < g) { f } else { g }
    println(ans)
}
```
