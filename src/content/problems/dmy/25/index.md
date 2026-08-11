---
oj: dmy
pid: '25'
title: '[R5A] 空心正方形'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 100$。

## 思路

按行构造：第一行输出 $n$ 个 `#`；中间 $n-2$ 行每行输出 `#`、$n-2$ 个空格、`#`；最后一行再输出 $n$ 个 `#`。

复杂度：时间 $O(n^2)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..n) {
        print("#")
    }
    println()
    for (_ in 0..(n - 2)) {
        print("#")
        for (_ in 0..(n - 2)) {
            print(" ")
        }
        println("#")
    }
    for (_ in 0..n) {
        print("#")
    }
    println()
}
```
