---
oj: dmy
pid: '19'
title: '[R4A] 数位交换'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

## 思路

设百位、十位、个位分别为 $a$、$b$、$c$，即 $a = X / 100$，$b = (X - a \times 100) / 10$，$c = X \% 10$。

交换个位与百位后得到 $c \times 100 + b \times 10 + a$。由于是作为整数输出，前导 $0$ 会被自然省略（如 $650 \rightarrow 56$），因此不需要特殊处理。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let x = Int64.parse(reader.readln().getOrThrow())
    let a = x / 100
    let b = (x - a * 100) / 10
    let c = x % 10
    println(a + b * 10 + c * 100)
}
```
