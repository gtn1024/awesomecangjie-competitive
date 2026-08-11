---
oj: dmy
pid: '433'
title: '[R70A] 天平'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

## 思路

按操作标记 $op$ 输出 $x$、$y$ 中的较大值或较小值：

- $op = 1$ 时，输出 $\max(x, y)$；
- $op = 0$ 时，输出 $\min(x, y)$。

数据范围是 $-10^9 \le x, y \le 10^9$，用 64 位整数即可，直接比较后输出。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let x = a[0]
    let y = a[1]
    let op = a[2]
    let ans = if (op == 1) {
        if (x > y) { x } else { y }
    } else {
        if (x < y) { x } else { y }
    }
    println(ans)
}
```
