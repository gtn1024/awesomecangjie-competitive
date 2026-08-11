---
oj: dmy
pid: '115'
title: '[R20A]题号查询'
difficulty: 普及-
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le x \le 121$，Round 20 有 $7$ 题，其余 Round 均有 $6$ 题。

## 思路

题库按比赛顺序、从 Round 1 到 Round 20 依次编号。Round 1 到 Round 19 每场 $6$ 题，共 $19 \times 6 = 114$ 题，对应编号 $1$ 到 $114$；Round 20 多出一题，编号 $115$ 到 $121$。

因此分两种情况：

- 若 $x \le 114$：第 $r = \lfloor (x-1) / 6 \rfloor + 1$ 场，第 $p = (x-1) \bmod 6$ 题（$p \in [0,5]$，对应字母 A 到 F）。
- 若 $x > 114$：直接是 Round 20 的第 $x - 115$ 题（$p \in [0,6]$，对应字母 A 到 G）。

题号字母用 ASCII 码 $65$ 到 $71$（A 到 G）通过 `String.fromUtf8` 构造即可，输出 `R{r}{字母}`。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let x = Int64.parse(reader.readln().getOrThrow())
    var r: Int64 = 0
    var idx: Int64 = 0
    if (x <= 114) {
        // Round 1..19, 每场 6 题
        r = (x - 1) / 6 + 1
        idx = (x - 1) % 6
    } else {
        // Round 20, 共 7 题 (115..121)
        r = 20
        idx = x - 115
    }
    let letters = Array<String>(7, { i => String.fromUtf8(Array<UInt8>(1, { _ => UInt8(65 + i) })) })
    println("R${r}${letters[idx]}")
    return 0
}
```
