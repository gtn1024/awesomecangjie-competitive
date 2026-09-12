---
oj: dmy
pid: '435'
title: '[R70C] 弱化'
difficulty: 入门
tags:
  - 构造
timeLimit: 1s
memoryLimit: 512m
---

## 思路

关键观察：任意整数 $x \ge 3$ 都是弱回文数。取进制 $b = x - 1$，则

$$
x = 1 \cdot (x - 1) + 1
$$

即 $x$ 在 $b$ 进制下表示为 $(11)_b$，恰好两位且回文。

因此：

- $x = 1$ 或 $x = 2$ 时，任何进制下都只有一位数字（$2$ 在二进制下为 $(10)_2$ 不是回文），输出 `No`；
- $x \ge 3$ 时输出 `Yes`，以及任意一个合法进制 $b = x - 1$。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

func solve(reader: ConsoleReader): Unit {
    let x = Int64.parse(reader.readln().getOrThrow())
    if (x >= 3) {
        println("Yes")
        println(x - 1)
    } else {
        println("No")
    }
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        solve(reader)
    }
}
```
