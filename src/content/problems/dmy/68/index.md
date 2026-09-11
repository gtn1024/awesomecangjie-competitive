---
oj: dmy
pid: '68'
title: '[R12B] 减法游戏'
difficulty: 入门
tags:
  - 模拟
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le a, b \le 10^6$。

## 思路

直接按题意用 `while` 循环模拟：两数不相等时，较大者得一分并减去对方的数字，直到相等为止。得分分别累计在甲的得分和乙的得分中。

复杂度：时间 $O(a+b)$，空间 $O(1)$。极限数据（如 $a=1, b=10^6$）约 $10^6$ 轮，完全在时限内。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let ab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var a = ab[0]
    var b = ab[1]
    var sa: Int64 = 0
    var sb: Int64 = 0
    while (a != b) {
        if (a > b) {
            sa = sa + 1
            a = a - b
        } else {
            sb = sb + 1
            b = b - a
        }
    }
    println("${sa} ${sb}")
    return 0
}
```

要点：

- 循环中同一轮内「加分」和「改数」是原子操作，不存在两人同时加分的情况，因为 $a \ne b$ 时必有大小关系。
- 直接用 `println` 输出两个得分，避免行尾多余空格。
