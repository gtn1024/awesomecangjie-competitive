---
oj: dmy
pid: '488'
title: '[R79A] 通行证'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le a, b \le 9$，$1 \le k \le 99$。

## 思路

正向读数为 $10a+b$，反向读数为 $10b+a$，分别判断能否被 $k$ 整除。

「**恰好一个方向**」是异或关系：两个方向都能整除，或都不能整除，都不是单向通行证。于是答案就是两个布尔值的异或，为真输出 `Yes`，否则输出 `No`。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let input = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let a = input[0]
    let b = input[1]
    let k = input[2]
    let forward = 10 * a + b
    let backward = 10 * b + a
    if ((forward % k == 0) != (backward % k == 0)) {
        println("Yes")
    } else {
        println("No")
    }
}
```
