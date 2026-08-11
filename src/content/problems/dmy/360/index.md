---
oj: dmy
pid: '360'
title: '[R58A] 读小说'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le A, B, X \le 10^3$，$A \le X$。

## 思路

第一天读完 $A$ 页后，还剩下 $X - A$ 页。从第二天起每天读 $B$ 页，最后一天不足 $B$ 页也会全部读完，因此剩下的页数需要 $\lceil (X - A) / B \rceil$ 天。

总天数：

$$1 + \left\lceil \frac{X - A}{B} \right\rceil = 1 + \left\lfloor \frac{X - A + B - 1}{B} \right\rfloor$$

当 $X = A$ 时，剩余页数为 $0$，上式仍正确（答案为 $1$ 天）。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let X = s[0]
    let A = s[1]
    let B = s[2]
    let rest = X - A
    println(1 + (rest + B - 1) / B)
    return 0
}
```
