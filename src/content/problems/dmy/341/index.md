---
oj: dmy
pid: '341'
title: '[R55A]一元一次方程'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq a \leq 10^6$，$1 \leq b \leq c \leq 10^6$。

## 思路

由方程 $ax + b = c$ 移项得 $y = \dfrac{c - b}{a}$。题目保证 $c \geq b$，因此 $y \geq 0$。题目要求输出不大于 $y$ 的最大整数，也就是 $\lfloor y \rfloor$。

对非负数而言，整数的下取整就是整除：直接计算 $(c - b) / a$ 即可，无需浮点数。

以样例 2 为例：$c - b = 1919810 - 114514 = 1805296$，$1805296 / 123456 = 14$（整除），与样例输出一致。

## 复杂度

- 时间复杂度：$O(1)$。
- 空间复杂度：$O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let a = v[0]
    let b = v[1]
    let c = v[2]
    println((c - b) / a)
}
```
