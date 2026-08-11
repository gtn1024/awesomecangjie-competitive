---
oj: dmy
pid: '98'
title: '[R17B]最多连胜'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，字符串 $S$ 仅由 `W` 和 `L` 构成。

## 思路

从左到右扫描字符串，维护当前连胜段长度 `cur` 和历史最大连胜 `max`：

- 遇到 `W` 时，`cur += 1`，并用它更新 `max`；
- 遇到 `L` 时，连胜被中断，`cur` 清零。

扫描一遍即可得到所有连胜段长度的最大值。

## 复杂度

时间 $O(n)$，空间 $O(1)$（不计读入的字符串）。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main(): Int64 {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    var max = 0
    var cur = 0
    for (ch in s.runes()) {
        if (ch == r'W') {
            cur += 1
            if (cur > max) {
                max = cur
            }
        } else {
            cur = 0
        }
    }
    println("${max}")
    return 0
}
```
