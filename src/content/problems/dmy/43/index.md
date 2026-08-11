---
oj: dmy
pid: '43'
title: '[R8A] 买糖果'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le c_i, n_i \le 100$。

## 思路

总花费为三种糖果的单价与数量乘积之和：$c_1 \times n_1 + c_2 \times n_2 + c_3 \times n_3$。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    println(c[0] * n[0] + c[1] * n[1] + c[2] * n[2])
}
```
