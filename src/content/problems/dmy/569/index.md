---
oj: dmy
pid: '569'
title: '纸条'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

给定长度为 $n$ 的大写字母串 $S$ 和 $m$ 个互不相同的位置，按给出顺序依次取出 $S$ 中这些位置上的字母并拼接输出。

> 数据规模：$1\le m\le n\le 100$。

## 思路

按题意直接模拟：把 $S$ 读成字符串，再读入 $m$ 个位置 $B_1,\ldots,B_m$，依序输出 $S_{B_i}$ 即可。位置从 $1$ 开始编号，访问时减一转成从 $0$ 开始的下标。由于 $S$ 全为大写英文字母，每个字符就是一个字节，直接按下标取字节输出，无需额外处理。

## 代码

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let m = head[1]
    let s = reader.readln().getOrThrow()
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // 位置从 1 开始，转成从 0 开始的字节下标；S 全为大写字母，按字节取即可
    for (i in 0..m) {
        print(Rune(UInt32(s[b[i] - 1])))
    }
    println("")
}
```
