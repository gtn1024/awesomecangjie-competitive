---
oj: dmy
pid: '422'
title: '[R68B] 插入图片'
difficulty: 入门
tags:
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le |s| \le 500$，图片说明非空且仅含大小写英文字母，图片地址以 `https://` 开头、以 `.png` 结尾。

## 思路

合法图片代码格式固定为 `![说明](图片地址)`：前两个字符是 `!` 和 `[`，说明紧跟其后，到第一个 `]` 结束。因此直接遍历字符串，从下标 2 开始收集字符，遇到 `]` 停止，收集到的即为图片说明。

说明只含英文字母，均为单字节 ASCII，按字节处理也不会出错。

复杂度：时间 $O(|s|)$，空间 $O(|s|)$（输出说明本身）。

## 仓颉实现

```cangjie
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow().toRuneArray()
    let sb = StringBuilder()
    var i: Int64 = 2
    while (s[i] != r']') {
        sb.append(s[i])
        i++
    }
    println(sb.toString())
    return 0
}
```

要点：

- `toRuneArray()` 把字符串转为字符数组，`r']'` 是 Rune 字面量，二者可直接比较。
- 下标 2 起跳，正好跳过 `![` 两个字符。
