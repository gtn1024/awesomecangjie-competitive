---
oj: dmy
pid: '323'
title: '[R52B] RE'
difficulty: 入门
tags:
  - 模拟
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，字符串仅由小写英文字母组成。

## 思路

题目中的变换分别交换 `b` 与 `d`、`p` 与 `q`。每一对字符交换两次都会恢复原状，因此这个变换的逆变换就是它本身。

从左到右遍历错乱后的字符串：遇到 `b` 时添加 `d`，遇到 `d` 时添加 `b`，遇到 `p` 时添加 `q`，遇到 `q` 时添加 `p`，其余字符保持不变。所有字符处理完后得到原字符串。

复杂度：时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    for (ch in s.runes()) {
        if (ch == r'b') {
            print(r'd')
        } else if (ch == r'd') {
            print(r'b')
        } else if (ch == r'p') {
            print(r'q')
        } else if (ch == r'q') {
            print(r'p')
        } else {
            print(ch)
        }
    }
    println()
}
```
