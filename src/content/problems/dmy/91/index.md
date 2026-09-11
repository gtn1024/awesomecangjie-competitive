---
oj: dmy
pid: '91'
title: '[R16A] 总分'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$0 \le a, b, c \le 10^6$。

## 思路

及格、良好、优秀的分数范围分别是 $60 \sim 79$、$80 \sim 89$、$90 \sim 100$。总分最大时每类科目都取最高分，即 $79a + 89b + 100c$；最小时每类都取最低分，即 $60a + 80b + 90c$。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let abc = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let mx = abc[0] * 79 + abc[1] * 89 + abc[2] * 100
    let mn = abc[0] * 60 + abc[1] * 80 + abc[2] * 90
    print(mx)
    print(" ")
    println(mn)
    return 0
}
```

要点：

- 最大值和最小值互不影响，各自独立计算后一起输出。
- 数值上限约 $3 \times 10^8$，`Int64` 足够。
