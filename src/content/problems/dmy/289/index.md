---
oj: dmy
pid: '289'
title: '[R47A]三数二母串'
difficulty: 入门
tags:
  - 字符串
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le |s| \le 100$，$s$ 由大写字母、小写字母和数字构成。

## 思路

按定义直接模拟：从左到右扫描字符串 $s$ 的每个字符，若是数字字符就重复 $3$ 次，若是字母字符就重复 $2$ 次，依次拼接即得三数二母串。

逐字节判断字符类别（数字 `'0'`–`'9'` 的 ASCII 值为 $48$–$57$，大写字母 `'A'`–`'Z'` 为 $65$–$90$，小写字母 `'a'`–`'z'` 为 $97$–$122$），用 `StringBuilder` 收集结果。

复杂度：时间 $O(|s|)$，空间 $O(|s|)$。

## 仓颉实现

```cangjie
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow()
    var sb = StringBuilder()
    for (ch in s) {
        if (ch >= 48u8 && ch <= 57u8) {
            let r = Rune(UInt32(ch))
            sb.append(r)
            sb.append(r)
            sb.append(r)
        } else if ((ch >= 65u8 && ch <= 90u8) || (ch >= 97u8 && ch <= 122u8)) {
            let r = Rune(UInt32(ch))
            sb.append(r)
            sb.append(r)
        }
    }
    println(sb.toString())
    return 0
}
```
