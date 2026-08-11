---
oj: dmy
pid: '85'
title: '[R15A] 现在几点'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$0 \le x \le 23$，$0 \le y \le 59$，$1 \le t \le 10^6$。

## 思路

把起始时刻换算成「当天第几分钟」$x \times 60 + y$，加上持续时间 $t$ 后对 $1440$（一天的总分钟数）取模，得到结束时刻的分钟数，再除回去得到时和分。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let xyt = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let total = (xyt[0] * 60 + xyt[1] + xyt[2]) % 1440
    let out = StringBuilder()
    out.append(total / 60)
    out.append(" ")
    out.append(total % 60)
    println(out.toString())
    return 0
}
```

要点：

- 跨天的情况由取模统一处理：$t$ 可达 $10^6$ 分钟（约 694 天），直接先加后取模即可，不需要模拟每一天。
- `total / 60` 与 `total % 60` 分别是结束时刻的小时和分钟。
