---
oj: dmy
pid: '222'
title: '[R37A]电话簿'
difficulty: 入门
tags:
  - 字符串
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 1000$，$1 \leq |s_i| \leq 100$。$s_i$ 由小写英文字母和数字组成。

## 思路

按题意对每个字符串逐字符转译：若字符是数字 $x$（$0 \le x \le 9$），替换为第 $x+1$ 个大写英文字母；若是小写字母则原样保留。

由于题目保证输入只含 ASCII 小写字母和数字（均为单字节），可直接按字节处理。数字 `'0'` 的 ASCII 值是 $48$，`'9'` 是 $57$；大写字母 `'A'` 的 ASCII 值是 $65$。映射关系即为 `digit_byte + 17`（因为 $48 + 17 = 65$），或更直观地写作 `'A' + (digit_byte - '0')`，对应 $0 \rightarrow A, 1 \rightarrow B, \dots, 9 \rightarrow J$。

小写字母（ASCII $97 \sim 122$）不在数字区间内，保持原字节即可。把每个字节处理后收集到 `Array<UInt8>` 中，最后用 `String.fromUtf8` 一次性构造结果字符串。

## 复杂度

时间 $O\left(\sum |s_i|\right)$，空间 $O(\max |s_i|)$。每个字符仅做一次比较和可能的加减法，远低于限制。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..n) {
        let s = reader.readln().getOrThrow()
        let bytes = Array<UInt8>(s.size, { i: Int64 =>
            let ch = s[i]
            if (ch >= 0x30u8 && ch <= 0x39u8) {
                // '0'=48, '9'=57: digit x -> 'A' + (x), since '0'->'A', so 'A'(65) + (ch - 48)
                0x41u8 + (ch - 0x30u8)
            } else {
                ch
            }
        })
        println(String.fromUtf8(bytes))
    }
}
```
