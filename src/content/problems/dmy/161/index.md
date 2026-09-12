---
oj: dmy
pid: '161'
title: '[R27A]3^3'
difficulty: 入门
tags:
  - 模拟
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le |s| \le 100$，$s$ 只包含字符 `3`。

## 思路

读入字符串 $s$，它的长度 $n$ 即为要输出的 `3` 的个数。答案是一个由 $n$ 个 `3` 与 $n-1$ 个 `^` 交替组成的字符串，即在每两个 `3` 之间插入一个 `^`。循环 $n$ 次直接用 `print` 输出，非首次时先输出 `^`，最后 `println` 换行即可。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow()
    let n = s.size
    for (i in 0..n) {
        if (i > 0) {
            print("^")
        }
        print("3")
    }
    println()
}
```
