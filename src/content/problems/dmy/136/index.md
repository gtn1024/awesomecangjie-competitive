---
oj: dmy
pid: '136'
title: '[R23A]新的进制数'
difficulty: 普及−
tags:
  - 模拟
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：符号 $a_i$ 仅含数字与字母且两两不同，$1 \leq |s| \leq 1000$，$s$ 仅含 `0`-`9` 与 `A`-`F`，前导 $0$ 需保留。

## 思路

读入第一行的 $16$ 个符号，按下标存成数组 `syms`，下标即对应数值 $0 \sim 15$。第二行的十六进制串 $s$ 逐字符处理：`'0'`-`'9'` 的数值就是字节值减去 `0x30`，`'A'`-`'F'` 的数值是字节值减去 `0x41` 再加 $10$。用得到的数值作下标取 `syms[v]`，依次拼接到结果即可。由于是逐位直接映射，前导 $0$ 自动保留。

## 复杂度

时间 $O(|s|)$，空间 $O(|s|)$。

## 仓颉实现

```cangjie
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    // 16 个字符，空格分隔，分别代表 0..15
    let syms = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    // 十六进制字符串
    let s = reader.readln().getOrThrow()

    // 建立十六进制字符 0..9,A..F -> 符号的映射
    // '0'..'9' 对应 0..9, 'A'..'F' 对应 10..15
    let sb = StringBuilder()
    for (ch in s) {
        var v: Int64 = 0
        if (ch >= 0x30 && ch <= 0x39) {   // '0'..'9'
            v = Int64(ch - 0x30)
        } else {                          // 'A'..'F'
            v = Int64(ch - 0x41) + 10
        }
        sb.append(syms[v])
    }
    println(sb.toString())
    return 0
}
```
