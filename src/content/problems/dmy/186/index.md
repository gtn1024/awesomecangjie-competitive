---
oj: dmy
pid: '186'
title: '[R31A]校验码'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 1000$，每串长度为 $13$，仅含数字 $0 \sim 9$。

## 思路

直接按题面分两路求和即可。下标从 $0$ 起，对应 1-based 的位置编号；**偶数下标**（$0,2,4,\dots,12$）对应 1-based 的奇数位置，**奇数下标**（$1,3,5,\dots,11$）对应偶数位置。

- 把奇数位置（偶数下标）的数字累加得 $\mathit{oddSum}$，令 $C_1 = \mathit{oddSum} \times 3$。
- 把偶数位置（奇数下标）的数字累加得 $\mathit{evenSum}$，令 $C_2 = \mathit{evenSum}$。
- 输出 $C_3 = (C_1 + C_2) \bmod 10$。

逐字符按 `UTF-8` 字节取差得到数值（数字 $0 \sim 9$ 的 ASCII 连续），无需任何额外数据结构。

复杂度：时间 $O(T \cdot 13)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

func solve(reader: ConsoleReader): Int64 {
    let s = reader.readln().getOrThrow()
    var oddSum: Int64 = 0
    var evenSum: Int64 = 0
    for (i in 0..13) {
        let d = Int64(UInt32(s.toRuneArray()[i]) - UInt32(r'0'))
        if (i % 2 == 0) {
            oddSum += d
        } else {
            evenSum += d
        }
    }
    let c1 = oddSum * 3
    let c2 = evenSum
    return (c1 + c2) % 10
}

main() {
    let reader = Console.stdIn
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        println(solve(reader))
    }
}
```

要点：

- 每组只读一整行字符串，下标 $0,2,4,\dots,12$ 求和后乘 $3$ 得 $C_1$，下标 $1,3,\dots,11$ 求和得 $C_2$。
- 通过 `s.toRuneArray()` 按下标取 Rune，再 `UInt32(rune) - UInt32(r'0')` 转成数字值，避免 `s[i]` 返回字节带来的语义歧义。
- $T$ 组逻辑封装在 `solve()`，`main` 只负责读 $T$ 并循环调用。
