---
oj: dmy
pid: '385'
title: '[R62A] 比较大小'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le X, Y \le 9$。

## 思路

直接计算 $10X+Y$ 与 $10Y+X$ 两个值并输出较大者。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let xy = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let x = xy[0]
    let y = xy[1]
    let a = 10 * x + y
    let b = 10 * y + x
    println(if (a > b) { a } else { b })
}
```

要点：

- 比较与输出可以用 `if` 表达式一步完成，两个分支的值类型一致。
